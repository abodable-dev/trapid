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

      # POST /api/v1/organization_onedrive/connect
      # Connect OneDrive using client credentials (Application permissions)
      def connect
        begin
          # Check if already connected
          existing_credential = OrganizationOneDriveCredential.active_credential

          if existing_credential&.valid_credential?
            return render json: {
              message: 'OneDrive is already connected',
              credential: existing_credential.as_json(only: [:id, :drive_id, :drive_name, :root_folder_path])
            }
          end

          # Authenticate using client credentials flow (no user interaction needed!)
          token_data = MicrosoftGraphClient.authenticate_as_application

          # Deactivate any existing credentials
          OrganizationOneDriveCredential.where(is_active: true).update_all(is_active: false)

          # Create new credential
          credential = OrganizationOneDriveCredential.create!(
            access_token: token_data[:access_token],
            token_expires_at: token_data[:expires_at],
            connected_by: current_user,
            is_active: true
          )

          # Initialize client and set up drive
          client = MicrosoftGraphClient.new(credential)

          # Create root folder for all jobs
          root_folder = client.create_jobs_root_folder("Trapid Jobs")

          render json: {
            message: 'OneDrive connected successfully!',
            credential: {
              id: credential.id,
              drive_id: credential.drive_id,
              drive_name: credential.drive_name,
              root_folder_path: credential.root_folder_path,
              root_folder_web_url: root_folder['webUrl']
            }
          }

        rescue MicrosoftGraphClient::AuthenticationError => e
          Rails.logger.error "OneDrive authentication failed: #{e.message}"
          render json: { error: "Authentication failed: #{e.message}" }, status: :unauthorized
        rescue MicrosoftGraphClient::APIError => e
          Rails.logger.error "OneDrive API error: #{e.message}"
          render json: { error: "OneDrive API error: #{e.message}" }, status: :bad_gateway
        rescue StandardError => e
          Rails.logger.error "Failed to connect OneDrive: #{e.message}"
          Rails.logger.error e.backtrace.join("\n")
          render json: { error: "Failed to connect to OneDrive: #{e.message}" }, status: :internal_server_error
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
    end
  end
end
