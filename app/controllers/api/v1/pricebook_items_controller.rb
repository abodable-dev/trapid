module Api
  module V1
    class PricebookItemsController < ApplicationController
      before_action :set_pricebook_item, only: [:show, :update, :destroy, :history]

      # GET /api/v1/pricebook
      def index
        @items = PricebookItem.active

        # Apply search
        @items = @items.search(params[:search]) if params[:search].present?

        # Apply filters
        @items = @items.by_category(params[:category]) if params[:category].present?
        @items = @items.by_supplier(params[:supplier_id]) if params[:supplier_id].present?
        @items = @items.price_range(params[:min_price], params[:max_price])
        @items = @items.needs_pricing if params[:needs_pricing] == "true"

        # Pagination
        page = params[:page]&.to_i || 1
        limit = params[:limit]&.to_i || 100
        offset = (page - 1) * limit

        total_count = @items.count
        @items = @items.limit(limit).offset(offset)

        render json: {
          items: @items.as_json(include: { supplier: { only: [:id, :name] } }),
          pagination: {
            page: page,
            limit: limit,
            total_count: total_count,
            total_pages: (total_count.to_f / limit).ceil
          },
          filters: {
            categories: PricebookItem.categories,
            suppliers: Supplier.active.pluck(:id, :name)
          }
        }
      end

      # GET /api/v1/pricebook/:id
      def show
        render json: @item.as_json(
          include: {
            supplier: { only: [:id, :name, :email, :phone, :rating] },
            price_histories: {
              only: [:id, :old_price, :new_price, :change_reason, :created_at],
              include: { supplier: { only: [:id, :name] } }
            }
          }
        )
      end

      # POST /api/v1/pricebook
      def create
        @item = PricebookItem.new(pricebook_item_params)

        if @item.save
          render json: @item, status: :created
        else
          render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/pricebook/:id
      def update
        if @item.update(pricebook_item_params)
          render json: @item
        else
          render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/pricebook/:id
      def destroy
        @item.update(is_active: false)
        head :no_content
      end

      # GET /api/v1/pricebook/:id/history
      def history
        histories = @item.price_histories.recent.includes(:supplier)
        render json: histories.as_json(include: { supplier: { only: [:id, :name] } })
      end

      # PATCH /api/v1/pricebook/bulk_update
      def bulk_update
        updates = params[:updates] || []
        results = { success: [], errors: [] }

        updates.each do |update|
          item = PricebookItem.find_by(id: update[:id])
          if item && item.update(update.permit(:current_price, :supplier_id, :notes, :category))
            results[:success] << item.id
          else
            results[:errors] << { id: update[:id], errors: item&.errors&.full_messages || ["Item not found"] }
          end
        end

        render json: results
      end

      # POST /api/v1/pricebook/import
      def import
        unless params[:file]
          return render json: { error: "No file provided" }, status: :unprocessable_entity
        end

        file = params[:file]
        temp_file = Tempfile.new(['pricebook_import', '.csv'])

        begin
          # Save uploaded file
          temp_file.write(file.read)
          temp_file.rewind

          # Import options
          options = {
            skip_missing_prices: params[:skip_missing_prices] == 'true',
            create_suppliers: params[:create_suppliers] != 'false',
            create_categories: params[:create_categories] != 'false',
            update_existing: params[:update_existing] == 'true'
          }

          # Run import service
          import_service = PricebookImportService.new(temp_file.path, options)
          result = import_service.import

          render json: result
        ensure
          temp_file.close
          temp_file.unlink
        end
      end

      # POST /api/v1/pricebook/preview
      def preview
        unless params[:file]
          return render json: { error: "No file provided" }, status: :unprocessable_entity
        end

        file = params[:file]
        temp_file = Tempfile.new(['pricebook_preview', '.csv'])

        begin
          temp_file.write(file.read)
          temp_file.rewind

          import_service = PricebookImportService.new(temp_file.path)
          result = import_service.preview(params[:limit]&.to_i || 10)

          render json: result
        ensure
          temp_file.close
          temp_file.unlink
        end
      end

      private

      def set_pricebook_item
        @item = PricebookItem.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Price book item not found" }, status: :not_found
      end

      def pricebook_item_params
        params.require(:pricebook_item).permit(
          :item_code,
          :item_name,
          :category,
          :unit_of_measure,
          :current_price,
          :supplier_id,
          :brand,
          :notes,
          :is_active,
          :needs_pricing_review
        )
      end
    end
  end
end
