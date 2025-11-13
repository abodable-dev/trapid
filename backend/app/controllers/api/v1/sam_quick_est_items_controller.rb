module Api
  module V1
    class SamQuickEstItemsController < ApplicationController
      before_action :set_sam_quick_est_item, only: [:show, :update, :destroy]

      # GET /api/v1/sam_quick_est
      def index
        @items = SamQuickEstItem.active

        # Apply search if provided
        @items = @items.search(params[:search]) if params[:search].present?

        # Pagination
        page = [params[:page]&.to_i || 1, 1].max
        limit = (params[:limit] || params[:per_page])&.to_i || 100
        limit = [[limit, 1].max, 1000].min

        offset = (page - 1) * limit
        total_count = @items.count

        # Apply pagination
        @items = @items.limit(limit).offset(offset)

        render json: {
          items: @items.map { |item|
            {
              id: item.id,
              item_code: item.item_code,
              item_name: item.item_name,
              unit_of_measure: item.unit_of_measure,
              current_price: item.current_price
            }
          },
          pagination: {
            page: page,
            limit: limit,
            total_count: total_count,
            total_pages: (total_count.to_f / limit).ceil
          }
        }
      end

      # GET /api/v1/sam_quick_est/:id
      def show
        render json: {
          id: @item.id,
          item_code: @item.item_code,
          item_name: @item.item_name,
          unit_of_measure: @item.unit_of_measure,
          current_price: @item.current_price
        }
      end

      # POST /api/v1/sam_quick_est
      def create
        @item = SamQuickEstItem.new(sam_quick_est_item_params)

        if @item.save
          render json: @item, status: :created
        else
          render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/sam_quick_est/:id
      def update
        if @item.update(sam_quick_est_item_params)
          render json: @item
        else
          render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/sam_quick_est/:id
      def destroy
        @item.update(is_active: false)
        head :no_content
      end

      # GET /api/v1/sam_quick_est/export
      def export
        items = SamQuickEstItem.active

        # Generate CSV
        csv_data = CSV.generate(headers: true) do |csv|
          csv << ['Item Code', 'Item Name', 'Unit', 'Price']

          items.each do |item|
            csv << [
              item.item_code,
              item.item_name,
              item.unit_of_measure,
              item.current_price
            ]
          end
        end

        # Create filename
        date = Date.today.strftime('%Y-%m-%d')
        filename = "sam_quick_est_#{date}.csv"

        send_data csv_data,
          filename: filename,
          type: 'text/csv',
          disposition: 'attachment'
      end

      private

      def set_sam_quick_est_item
        @item = SamQuickEstItem.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Sam Quick Est item not found" }, status: :not_found
      end

      def sam_quick_est_item_params
        params.require(:sam_quick_est_item).permit(
          :item_code,
          :item_name,
          :unit_of_measure,
          :current_price,
          :is_active
        )
      end
    end
  end
end
