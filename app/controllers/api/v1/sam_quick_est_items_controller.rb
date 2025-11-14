module Api
  module V1
    class SamQuickEstItemsController < ApplicationController
      skip_before_action :authorize_request
      before_action :set_sam_quick_est_item, only: [:show, :update, :destroy]

      # GET /api/v1/sam_quick_est
      def index
        @items = SamQuickEstItem.all

        # Apply search if provided
        @items = @items.search(params[:search]) if params[:search].present?

        # Sort by claude_estimate descending (nulls last)
        @items = @items.order(Arel.sql('claude_estimate DESC NULLS LAST'))

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
              claude_estimate: item.claude_estimate
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
          claude_estimate: @item.claude_estimate
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
        @item.destroy
        head :no_content
      end

      # GET /api/v1/sam_quick_est/export
      def export
        items = SamQuickEstItem.all

        # Generate CSV
        csv_data = CSV.generate(headers: true) do |csv|
          csv << ['Item Code', 'Item Name', 'Claude Estimate']

          items.each do |item|
            csv << [
              item.item_code,
              item.item_name,
              item.claude_estimate
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
          :claude_estimate
        )
      end
    end
  end
end
