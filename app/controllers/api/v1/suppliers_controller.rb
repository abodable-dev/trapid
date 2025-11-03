module Api
  module V1
    class SuppliersController < ApplicationController
      before_action :set_supplier, only: [:show, :update, :destroy]

      # GET /api/v1/suppliers
      def index
        @suppliers = Supplier.all

        # Filter by active status
        @suppliers = @suppliers.active if params[:active] == "true"

        # Search by name
        if params[:search].present?
          @suppliers = @suppliers.where("name ILIKE ?", "%#{params[:search]}%")
        end

        # Sorting
        case params[:sort_by]
        when "rating"
          @suppliers = @suppliers.by_rating
        when "response_rate"
          @suppliers = @suppliers.by_response_rate
        else
          @suppliers = @suppliers.order(:name)
        end

        render json: @suppliers.as_json(
          include: { pricebook_items: { only: [:id, :item_code, :item_name, :current_price] } }
        )
      end

      # GET /api/v1/suppliers/:id
      def show
        render json: @supplier.as_json(
          include: {
            pricebook_items: { only: [:id, :item_code, :item_name, :category, :current_price] }
          }
        )
      end

      # POST /api/v1/suppliers
      def create
        @supplier = Supplier.new(supplier_params)

        if @supplier.save
          render json: @supplier, status: :created
        else
          render json: { errors: @supplier.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/suppliers/:id
      def update
        if @supplier.update(supplier_params)
          render json: @supplier
        else
          render json: { errors: @supplier.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/suppliers/:id
      def destroy
        @supplier.update(is_active: false)
        head :no_content
      end

      private

      def set_supplier
        @supplier = Supplier.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Supplier not found" }, status: :not_found
      end

      def supplier_params
        params.require(:supplier).permit(
          :name,
          :contact_person,
          :email,
          :phone,
          :address,
          :rating,
          :response_rate,
          :avg_response_time,
          :notes,
          :is_active
        )
      end
    end
  end
end
