module Api
  module V1
    class ContactsController < ApplicationController
      before_action :set_contact, only: [:show, :update, :destroy]

      # GET /api/v1/contacts
      def index
        @contacts = Contact.all

        # Search by name or email
        if params[:search].present?
          search_term = "%#{params[:search]}%"
          @contacts = @contacts.where(
            "full_name ILIKE ? OR email ILIKE ? OR first_name ILIKE ? OR last_name ILIKE ?",
            search_term, search_term, search_term, search_term
          )
        end

        # Filter by contact type
        if params[:type].present?
          case params[:type]
          when 'customers'
            @contacts = @contacts.customers
          when 'suppliers'
            @contacts = @contacts.suppliers
          when 'both'
            @contacts = @contacts.where(contact_type: 'both')
          end
        end

        # Filter by having contact info
        @contacts = @contacts.with_email if params[:with_email] == "true"
        @contacts = @contacts.with_phone if params[:with_phone] == "true"

        @contacts = @contacts.order(:full_name)

        render json: {
          success: true,
          contacts: @contacts.as_json(
            only: [:id, :full_name, :first_name, :last_name, :email, :mobile_phone, :office_phone, :website, :contact_type],
            methods: [:is_customer?, :is_supplier?, :is_both?],
            include: { suppliers: { only: [:id, :name] } }
          )
        }
      end

      # GET /api/v1/contacts/:id
      def show
        suppliers_with_items = @contact.suppliers.includes(:pricebook_items).map do |supplier|
          supplier.as_json(
            only: [:id, :name, :confidence_score, :match_type, :is_verified],
            methods: [:match_confidence_label]
          ).merge(
            pricebook_items: supplier.pricebook_items.map { |item| { id: item.id } }
          )
        end

        render json: {
          success: true,
          contact: @contact.as_json(
            only: [
              :id, :full_name, :first_name, :last_name, :email, :mobile_phone, :office_phone, :website,
              :tax_number, :xero_id, :sync_with_xero, :sys_type_id, :deleted, :parent_id, :parent,
              :drive_id, :folder_id, :contact_region_id, :contact_region, :branch, :created_at, :updated_at,
              :contact_type
            ],
            methods: [:is_customer?, :is_supplier?, :is_both?]
          ).merge(
            suppliers: suppliers_with_items
          )
        }
      end

      # POST /api/v1/contacts
      def create
        @contact = Contact.new(contact_params)

        if @contact.save
          render json: { success: true, contact: @contact }, status: :created
        else
          render json: { success: false, errors: @contact.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/contacts/:id
      def update
        if @contact.update(contact_params)
          render json: { success: true, contact: @contact }
        else
          render json: { success: false, errors: @contact.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/contacts/:id
      def destroy
        if @contact.suppliers.any?
          render json: {
            success: false,
            error: "Cannot delete contact with linked suppliers. Please unlink suppliers first."
          }, status: :unprocessable_entity
        else
          @contact.destroy
          render json: { success: true }
        end
      end

      private

      def set_contact
        @contact = Contact.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { success: false, error: "Contact not found" }, status: :not_found
      end

      def contact_params
        params.require(:contact).permit(
          :full_name,
          :first_name,
          :last_name,
          :email,
          :mobile_phone,
          :office_phone,
          :website,
          :tax_number,
          :xero_id,
          :sys_type_id,
          :deleted,
          :parent_id,
          :parent,
          :drive_id,
          :folder_id,
          :sync_with_xero,
          :contact_region_id,
          :contact_region,
          :branch,
          :contact_type
        )
      end
    end
  end
end
