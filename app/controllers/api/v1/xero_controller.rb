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
      # Triggers a full two-way contact sync between Trapid and Xero
      def sync_contacts
        begin
          Rails.logger.info("Contact sync initiated via API")

          sync_service = XeroContactSyncService.new
          result = sync_service.sync

          if result[:success]
            render json: {
              success: true,
              message: 'Contact sync completed successfully',
              data: {
                stats: result[:stats],
                synced_at: result[:synced_at]
              }
            }
          else
            render json: {
              success: false,
              error: result[:error],
              stats: result[:stats]
            }, status: :unprocessable_entity
          end
        rescue XeroApiClient::AuthenticationError => e
          Rails.logger.error("Xero sync_contacts auth error: #{e.message}")
          render json: {
            success: false,
            error: 'Not authenticated with Xero. Please connect to Xero first.'
          }, status: :unauthorized
        rescue XeroApiClient::RateLimitError => e
          Rails.logger.error("Xero sync_contacts rate limit: #{e.message}")
          render json: {
            success: false,
            error: 'Xero API rate limit exceeded. Please try again later.'
          }, status: :too_many_requests
        rescue StandardError => e
          Rails.logger.error("Xero sync_contacts unexpected error: #{e.message}")
          Rails.logger.error(e.backtrace.join("\n"))
          render json: {
            success: false,
            error: "Contact sync failed: #{e.message}"
          }, status: :internal_server_error
        end
      end

      # GET /api/v1/xero/sync_status
      # Returns the last contact sync time and statistics
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

          render json: {
            success: true,
            data: {
              last_sync_at: last_synced_contact&.last_synced_at,
              total_contacts: total_contacts,
              synced_contacts: synced_contacts,
              sync_enabled_contacts: sync_enabled,
              contacts_with_errors: contacts_with_errors,
              sync_percentage: total_contacts.zero? ? 0 : ((synced_contacts.to_f / total_contacts) * 100).round(2)
            }
          }
        rescue StandardError => e
          Rails.logger.error("Xero sync_status error: #{e.message}")
          render json: {
            success: false,
            error: "Failed to get sync status"
          }, status: :internal_server_error
        end
      end
    end
  end
end
