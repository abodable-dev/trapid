module Api
  module V1
    class SuppliersController < ApplicationController
      before_action :set_supplier, only: [:show, :update, :destroy, :link_contact, :verify_match, :unlink_contact]

      # GET /api/v1/suppliers
      def index
        @suppliers = Supplier.includes(:contact, :contacts, :pricebook_items).all

        # Filter by active status
        @suppliers = @suppliers.active if params[:active] == "true"

        # Filter by match status
        case params[:match_status]
        when "matched"
          @suppliers = @suppliers.matched
        when "unmatched"
          @suppliers = @suppliers.unmatched
        when "needs_review"
          @suppliers = @suppliers.needs_review
        when "verified"
          @suppliers = @suppliers.verified
        end

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
        when "confidence"
          @suppliers = @suppliers.by_match_confidence
        else
          @suppliers = @suppliers.order(:name)
        end

        render json: {
          success: true,
          suppliers: @suppliers.as_json(
            include: {
              contact: { only: [:id, :full_name, :email, :mobile_phone] },
              contacts: { only: [:id, :full_name, :email, :mobile_phone, :office_phone] },
              pricebook_items: { only: [:id, :item_code, :item_name, :current_price] }
            },
            methods: [:match_confidence_label, :match_status, :contact_emails, :contact_phones]
          )
        }
      end

      # GET /api/v1/suppliers/unmatched
      def unmatched
        @suppliers = Supplier.unmatched.order(:name)

        render json: {
          success: true,
          suppliers: @suppliers.as_json(
            include: { pricebook_items: { only: [:id, :item_code] } }
          ),
          count: @suppliers.count
        }
      end

      # GET /api/v1/suppliers/needs_review
      def needs_review
        @suppliers = Supplier.needs_review.by_match_confidence

        render json: {
          success: true,
          suppliers: @suppliers.as_json(
            include: { contact: { only: [:id, :full_name, :email, :mobile_phone] } },
            methods: [:match_confidence_label]
          ),
          count: @suppliers.count
        }
      end

      # POST /api/v1/suppliers/auto_match
      def auto_match
        matcher = SupplierMatcher.new
        threshold = params[:threshold]&.to_f || 0.9
        verify_exact = params[:verify_exact] != "false"

        matched_count = matcher.auto_apply_matches(threshold: threshold, verify_exact: verify_exact)

        render json: {
          success: true,
          message: "Matched #{matched_count} suppliers",
          matched_count: matched_count
        }
      end

      # POST /api/v1/suppliers/:id/link_contact
      def link_contact
        contact = Contact.find_by(id: params[:contact_id])

        unless contact
          return render json: { success: false, error: "Contact not found" }, status: :not_found
        end

        if @supplier.update(
          contact_id: contact.id,
          match_type: "manual",
          confidence_score: 0.0,
          is_verified: true
        )
          render json: {
            success: true,
            supplier: @supplier.as_json(
              include: { contact: { only: [:id, :full_name, :email, :mobile_phone] } }
            )
          }
        else
          render json: { success: false, errors: @supplier.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/suppliers/:id/unlink_contact
      def unlink_contact
        if @supplier.update(
          contact_id: nil,
          match_type: nil,
          confidence_score: nil,
          is_verified: false
        )
          render json: { success: true, supplier: @supplier }
        else
          render json: { success: false, errors: @supplier.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/suppliers/:id/verify_match
      def verify_match
        if @supplier.update(is_verified: true)
          render json: { success: true, supplier: @supplier }
        else
          render json: { success: false, errors: @supplier.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/suppliers/:id
      def show
        render json: {
          success: true,
          supplier: @supplier.as_json(
            include: {
              contact: { only: [:id, :full_name, :email, :mobile_phone, :office_phone, :website, :tax_number, :xero_id, :sync_with_xero] },
              pricebook_items: { only: [:id, :item_code, :item_name, :category, :current_price] }
            },
            methods: [:match_confidence_label, :match_status]
          )
        }
      end

      # POST /api/v1/suppliers
      def create
        @supplier = Supplier.new(supplier_params)

        if @supplier.save
          render json: { success: true, supplier: @supplier }, status: :created
        else
          render json: { success: false, errors: @supplier.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/suppliers/:id
      def update
        if @supplier.update(supplier_params)
          render json: { success: true, supplier: @supplier }
        else
          render json: { success: false, errors: @supplier.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/suppliers/:id
      def destroy
        @supplier.update(is_active: false)
        render json: { success: true }
      end

      private

      def set_supplier
        @supplier = Supplier.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { success: false, error: "Supplier not found" }, status: :not_found
      end

      def supplier_params
        params.require(:supplier).permit(
          :name,
          :contact_person,
          :contact_name,
          :contact_number,
          :email,
          :phone,
          :address,
          :rating,
          :response_rate,
          :avg_response_time,
          :notes,
          :is_active,
          :contact_id,
          :confidence_score,
          :match_type,
          :is_verified,
          :original_name
        )
      end
    end
  end
end
