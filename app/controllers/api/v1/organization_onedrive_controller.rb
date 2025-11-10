module Api
  module V1
    class OrganizationOnedriveController < ApplicationController
      # GET /api/v1/organization_onedrive/status
      # Check if organization has OneDrive connected
      def status
        credential = OrganizationOneDriveCredential.active_credential

        if credential&.valid_credential?
          render json: {
            connected: true,
            drive_id: credential.drive_id,
            drive_name: credential.drive_name,
            root_folder_id: credential.root_folder_id,
            root_folder_path: credential.root_folder_path,
            root_folder_web_url: credential.metadata&.dig('root_folder_web_url'),
            connected_at: credential.created_at,
            connected_by: credential.connected_by&.as_json(only: [:id, :email]),
            metadata: credential.metadata
          }
        else
          render json: {
            connected: false,
            message: credential ? 'Credential expired or invalid' : 'Not connected'
          }
        end
      end

      # GET /api/v1/organization_onedrive/authorize
      # Start OAuth flow - returns authorization URL
      def authorize
        redirect_uri = "#{request.base_url}/api/v1/organization_onedrive/callback"

        auth_url = MicrosoftGraphClient.authorization_url(
          client_id: ENV['ONEDRIVE_CLIENT_ID'],
          redirect_uri: redirect_uri,
          scope: 'Files.ReadWrite.All Sites.ReadWrite.All offline_access'
        )

        render json: { auth_url: auth_url }
      end

      # GET /api/v1/organization_onedrive/callback
      # OAuth callback - exchange code for tokens
      def callback
        code = params[:code]

        unless code
          return render json: { error: 'Authorization code not provided' }, status: :bad_request
        end

        begin
          Rails.logger.info "=== OneDrive OAuth Callback Started ==="

          redirect_uri = "#{request.base_url}/api/v1/organization_onedrive/callback"

          # Exchange authorization code for tokens
          token_data = MicrosoftGraphClient.exchange_code_for_tokens(
            code: code,
            client_id: ENV['ONEDRIVE_CLIENT_ID'],
            client_secret: ENV['ONEDRIVE_CLIENT_SECRET'],
            redirect_uri: redirect_uri
          )

          Rails.logger.info "Token exchange successful"

          # Deactivate any existing credentials
          OrganizationOneDriveCredential.where(is_active: true).update_all(is_active: false)

          # Create new credential with refresh token
          credential = OrganizationOneDriveCredential.create!(
            access_token: token_data[:access_token],
            refresh_token: token_data[:refresh_token],
            token_expires_at: token_data[:expires_at],
            connected_by: current_user,
            is_active: true
          )

          Rails.logger.info "Credential created with ID: #{credential.id}"

          # Initialize client and set up drive
          client = MicrosoftGraphClient.new(credential)

          # Create root folder for all jobs
          Rails.logger.info "Creating root folder 'Trapid Jobs'..."
          root_folder = client.create_jobs_root_folder("Trapid Jobs")
          Rails.logger.info "Root folder created successfully"

          Rails.logger.info "=== OneDrive Connection Completed Successfully ==="

          # Redirect to frontend settings page with success message
          redirect_to "#{ENV['FRONTEND_URL']}/settings?onedrive=connected", allow_other_host: true

        rescue MicrosoftGraphClient::AuthenticationError => e
          Rails.logger.error "=== OneDrive Authentication Failed ==="
          Rails.logger.error "Error: #{e.message}"
          redirect_to "#{ENV['FRONTEND_URL']}/settings?onedrive=error&message=#{CGI.escape(e.message)}", allow_other_host: true
        rescue StandardError => e
          Rails.logger.error "=== OneDrive Connection Failed ==="
          Rails.logger.error "Error: #{e.message}"
          Rails.logger.error e.backtrace.join("\n")
          redirect_to "#{ENV['FRONTEND_URL']}/settings?onedrive=error&message=#{CGI.escape(e.message)}", allow_other_host: true
        end
      end

      # DELETE /api/v1/organization_onedrive/disconnect
      # Disconnect OneDrive for organization
      def disconnect
        credential = OrganizationOneDriveCredential.active_credential

        if credential
          credential.deactivate!
          render json: { message: 'OneDrive disconnected successfully' }
        else
          render json: { message: 'OneDrive was not connected' }, status: :not_found
        end
      end

      # POST /api/v1/organization_onedrive/create_job_folders
      # Create folder structure for a specific job
      def create_job_folders
        construction_id = params[:construction_id]
        construction = Construction.find(construction_id)

        credential = OrganizationOneDriveCredential.active_credential

        unless credential&.valid_credential?
          return render json: { error: 'OneDrive not connected. Please connect in Settings first.' }, status: :unauthorized
        end

        # Get folder template (use default or specified)
        template_id = params[:template_id]
        template = if template_id
          FolderTemplate.find(template_id)
        else
          FolderTemplate.where(is_system_default: true, is_active: true).first
        end

        unless template
          return render json: { error: 'No folder template found' }, status: :not_found
        end

        begin
          client = MicrosoftGraphClient.new(credential)

          # Check if job folder already exists
          existing_folder = client.find_job_folder(construction)

          if existing_folder
            return render json: {
              message: 'Folder structure already exists for this job',
              job_folder: existing_folder,
              web_url: existing_folder['webUrl']
            }
          end

          # Create folder structure for this job
          job_folder = client.create_job_folder_structure(construction, template)

          # Mark credential as synced
          credential.mark_synced!

          render json: {
            message: 'Folder structure created successfully',
            job_folder: job_folder,
            folder_path: "#{credential.root_folder_path}/#{job_folder['name']}",
            web_url: job_folder['webUrl']
          }

        rescue MicrosoftGraphClient::AuthenticationError => e
          render json: { error: "Authentication failed: #{e.message}" }, status: :unauthorized
        rescue MicrosoftGraphClient::APIError => e
          render json: { error: "OneDrive API error: #{e.message}" }, status: :bad_gateway
        rescue StandardError => e
          Rails.logger.error "Failed to create job folders: #{e.message}"
          Rails.logger.error e.backtrace.join("\n")
          render json: { error: "Failed to create folders: #{e.message}" }, status: :internal_server_error
        end
      end

      # GET /api/v1/organization_onedrive/job_folders
      # List folders and files for a specific job
      def list_job_items
        construction_id = params[:construction_id]
        construction = Construction.find(construction_id)

        credential = OrganizationOneDriveCredential.active_credential

        unless credential&.valid_credential?
          return render json: { error: 'OneDrive not connected' }, status: :unauthorized
        end

        begin
          client = MicrosoftGraphClient.new(credential)

          # Find the job folder
          job_folder = client.find_job_folder(construction)

          unless job_folder
            return render json: {
              error: 'Job folder not found. Please create the folder structure first.',
              job_folder_exists: false
            }, status: :not_found
          end

          # Get folder ID from params or use job folder
          folder_id = params[:folder_id] || job_folder['id']

          items = client.list_folder_items(folder_id)

          render json: {
            items: items['value'],
            count: items['value']&.length || 0,
            job_folder_id: job_folder['id'],
            job_folder_web_url: job_folder['webUrl']
          }

        rescue MicrosoftGraphClient::AuthenticationError => e
          render json: { error: "Authentication failed: #{e.message}" }, status: :unauthorized
        rescue MicrosoftGraphClient::APIError => e
          render json: { error: "OneDrive API error: #{e.message}" }, status: :bad_gateway
        rescue StandardError => e
          Rails.logger.error "Failed to list items: #{e.message}"
          render json: { error: "Failed to list items: #{e.message}" }, status: :internal_server_error
        end
      end

      # POST /api/v1/organization_onedrive/upload
      # Upload file to OneDrive
      def upload
        construction_id = params[:construction_id]
        construction = Construction.find(construction_id)

        credential = OrganizationOneDriveCredential.active_credential

        unless credential&.valid_credential?
          return render json: { error: 'OneDrive not connected' }, status: :unauthorized
        end

        uploaded_file = params[:file]
        folder_id = params[:folder_id]

        unless uploaded_file
          return render json: { error: 'No file provided' }, status: :bad_request
        end

        unless folder_id
          return render json: { error: 'No folder_id provided' }, status: :bad_request
        end

        begin
          client = MicrosoftGraphClient.new(credential)

          # Check file size to determine upload method
          file_size = uploaded_file.size

          if file_size < 4.megabytes
            # Simple upload for small files
            result = client.upload_file(uploaded_file, folder_id, uploaded_file.original_filename)
          else
            # For large files, create upload session
            session_data = client.create_upload_session(folder_id, uploaded_file.original_filename, file_size)

            # Return upload session URL for client to handle chunked upload
            return render json: {
              upload_session: session_data,
              message: 'Upload session created. Use upload URL for chunked upload.'
            }
          end

          render json: {
            message: 'File uploaded successfully',
            file: result
          }

        rescue MicrosoftGraphClient::AuthenticationError => e
          render json: { error: "Authentication failed: #{e.message}" }, status: :unauthorized
        rescue MicrosoftGraphClient::APIError => e
          render json: { error: "OneDrive API error: #{e.message}" }, status: :bad_gateway
        rescue StandardError => e
          Rails.logger.error "Failed to upload file: #{e.message}"
          render json: { error: "Failed to upload file: #{e.message}" }, status: :internal_server_error
        end
      end

      # GET /api/v1/organization_onedrive/download
      # Download file from OneDrive
      def download
        credential = OrganizationOneDriveCredential.active_credential

        unless credential&.valid_credential?
          return render json: { error: 'OneDrive not connected' }, status: :unauthorized
        end

        file_id = params[:file_id]

        unless file_id
          return render json: { error: 'No file_id provided' }, status: :bad_request
        end

        begin
          client = MicrosoftGraphClient.new(credential)

          # Get file metadata first
          file_metadata = client.get_file(file_id)

          # Download file content
          file_content = client.download_file(file_id)

          # Send file to user
          send_data file_content,
            filename: file_metadata['name'],
            type: file_metadata['file']&.dig('mimeType') || 'application/octet-stream',
            disposition: 'attachment'

        rescue MicrosoftGraphClient::AuthenticationError => e
          render json: { error: "Authentication failed: #{e.message}" }, status: :unauthorized
        rescue MicrosoftGraphClient::APIError => e
          render json: { error: "OneDrive API error: #{e.message}" }, status: :bad_gateway
        rescue StandardError => e
          Rails.logger.error "Failed to download file: #{e.message}"
          render json: { error: "Failed to download file: #{e.message}" }, status: :internal_server_error
        end
      end

      # POST /api/v1/organization_onedrive/sync_pricebook_images
      # Sync images from OneDrive folder to pricebook items
      def sync_pricebook_images
        credential = OrganizationOneDriveCredential.active_credential

        unless credential&.valid_credential?
          return render json: { error: 'OneDrive not connected. Please connect in Settings first.' }, status: :unauthorized
        end

        folder_path = params[:folder_path] || "Pricebook Images"

        begin
          # Get organization (you may need to adjust this based on your auth)
          organization = current_user&.organization || Organization.first

          # Run sync service
          sync_service = OnedrivePricebookSyncService.new(organization, folder_path)
          result = sync_service.sync

          if result[:success]
            render json: {
              success: true,
              message: "Synced #{result[:matched]} images successfully",
              matched: result[:matched],
              unmatched_files: result[:unmatched_files],
              unmatched_items: result[:unmatched_items],
              errors: result[:errors]
            }
          else
            render json: {
              success: false,
              error: result[:error]
            }, status: :unprocessable_entity
          end

        rescue StandardError => e
          Rails.logger.error "Failed to sync pricebook images: #{e.message}"
          Rails.logger.error e.backtrace.join("\n")
          render json: { error: "Failed to sync images: #{e.message}" }, status: :internal_server_error
        end
      end
    end
  end
end
