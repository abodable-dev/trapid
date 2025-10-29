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
          builder = TableBuilder.new(@table.reload)
          result = builder.create_database_table

          if result[:success]
            render json: {
              success: true,
              column: column_json(column)
            }, status: :created
          else
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
          builder = TableBuilder.new(@table.reload)
          result = builder.create_database_table

          if result[:success]
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
        builder = TableBuilder.new(@table.reload)
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
