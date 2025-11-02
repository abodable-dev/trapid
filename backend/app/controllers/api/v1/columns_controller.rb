module Api
  module V1
    class ColumnsController < ApplicationController
      before_action :set_table
      before_action :set_column, only: [:update, :destroy]

      # POST /api/v1/tables/:table_id/columns
      def create
        column = @table.columns.build(column_params)
        column.position = @table.columns.maximum(:position).to_i + 1

        if column.save
          # Rebuild the database table with the new column
          # Reload table with columns association
          table_reloaded = Table.includes(:columns).find(@table.id)
          builder = TableBuilder.new(table_reloaded)
          result = builder.create_database_table

          if result[:success]
            # Reload the dynamic model to pick up new columns
            table_reloaded.reload_dynamic_model
            # Reset the connection's schema cache for this table
            ActiveRecord::Base.connection.schema_cache.clear_data_source_cache!(table_reloaded.database_table_name)

            render json: {
              success: true,
              column: column_json(column)
            }, status: :created
          else
            # Log the error for debugging
            Rails.logger.error "TableBuilder failed: #{result[:errors].inspect}"
            column.destroy
            render json: {
              success: false,
              errors: result[:errors]
            }, status: :unprocessable_entity
          end
        else
          render json: {
            success: false,
            errors: column.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/tables/:table_id/columns/:id
      def update
        if @column.update(column_params)
          # Rebuild the database table to reflect the changes
          table_reloaded = Table.includes(:columns).find(@table.id)
          builder = TableBuilder.new(table_reloaded)
          result = builder.create_database_table

          if result[:success]
            # Reload the dynamic model to pick up changes
            table_reloaded.reload_dynamic_model
            # Reset the connection's schema cache for this table
            ActiveRecord::Base.connection.schema_cache.clear_data_source_cache!(table_reloaded.database_table_name)

            render json: {
              success: true,
              column: column_json(@column)
            }
          else
            render json: {
              success: false,
              errors: result[:errors]
            }, status: :unprocessable_entity
          end
        else
          render json: {
            success: false,
            errors: @column.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/tables/:table_id/columns/:id
      def destroy
        @column.destroy

        # Rebuild the database table without this column
        table_reloaded = Table.includes(:columns).find(@table.id)
        builder = TableBuilder.new(table_reloaded)
        result = builder.create_database_table

        if result[:success]
          render json: { success: true }
        else
          render json: {
            success: false,
            errors: result[:errors]
          }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/tables/:table_id/columns/:id/lookup_options
      def lookup_options
        column = @table.columns.find(params[:id])

        unless column.column_type.in?(['lookup', 'multiple_lookups'])
          return render json: { error: 'Not a lookup column' }, status: :bad_request
        end

        unless column.lookup_table
          return render json: { error: 'Lookup table not configured' }, status: :unprocessable_entity
        end

        target_table = column.lookup_table
        records = target_table.dynamic_model.limit(1000).order(:id)

        options = records.map do |record|
          {
            id: record.id,
            display: record.send(column.lookup_display_column).to_s
          }
        rescue => e
          Rails.logger.error "Error reading lookup value: #{e.message}"
          { id: record.id, display: "[Error]" }
        end

        render json: {
          success: true,
          options: options
        }
      rescue => e
        render json: { error: e.message }, status: :internal_server_error
      end

      private

      def set_table
        @table = Table.includes(:columns).find(params[:table_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Table not found' }, status: :not_found
      end

      def set_column
        @column = @table.columns.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Column not found' }, status: :not_found
      end

      def column_params
        params.require(:column).permit(
          :name,
          :column_name,
          :column_type,
          :max_length,
          :min_length,
          :default_value,
          :description,
          :searchable,
          :is_title,
          :is_unique,
          :required,
          :min_value,
          :max_value,
          :validation_message,
          :lookup_table_id,
          :lookup_display_column,
          :is_multiple
        )
      end

      def column_json(column)
        {
          id: column.id,
          name: column.name,
          column_name: column.column_name,
          column_type: column.column_type,
          max_length: column.max_length,
          min_length: column.min_length,
          default_value: column.default_value,
          description: column.description,
          searchable: column.searchable,
          is_title: column.is_title,
          is_unique: column.is_unique,
          required: column.required,
          min_value: column.min_value,
          max_value: column.max_value,
          validation_message: column.validation_message,
          position: column.position,
          lookup_table_id: column.lookup_table_id,
          lookup_display_column: column.lookup_display_column,
          is_multiple: column.is_multiple
        }
      end
    end
  end
end
