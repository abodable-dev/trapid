module Api
  module V1
    class TablesController < ApplicationController
      before_action :set_table, only: [:show, :update, :destroy]

      # GET /api/v1/tables
      def index
        tables = Table.includes(:columns).all
        render json: {
          success: true,
          tables: tables.map { |t| table_json(t) }
        }
      end

      # GET /api/v1/tables/:id
      def show
        render json: {
          success: true,
          table: table_json(@table, include_columns: true)
        }
      end

      # POST /api/v1/tables
      def create
        table = Table.new(table_params)

        if table.save
          render json: {
            success: true,
            table: table_json(table)
          }, status: :created
        else
          render json: {
            success: false,
            errors: table.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/tables/:id
      def update
        if @table.update(table_params)
          render json: {
            success: true,
            table: table_json(@table)
          }
        else
          render json: {
            success: false,
            errors: @table.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/tables/:id
      def destroy
        # Drop the database table first
        builder = TableBuilder.new(@table)
        drop_result = builder.drop_database_table

        unless drop_result[:success]
          return render json: {
            success: false,
            errors: drop_result[:errors]
          }, status: :unprocessable_entity
        end

        @table.destroy
        render json: { success: true }
      end

      private

      def set_table
        @table = Table.includes(:columns).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Table not found' }, status: :not_found
      end

      def table_params
        params.require(:table).permit(
          :name,
          :singular_name,
          :plural_name,
          :icon,
          :title_column,
          :searchable,
          :description
        )
      end

      def table_json(table, include_columns: false)
        json = {
          id: table.id,
          name: table.name,
          singular_name: table.singular_name,
          plural_name: table.plural_name,
          database_table_name: table.database_table_name,
          icon: table.icon,
          title_column: table.title_column,
          searchable: table.searchable,
          description: table.description,
          created_at: table.created_at,
          updated_at: table.updated_at
        }

        if include_columns
          json[:columns] = table.columns.order(:position).map do |col|
            {
              id: col.id,
              name: col.name,
              column_name: col.column_name,
              column_type: col.column_type,
              max_length: col.max_length,
              min_length: col.min_length,
              default_value: col.default_value,
              description: col.description,
              searchable: col.searchable,
              is_title: col.is_title,
              is_unique: col.is_unique,
              required: col.required,
              min_value: col.min_value,
              max_value: col.max_value,
              validation_message: col.validation_message,
              position: col.position,
              lookup_table_id: col.lookup_table_id,
              lookup_display_column: col.lookup_display_column,
              is_multiple: col.is_multiple
            }
          end

          # Get record count
          begin
            json[:record_count] = table.dynamic_model.count
          rescue
            json[:record_count] = 0
          end
        end

        json
      end
    end
  end
end
