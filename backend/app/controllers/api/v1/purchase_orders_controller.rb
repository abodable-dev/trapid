module Api
  module V1
    class PurchaseOrdersController < ApplicationController
      before_action :set_purchase_order, only: [:show, :update, :destroy, :approve, :send_to_supplier, :mark_received]

      # GET /api/v1/purchase_orders
      # Params: construction_id, supplier_id, status, search, sort_by, sort_direction, page, per_page
      def index
        @purchase_orders = PurchaseOrder.includes(:supplier, :construction).all

        # Filters
        @purchase_orders = @purchase_orders.by_construction(params[:construction_id])
        @purchase_orders = @purchase_orders.by_status(params[:status])
        @purchase_orders = @purchase_orders.where(supplier_id: params[:supplier_id]) if params[:supplier_id].present?

        # Search
        if params[:search].present?
          search_term = "%#{params[:search]}%"
          @purchase_orders = @purchase_orders.where(
            'purchase_order_number ILIKE ? OR description ILIKE ? OR ted_task ILIKE ?',
            search_term, search_term, search_term
          )
        end

        # Date range filter
        if params[:start_date].present? && params[:end_date].present?
          @purchase_orders = @purchase_orders.where(
            required_date: Date.parse(params[:start_date])..Date.parse(params[:end_date])
          )
        end

        # Sorting
        sort_by = params[:sort_by] || 'created_at'
        sort_direction = params[:sort_direction] || 'desc'
        allowed_sort_columns = %w[purchase_order_number total required_date status created_at]
        sort_column = allowed_sort_columns.include?(sort_by) ? sort_by : 'created_at'

        @purchase_orders = @purchase_orders.order("#{sort_column} #{sort_direction}")

        # Pagination
        page = params[:page]&.to_i || 1
        per_page = params[:per_page]&.to_i || 50
        total_count = @purchase_orders.count
        total_pages = (total_count.to_f / per_page).ceil

        @purchase_orders = @purchase_orders.limit(per_page).offset((page - 1) * per_page)

        render json: {
          purchase_orders: @purchase_orders.as_json(include: {
            supplier: { only: [:id, :name] },
            construction: { only: [:id, :title] },
            line_items: { include: { pricebook_item: { only: [:id, :item_code, :item_name] } } }
          }),
          pagination: {
            current_page: page,
            total_pages: total_pages,
            total_count: total_count,
            per_page: per_page
          }
        }
      end

      # GET /api/v1/purchase_orders/:id
      def show
        company_setting = CompanySetting.instance

        render json: {
          **@purchase_order.as_json(include: {
            supplier: { only: [:id, :name, :contact_person, :email, :phone, :address] },
            construction: { only: [:id, :title] },
            line_items: {
              include: { pricebook_item: { only: [:id, :item_code, :item_name, :current_price, :unit_of_measure] } }
            }
          }),
          company_setting: company_setting.as_json(only: [:company_name, :abn, :gst_number, :email, :phone, :address, :logo_url])
        }
      end

      # POST /api/v1/purchase_orders
      def create
        @purchase_order = PurchaseOrder.new(purchase_order_params)

        if @purchase_order.save
          render json: @purchase_order.as_json(include: :line_items), status: :created
        else
          render json: { errors: @purchase_order.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/purchase_orders/:id
      def update
        unless @purchase_order.can_edit?
          render json: { error: 'Cannot edit purchase order in current status' }, status: :unprocessable_entity
          return
        end

        if @purchase_order.update(purchase_order_params)
          render json: @purchase_order.as_json(include: :line_items)
        else
          render json: { errors: @purchase_order.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/purchase_orders/:id
      def destroy
        unless @purchase_order.can_cancel?
          render json: { error: 'Cannot delete purchase order in current status' }, status: :unprocessable_entity
          return
        end

        @purchase_order.destroy
        head :no_content
      end

      # POST /api/v1/purchase_orders/:id/approve
      def approve
        unless @purchase_order.can_approve?
          render json: { error: 'Purchase order cannot be approved in current status' }, status: :unprocessable_entity
          return
        end

        if @purchase_order.approve!
          render json: @purchase_order
        else
          render json: { errors: @purchase_order.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/purchase_orders/:id/send_to_supplier
      def send_to_supplier
        if @purchase_order.send_to_supplier!
          render json: @purchase_order
        else
          render json: { errors: @purchase_order.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/purchase_orders/:id/mark_received
      def mark_received
        if @purchase_order.mark_received!
          render json: @purchase_order
        else
          render json: { errors: @purchase_order.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_purchase_order
        @purchase_order = PurchaseOrder.includes(:line_items, :supplier, :construction).find(params[:id])
      end

      def purchase_order_params
        params.require(:purchase_order).permit(
          :construction_id,
          :supplier_id,
          :status,
          :description,
          :delivery_address,
          :special_instructions,
          :budget,
          :required_date,
          :ordered_date,
          :expected_delivery_date,
          :ted_task,
          :estimation_check,
          :part_payment,
          :amount_invoiced,
          :amount_paid,
          :xero_invoice_id,
          :xero_supplier,
          :xero_complete,
          :xero_amount_paid,
          :xero_amount_paid_exc_gst,
          :xero_paid_date,
          line_items_attributes: [
            :id,
            :pricebook_item_id,
            :description,
            :quantity,
            :unit_price,
            :notes,
            :line_number,
            :_destroy
          ]
        )
      end
    end
  end
end
