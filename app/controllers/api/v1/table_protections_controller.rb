module Api
  module V1
    class TableProtectionsController < ApplicationController
      before_action :require_schema_edit_permission
      before_action :set_table_protection, only: [:show, :update, :destroy]

      # GET /api/v1/table_protections
      def index
        protections = TableProtection.all.order(:table_name)

        # Also get list of all database tables for reference
        all_tables = ActiveRecord::Base.connection.tables.reject do |table|
          table.start_with?('ar_internal_') || table == 'schema_migrations'
        end.sort

        render json: {
          success: true,
          protections: protections.map { |p| protection_json(p) },
          all_tables: all_tables
        }
      end

      # GET /api/v1/table_protections/:id
      def show
        render json: {
          success: true,
          protection: protection_json(@protection)
        }
      end

      # POST /api/v1/table_protections
      def create
        protection = TableProtection.new(protection_params)

        if protection.save
          render json: {
            success: true,
            protection: protection_json(protection),
            message: "Table '#{protection.table_name}' is now protected"
          }, status: :created
        else
          render json: {
            success: false,
            errors: protection.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/table_protections/:id
      def update
        if @protection.update(protection_params)
          status_message = @protection.is_protected? ? "protected" : "unprotected"
          render json: {
            success: true,
            protection: protection_json(@protection),
            message: "Table '#{@protection.table_name}' is now #{status_message}"
          }
        else
          render json: {
            success: false,
            errors: @protection.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/table_protections/:id
      def destroy
        table_name = @protection.table_name
        @protection.destroy

        render json: {
          success: true,
          message: "Protection removed from table '#{table_name}'"
        }
      end

      # POST /api/v1/table_protections/protect_table
      # Convenience endpoint to protect a table by name
      def protect_table
        table_name = params[:table_name]

        if table_name.blank?
          return render json: {
            success: false,
            error: 'table_name is required'
          }, status: :bad_request
        end

        # Check if table exists in database
        unless ActiveRecord::Base.connection.table_exists?(table_name)
          return render json: {
            success: false,
            error: "Table '#{table_name}' does not exist in the database"
          }, status: :not_found
        end

        # Create or update protection
        protection = TableProtection.find_or_initialize_by(table_name: table_name)
        protection.is_protected = true
        protection.description ||= params[:description]

        if protection.save
          render json: {
            success: true,
            protection: protection_json(protection),
            message: "Table '#{table_name}' is now protected"
          }
        else
          render json: {
            success: false,
            errors: protection.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/table_protections/unprotect_table
      # Convenience endpoint to unprotect a table by name
      def unprotect_table
        table_name = params[:table_name]

        if table_name.blank?
          return render json: {
            success: false,
            error: 'table_name is required'
          }, status: :bad_request
        end

        protection = TableProtection.find_by(table_name: table_name)

        if protection
          if protection.update(is_protected: false)
            render json: {
              success: true,
              protection: protection_json(protection),
              message: "Table '#{table_name}' is no longer protected"
            }
          else
            render json: {
              success: false,
              errors: protection.errors.full_messages
            }, status: :unprocessable_entity
          end
        else
          render json: {
            success: true,
            message: "Table '#{table_name}' was not protected"
          }
        end
      end

      # GET /api/v1/table_protections/check/:table_name
      # Check if a specific table is protected
      def check
        table_name = params[:table_name]

        if table_name.blank?
          return render json: {
            success: false,
            error: 'table_name is required'
          }, status: :bad_request
        end

        is_protected = TableProtection.table_protected?(table_name)
        protection = TableProtection.find_by(table_name: table_name)

        render json: {
          success: true,
          table_name: table_name,
          is_protected: is_protected,
          protection: protection ? protection_json(protection) : nil
        }
      end

      private

      def set_table_protection
        @protection = TableProtection.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Table protection not found' }, status: :not_found
      end

      def protection_params
        params.require(:table_protection).permit(:table_name, :is_protected, :description)
      end

      def require_schema_edit_permission
        unless current_user&.can_edit_table_schema?
          render json: {
            success: false,
            errors: ['Unauthorized. Table protection management requires admin access.']
          }, status: :forbidden
        end
      end

      def protection_json(protection)
        # Get table metadata if it exists
        table_exists = ActiveRecord::Base.connection.table_exists?(protection.table_name)
        record_count = nil

        if table_exists
          begin
            quoted_table = ActiveRecord::Base.connection.quote_table_name(protection.table_name)
            record_count = ActiveRecord::Base.connection.select_value("SELECT COUNT(*) FROM #{quoted_table}").to_i
          rescue => e
            Rails.logger.error "Error getting record count for #{protection.table_name}: #{e.message}"
          end
        end

        {
          id: protection.id,
          table_name: protection.table_name,
          is_protected: protection.is_protected,
          description: protection.description,
          editable: protection.editable?,
          table_exists: table_exists,
          record_count: record_count,
          created_at: protection.created_at,
          updated_at: protection.updated_at
        }
      end
    end
  end
end
