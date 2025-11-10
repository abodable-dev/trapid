module Api
  module V1
    class XeroController < ApplicationController
      # GET /api/v1/xero/auth_url
      # Returns the Xero OAuth authorization URL
      def auth_url
        begin
          client = XeroApiClient.new
          url = client.authorization_url

          render json: {
            success: true,
            auth_url: url
          }
        rescue XeroApiClient::AuthenticationError => e
          Rails.logger.error("Xero auth_url error: #{e.message}")
          render json: {
            success: false,
            error: e.message
          }, status: :service_unavailable
        rescue StandardError => e
          Rails.logger.error("Xero auth_url unexpected error: #{e.message}")
          render json: {
            success: false,
            error: "Failed to generate authorization URL"
          }, status: :internal_server_error
        end
      end

      # POST /api/v1/xero/callback
      # Handles the OAuth callback and exchanges code for tokens
      def callback
        code = params[:code]

        unless code.present?
          return render json: {
            success: false,
            error: "Authorization code is required"
          }, status: :bad_request
        end

        begin
          client = XeroApiClient.new
          result = client.exchange_code_for_token(code)

          render json: {
            success: true,
            message: "Successfully connected to Xero",
            data: {
              tenant_name: result[:tenant_name],
              tenant_id: result[:tenant_id],
              expires_at: result[:expires_at]
            }
          }
        rescue XeroApiClient::AuthenticationError => e
          Rails.logger.error("Xero callback auth error: #{e.message}")
          render json: {
            success: false,
            error: e.message
          }, status: :unauthorized
        rescue XeroApiClient::ApiError => e
          Rails.logger.error("Xero callback API error: #{e.message}")
          render json: {
            success: false,
            error: e.message
          }, status: :unprocessable_entity
        rescue StandardError => e
          Rails.logger.error("Xero callback unexpected error: #{e.message}")
          render json: {
            success: false,
            error: "Failed to connect to Xero"
          }, status: :internal_server_error
        end
      end

      # GET /api/v1/xero/status
      # Returns the current Xero connection status
      def status
        begin
          client = XeroApiClient.new
          status = client.connection_status

          render json: {
            success: true,
            data: status
          }
        rescue StandardError => e
          Rails.logger.error("Xero status error: #{e.message}")
          render json: {
            success: false,
            error: "Failed to get connection status"
          }, status: :internal_server_error
        end
      end

      # DELETE /api/v1/xero/disconnect
      # Disconnects from Xero and removes stored credentials
      def disconnect
        begin
          client = XeroApiClient.new
          result = client.disconnect

          if result[:success]
            render json: {
              success: true,
              message: result[:message]
            }
          else
            render json: {
              success: false,
              error: result[:error]
            }, status: :unprocessable_entity
          end
        rescue StandardError => e
          Rails.logger.error("Xero disconnect error: #{e.message}")
          render json: {
            success: false,
            error: "Failed to disconnect from Xero"
          }, status: :internal_server_error
        end
      end

      # GET /api/v1/xero/invoices
      # Fetches invoices from Xero (with optional filters)
      def invoices
        begin
          client = XeroApiClient.new

          # Build query parameters
          query_params = {}

          # Filter by date range if provided
          if params[:from_date].present?
            query_params[:where] = "Date >= DateTime(#{params[:from_date]})"
          end

          # Filter by status
          if params[:status].present?
            status_filter = "Status == \"#{params[:status]}\""
            query_params[:where] = query_params[:where].present? ?
              "#{query_params[:where]} AND #{status_filter}" : status_filter
          end

          # Add pagination
          query_params[:page] = params[:page] || 1

          result = client.get('Invoices', query_params)

          if result[:success]
            invoices = result[:data]['Invoices'] || []

            render json: {
              success: true,
              data: {
                invoices: invoices,
                count: invoices.length
              }
            }
          else
            render json: {
              success: false,
              error: 'Failed to fetch invoices'
            }, status: :unprocessable_entity
          end
        rescue XeroApiClient::AuthenticationError => e
          Rails.logger.error("Xero invoices auth error: #{e.message}")
          render json: {
            success: false,
            error: 'Not authenticated with Xero'
          }, status: :unauthorized
        rescue XeroApiClient::ApiError => e
          Rails.logger.error("Xero invoices API error: #{e.message}")
          render json: {
            success: false,
            error: e.message
          }, status: :unprocessable_entity
        rescue StandardError => e
          Rails.logger.error("Xero invoices unexpected error: #{e.message}")
          render json: {
            success: false,
            error: "Failed to fetch invoices"
          }, status: :internal_server_error
        end
      end

      # POST /api/v1/xero/match_invoice
      # Matches a Xero invoice to a Purchase Order
      def match_invoice
        invoice_id = params[:invoice_id]
        purchase_order_id = params[:purchase_order_id]

        unless invoice_id.present?
          return render json: {
            success: false,
            error: "Invoice ID is required"
          }, status: :bad_request
        end

        begin
          # Fetch invoice from Xero
          client = XeroApiClient.new
          result = client.get("Invoices/#{invoice_id}")

          unless result[:success]
            return render json: {
              success: false,
              error: "Failed to fetch invoice from Xero"
            }, status: :unprocessable_entity
          end

          invoice_data = result[:data]['Invoices']&.first

          unless invoice_data
            return render json: {
              success: false,
              error: "Invoice not found in Xero"
            }, status: :not_found
          end

          # Match invoice to PO
          match_result = InvoiceMatchingService.call(
            invoice_data: invoice_data,
            purchase_order_id: purchase_order_id
          )

          if match_result[:success]
            render json: {
              success: true,
              message: match_result[:message],
              data: {
                purchase_order_id: match_result[:purchase_order].id,
                purchase_order_number: match_result[:purchase_order].purchase_order_number,
                payment_status: match_result[:payment_status],
                invoice_total: match_result[:invoice_total],
                po_total: match_result[:po_total],
                percentage: match_result[:percentage]
              }
            }
          else
            render json: {
              success: false,
              error: match_result[:error]
            }, status: :unprocessable_entity
          end
        rescue XeroApiClient::AuthenticationError => e
          Rails.logger.error("Xero match_invoice auth error: #{e.message}")
          render json: {
            success: false,
            error: 'Not authenticated with Xero'
          }, status: :unauthorized
        rescue StandardError => e
          Rails.logger.error("Xero match_invoice error: #{e.message}")
          render json: {
            success: false,
            error: "Failed to match invoice: #{e.message}"
          }, status: :internal_server_error
        end
      end

      # POST /api/v1/xero/webhook
      # Receives Xero webhooks (for future use)
      def webhook
        # TODO: Implement webhook signature verification
        # TODO: Process invoice.created, invoice.updated events

        render json: {
          success: true,
          message: 'Webhook received'
        }, status: :ok
      end

      # POST /api/v1/xero/sync_contacts
      # Queues a background job for full two-way contact sync between Trapid and Xero
      def sync_contacts
        begin
          Rails.logger.info("Contact sync job queued via API")

          # Check if Xero is authenticated before queuing
          client = XeroApiClient.new
          status = client.connection_status

          unless status[:connected] && !status[:expired]
            return render json: {
              success: false,
              error: 'Not authenticated with Xero. Please connect to Xero first.'
            }, status: :unauthorized
          end

          # Queue the background job
          job = XeroContactSyncJob.perform_later
          job_id = job.job_id

          # Initialize job metadata
          Rails.cache.write(
            "xero_sync_job_#{job_id}",
            {
              job_id: job_id,
              status: 'queued',
              queued_at: Time.current,
              total: 0,
              processed: 0
            },
            expires_in: 24.hours
          )

          render json: {
            success: true,
            message: 'Contact sync job queued successfully',
            data: {
              job_id: job_id,
              status: 'queued',
              queued_at: Time.current
            }
          }
        rescue XeroApiClient::AuthenticationError => e
          Rails.logger.error("Xero sync_contacts auth error: #{e.message}")
          render json: {
            success: false,
            error: 'Not authenticated with Xero. Please connect to Xero first.'
          }, status: :unauthorized
        rescue StandardError => e
          Rails.logger.error("Xero sync_contacts unexpected error: #{e.message}")
          Rails.logger.error(e.backtrace.join("\n"))
          render json: {
            success: false,
            error: "Failed to queue contact sync: #{e.message}"
          }, status: :internal_server_error
        end
      end

      # GET /api/v1/xero/sync_contacts/:job_id
      # Check the status of a contact sync job
      def sync_contacts_status
        job_id = params[:id]

        unless job_id.present?
          return render json: {
            success: false,
            error: 'Job ID is required'
          }, status: :bad_request
        end

        begin
          # Retrieve job metadata from cache
          job_data = Rails.cache.read("xero_sync_job_#{job_id}")

          if job_data.nil?
            return render json: {
              success: false,
              error: 'Job not found or expired'
            }, status: :not_found
          end

          render json: {
            success: true,
            data: job_data
          }
        rescue StandardError => e
          Rails.logger.error("Xero sync_contacts_status error: #{e.message}")
          render json: {
            success: false,
            error: "Failed to get job status"
          }, status: :internal_server_error
        end
      end

      # GET /api/v1/xero/sync_status
      # Returns the last contact sync time and statistics, plus any active job info
      def sync_status
        begin
          # Get the most recent sync time from contacts
          last_synced_contact = Contact.where.not(last_synced_at: nil)
                                       .order(last_synced_at: :desc)
                                       .first

          # Get sync statistics
          total_contacts = Contact.count
          synced_contacts = Contact.where.not(xero_id: nil).count
          sync_enabled = Contact.where(sync_with_xero: true).count
          contacts_with_errors = Contact.where.not(xero_sync_error: nil).count

          # Check for active sync jobs
          active_job = find_active_sync_job

          response_data = {
            last_sync_at: last_synced_contact&.last_synced_at,
            total_contacts: total_contacts,
            synced_contacts: synced_contacts,
            sync_enabled_contacts: sync_enabled,
            contacts_with_errors: contacts_with_errors,
            sync_percentage: total_contacts.zero? ? 0 : ((synced_contacts.to_f / total_contacts) * 100).round(2)
          }

          # Add active job info if present
          response_data[:active_job] = active_job if active_job

          render json: {
            success: true,
            data: response_data
          }
        rescue StandardError => e
          Rails.logger.error("Xero sync_status error: #{e.message}")
          render json: {
            success: false,
            error: "Failed to get sync status"
          }, status: :internal_server_error
        end
      end

      private

      # Determine what sync action was taken for a contact
      def determine_sync_action(contact)
        if contact.xero_sync_error.present?
          'Sync Failed'
        elsif contact.xero_id.present? && contact.created_at < contact.last_synced_at
          'Updated from Xero'
        elsif contact.xero_id.present?
          'Created from Xero'
        else
          'Synced to Xero'
        end
      end

      # Find the most recent active sync job
      def find_active_sync_job
        # This is a simple implementation using cache
        # In production, you might want to use a proper job tracking mechanism
        cache_keys = Rails.cache.instance_variable_get(:@data)&.keys || []
        job_keys = cache_keys.select { |k| k.to_s.start_with?('xero_sync_job_') }

        job_keys.each do |key|
          job_data = Rails.cache.read(key)
          if job_data && ['queued', 'processing'].include?(job_data[:status])
            return job_data
          end
        end

        nil
      end

      # GET /api/v1/xero/sync_history
      # Returns recent sync activity for contacts
      def sync_history
        begin
          # Get recently synced contacts (last 50)
          recent_syncs = Contact.where.not(last_synced_at: nil)
                                .order(last_synced_at: :desc)
                                .limit(50)
                                .select(:id, :full_name, :first_name, :last_name, :email, :last_synced_at, :xero_sync_error, :xero_id, :created_at, :updated_at)

          history_items = recent_syncs.map do |contact|
            {
              id: contact.id,
              contact_name: contact.full_name || "#{contact.first_name} #{contact.last_name}".strip,
              email: contact.email,
              synced_at: contact.last_synced_at,
              has_error: contact.xero_sync_error.present?,
              error_message: contact.xero_sync_error,
              action: determine_sync_action(contact),
              xero_id: contact.xero_id
            }
          end

          render json: {
            success: true,
            history: history_items
          }
        rescue StandardError => e
          Rails.logger.error("Xero sync_history error: #{e.message}")
          render json: {
            success: false,
            error: "Failed to fetch sync history"
          }, status: :internal_server_error
        end
      end

      # GET /api/v1/xero/tax_rates
      # Fetches and syncs tax rates from Xero
      def tax_rates
        begin
          client = XeroApiClient.new
          result = client.get_tax_rates

          if result[:success]
            render json: {
              success: true,
              tax_rates: result[:tax_rates].map { |tr|
                {
                  code: tr.code,
                  name: tr.name,
                  rate: tr.rate,
                  display_rate: tr.display_rate,
                  tax_type: tr.tax_type
                }
              }
            }
          else
            render json: {
              success: false,
              error: result[:error]
            }, status: :unprocessable_entity
          end
        rescue XeroApiClient::AuthenticationError => e
          Rails.logger.error("Xero tax_rates auth error: #{e.message}")
          render json: {
            success: false,
            error: 'Not authenticated with Xero'
          }, status: :unauthorized
        rescue StandardError => e
          Rails.logger.error("Xero tax_rates error: #{e.message}")
          render json: {
            success: false,
            error: 'Failed to fetch tax rates'
          }, status: :internal_server_error
        end
      end
    end
  end
end
