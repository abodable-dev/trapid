module Api
  module V1
    class RecordsController < ApplicationController
      before_action :set_table

      # GET /api/v1/tables/:table_id/records
      def index
        page = (params[:page] || 1).to_i
        per_page = (params[:per_page] || 50).to_i
        search = params[:search]
        sort_by = params[:sort_by]
        sort_direction = params[:sort_direction] || 'asc'

        model = @table.dynamic_model
        query = model.all

        # Apply search filter
        if search.present?
          searchable_columns = @table.columns.where(searchable: true).pluck(:column_name)
          if searchable_columns.any?
            search_conditions = searchable_columns.map { |col| "#{col} ILIKE :search" }.join(' OR ')
            query = query.where(search_conditions, search: "%#{search}%")
          end
        end

        # Apply sorting
        if sort_by.present? && @table.columns.exists?(column_name: sort_by)
          query = query.order("#{sort_by} #{sort_direction}")
        else
          query = query.order(created_at: :desc)
        end

        # Paginate
        total_count = query.count
        records = query.offset((page - 1) * per_page).limit(per_page)

        render json: {
          success: true,
          records: records.map { |r| record_to_json(r) },
          pagination: {
            page: page,
            per_page: per_page,
            total_count: total_count,
            total_pages: (total_count.to_f / per_page).ceil
          }
        }
      rescue => e
        render json: { error: e.message }, status: :internal_server_error
      end

      # GET /api/v1/tables/:table_id/records/:id
      def show
        model = @table.dynamic_model
        record = model.find(params[:id])

        render json: {
          success: true,
          record: record_to_json(record)
        }
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Record not found' }, status: :not_found
      end

      # POST /api/v1/tables/:table_id/records
      def create
        model = @table.dynamic_model
        attributes = record_params

        record = model.new(attributes)

        if record.save
          render json: {
            success: true,
            record: record_to_json(record)
          }, status: :created
        else
          render json: {
            success: false,
            errors: record.errors.full_messages
          }, status: :unprocessable_entity
        end
      rescue => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      # PATCH/PUT /api/v1/tables/:table_id/records/:id
      def update
        model = @table.dynamic_model
        record = model.find(params[:id])
        attributes = record_params

        if record.update(attributes)
          render json: {
            success: true,
            record: record_to_json(record)
          }
        else
          render json: {
            success: false,
            errors: record.errors.full_messages
          }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Record not found' }, status: :not_found
      rescue => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      # DELETE /api/v1/tables/:table_id/records/:id
      def destroy
        model = @table.dynamic_model
        record = model.find(params[:id])

        record.destroy
        render json: { success: true }
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Record not found' }, status: :not_found
      end

      private

      def set_table
        @table = Table.includes(:columns).find(params[:table_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Table not found' }, status: :not_found
      end

      def record_params
        # Get all column names for this table
        column_names = @table.columns.pluck(:column_name)
        params.require(:record).permit(*column_names)
      end

      def record_to_json(record)
        json = {
          id: record.id,
          created_at: record.created_at,
          updated_at: record.updated_at
        }

        # Add all column values
        @table.columns.includes(:lookup_table).each do |column|
          value = record.send(column.column_name)

          # Handle lookup columns - return both ID and display value
          if column.column_type == 'lookup' && value.present?
            begin
              related_record = column.lookup_table.dynamic_model.find_by(id: value)
              json[column.column_name] = {
                id: value,
                display: related_record ? related_record.send(column.lookup_display_column).to_s : "[Deleted]"
              }
            rescue => e
              Rails.logger.error "Error loading lookup value for #{column.column_name}: #{e.message}"
              json[column.column_name] = { id: value, display: "[Error]" }
            end
          else
            json[column.column_name] = value
          end
        end

        json
      end
    end
  end
end
