module Api
  module V1
    class TablesController < ApplicationController
      before_action :set_table, only: [:show, :update, :destroy]

      # GET /api/v1/tables
      def index
        tables = Table.includes(:columns).all

        # Preload all referencing columns to prevent N+1 queries
        table_ids = tables.pluck(:id)
        referencing_map = Column.where(lookup_table_id: table_ids)
                                .includes(:table)
                                .group_by(&:lookup_table_id)

        render json: {
          success: true,
          tables: tables.map { |t| table_json(t, include_record_count: true, referencing_map: referencing_map) }
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
          # Create the physical database table immediately
          # Even if it has no columns, it will have id and timestamps
          builder = TableBuilder.new(table)
          result = builder.create_database_table

          if result[:success]
            render json: {
              success: true,
              table: table_json(table)
            }, status: :created
          else
            # If database table creation fails, rollback the table record
            table.destroy
            render json: {
              success: false,
              errors: result[:errors]
            }, status: :unprocessable_entity
          end
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
        # Safety checks before deletion
        if @table.is_live
          return render json: {
            success: false,
            errors: ['Cannot delete a live table. Set it to draft first.']
          }, status: :unprocessable_entity
        end

        # Check if table has records
        begin
          record_count = @table.dynamic_model.count
          if record_count > 0
            return render json: {
              success: false,
              errors: ["Cannot delete a table that contains #{record_count} record(s). Delete all records first."]
            }, status: :unprocessable_entity
          end
        rescue => e
          Rails.logger.error "Error checking record count: #{e.message}"
        end

        # Check if other tables have lookup columns referencing this table
        referencing_columns = Column.where(lookup_table_id: @table.id).includes(:table)
        if referencing_columns.any?
          table_names = referencing_columns.map { |col| col.table.name }.uniq.join(', ')
          return render json: {
            success: false,
            errors: ["Cannot delete this table because it is referenced by lookup columns in: #{table_names}. Remove those lookup columns first."]
          }, status: :unprocessable_entity
        end

        # Wrap deletion in a transaction to ensure atomicity
        begin
          ActiveRecord::Base.transaction do
            # Drop the database table first
            builder = TableBuilder.new(@table)
            drop_result = builder.drop_database_table

            unless drop_result[:success]
              raise ActiveRecord::Rollback, drop_result[:errors].join(', ')
            end

            # Delete the table record (this will also cascade delete columns via dependent: :destroy)
            @table.destroy!
          end

          render json: { success: true }
        rescue ActiveRecord::Rollback => e
          render json: {
            success: false,
            errors: [e.message]
          }, status: :unprocessable_entity
        rescue => e
          Rails.logger.error "Error deleting table: #{e.message}"
          render json: {
            success: false,
            errors: ["Failed to delete table: #{e.message}"]
          }, status: :internal_server_error
        end
      end

      private

      def set_table
        # Support both ID and slug
        @table = if params[:id].to_i.to_s == params[:id]
          Table.includes(:columns).find(params[:id])
        else
          Table.includes(:columns).find_by!(slug: params[:id])
        end
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
          :description,
          :is_live
        )
      end

      def table_json(table, include_columns: false, include_record_count: false, referencing_map: nil)
        json = {
          id: table.id,
          name: table.name,
          slug: table.slug,
          singular_name: table.singular_name,
          plural_name: table.plural_name,
          database_table_name: table.database_table_name,
          icon: table.icon,
          title_column: table.title_column,
          searchable: table.searchable,
          description: table.description,
          is_live: table.is_live,
          created_at: table.created_at,
          updated_at: table.updated_at
        }

        if include_columns
          json[:columns] = table.columns.order(:position).map do |col|
            column_data = {
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

            # Add relationship information
            if col.lookup_table_id.present?
              column_data[:lookup_table_name] = col.lookup_table&.name
            end

            # Find columns that reference this table using preloaded data or query
            referencing_columns = if referencing_map
              referencing_map[table.id] || []
            else
              Column.where(lookup_table_id: table.id).includes(:table)
            end

            if referencing_columns.any?
              column_data[:referenced_by] = referencing_columns.map do |ref_col|
                {
                  table_id: ref_col.table_id,
                  table_name: ref_col.table.name,
                  column_name: ref_col.name
                }
              end
            end

            column_data
          end
        end

        if include_columns || include_record_count
          # Get record count
          begin
            json[:record_count] = table.dynamic_model.count
          rescue
            json[:record_count] = 0
          end
        end

        # Always include columns info for list view
        unless include_columns
          json[:columns] = table.columns.order(:position).map do |col|
            {
              id: col.id,
              name: col.name,
              column_type: col.column_type
            }
          end
        end

        json
      end
    end
  end
end
