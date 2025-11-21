module Api
  module V1
    class CompanyXeroConnectionsController < ApplicationController
      before_action :set_connection, only: [:show, :update, :destroy, :sync]

      def index
        @connections = CompanyXeroConnection.all.includes(:company)
        render json: {
          connections: @connections.as_json(
            include: :company,
            methods: [:token_expired?, :connected?]
          )
        }
      end

      def show
        render json: {
          connection: @connection.as_json(
            include: [:company, :xero_accounts],
            methods: [:token_expired?, :connected?]
          )
        }
      end

      def create
        @connection = CompanyXeroConnection.new(connection_params)

        if @connection.save
          render json: { connection: @connection, message: 'Xero connection created successfully' }, status: :created
        else
          render json: { errors: @connection.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @connection.update(connection_params)
          render json: { connection: @connection, message: 'Xero connection updated successfully' }
        else
          render json: { errors: @connection.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @connection.disconnect!
        render json: { message: 'Xero connection removed successfully' }
      end

      def sync
        begin
          service = XeroSyncService.new(@connection)
          result = service.sync_accounts

          render json: {
            message: 'Sync completed successfully',
            accounts_synced: result[:accounts_synced]
          }
        rescue StandardError => e
          render json: { error: "Sync failed: #{e.message}" }, status: :unprocessable_entity
        end
      end

      def auth_url
        company_id = params[:company_id]
        unless company_id
          return render json: { error: 'company_id required' }, status: :bad_request
        end

        company = Company.find(company_id)
        service = XeroAuthService.new
        auth_url = service.authorization_url(company_id)

        render json: { auth_url: auth_url }
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Company not found' }, status: :not_found
      rescue StandardError => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      def callback
        code = params[:code]
        company_id = params[:company_id]

        unless code && company_id
          return render json: { error: 'code and company_id required' }, status: :bad_request
        end

        service = XeroAuthService.new
        connection = service.handle_callback(code, company_id)

        render json: {
          message: 'Successfully connected to Xero',
          connection: connection.as_json(methods: [:connected?])
        }
      rescue StandardError => e
        render json: { error: "Authentication failed: #{e.message}" }, status: :unprocessable_entity
      end

      private

      def set_connection
        @connection = CompanyXeroConnection.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Xero connection not found' }, status: :not_found
      end

      def connection_params
        params.require(:connection).permit(
          :company_id, :tenant_id, :tenant_name, :access_token,
          :refresh_token, :token_expires_at
        )
      end
    end
  end
end
