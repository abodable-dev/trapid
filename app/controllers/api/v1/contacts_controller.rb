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
            # Filter for contacts that have both 'customer' and 'supplier' in contact_types array
            @contacts = @contacts.where("contact_types @> ARRAY['customer', 'supplier']::text[]")
          end
        end

        # Filter by having contact info
        @contacts = @contacts.with_email if params[:with_email] == "true"
        @contacts = @contacts.with_phone if params[:with_phone] == "true"

        @contacts = @contacts.order(:full_name)

        render json: {
          success: true,
          contacts: @contacts.as_json(
            only: [:id, :full_name, :first_name, :last_name, :email, :mobile_phone, :office_phone, :website, :contact_types, :primary_contact_type, :rating, :response_rate, :avg_response_time, :is_active, :supplier_code, :address, :notes],
            methods: [:is_customer?, :is_supplier?, :is_sales?, :is_land_agent?]
          )
        }
      end

      # GET /api/v1/contacts/:id
      def show
        # If this contact is a supplier, include their supplier-specific data
        contact_json = @contact.as_json(
          only: [
            :id, :full_name, :first_name, :last_name, :email, :mobile_phone, :office_phone, :website,
            :tax_number, :xero_id, :sync_with_xero, :sys_type_id, :deleted, :parent_id, :parent,
            :drive_id, :folder_id, :contact_region_id, :contact_region, :branch, :created_at, :updated_at,
            :contact_types, :primary_contact_type, :rating, :response_rate, :avg_response_time, :is_active, :supplier_code, :address, :notes
          ],
          methods: [:is_customer?, :is_supplier?, :is_sales?, :is_land_agent?]
        )

        # If contact is a supplier, add pricebook items and purchase orders
        if @contact.is_supplier?
          contact_json[:pricebook_items_count] = @contact.pricebook_items.count
          contact_json[:purchase_orders_count] = @contact.purchase_orders.count
          contact_json[:pricebook_items] = @contact.pricebook_items.as_json(
            only: [:id, :item_code, :item_name, :category, :current_price, :unit]
          )
        end

        render json: {
          success: true,
          contact: contact_json
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
          render json: {
            success: true,
            contact: @contact.as_json(
              only: [:id, :full_name, :first_name, :last_name, :email, :mobile_phone, :office_phone, :website, :contact_types, :primary_contact_type, :rating, :response_rate, :avg_response_time, :is_active, :supplier_code, :address, :notes],
              methods: [:is_customer?, :is_supplier?, :is_sales?, :is_land_agent?]
            )
          }
        else
          render json: { success: false, errors: @contact.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/contacts/:id
      def destroy
        # Comprehensive safety checks before deletion

        # Check for linked suppliers
        if @contact.suppliers.any?
          suppliers_with_pos = @contact.suppliers.joins(:purchase_orders).distinct

          if suppliers_with_pos.any?
            # Check if any POs have been paid or invoiced
            paid_pos = PurchaseOrder.where(supplier_id: suppliers_with_pos.pluck(:id))
                                   .where("status IN (?) OR amount_paid > 0 OR amount_invoiced > 0",
                                          ['paid', 'invoiced', 'received'])

            if paid_pos.any?
              return render json: {
                success: false,
                error: "Cannot delete contact with purchase orders that have been paid or invoiced. This contact has #{paid_pos.count} critical purchase order(s).",
                reason: "paid_purchase_orders",
                count: paid_pos.count
              }, status: :unprocessable_entity
            end

            # Check for any purchase orders at all
            total_pos = PurchaseOrder.where(supplier_id: suppliers_with_pos.pluck(:id)).count
            if total_pos > 0
              return render json: {
                success: false,
                error: "Cannot delete contact with #{total_pos} purchase order(s). Please reassign or delete purchase orders first.",
                reason: "has_purchase_orders",
                count: total_pos
              }, status: :unprocessable_entity
            end
          end

          # If suppliers exist but no POs, just warn
          return render json: {
            success: false,
            error: "Cannot delete contact with #{@contact.suppliers.count} linked supplier(s). Please unlink suppliers first.",
            reason: "has_suppliers",
            count: @contact.suppliers.count
          }, status: :unprocessable_entity
        end

        # If all checks pass, delete the contact
        @contact.destroy
        render json: {
          success: true,
          message: "Contact deleted successfully"
        }
      rescue => e
        render json: {
          success: false,
          error: "Failed to delete contact: #{e.message}"
        }, status: :internal_server_error
      end

      # PATCH /api/v1/contacts/bulk_update
      def bulk_update
        contact_ids = params[:contact_ids]
        contact_types = params[:contact_types]

        # Validate contact_ids is present and is an array
        if contact_ids.blank? || !contact_ids.is_a?(Array)
          return render json: {
            success: false,
            error: "contact_ids must be a non-empty array"
          }, status: :unprocessable_entity
        end

        # Validate contact_types is valid
        if contact_types.blank? || !contact_types.is_a?(Array)
          return render json: {
            success: false,
            error: "contact_types must be a non-empty array"
          }, status: :unprocessable_entity
        end

        invalid_types = contact_types - Contact::CONTACT_TYPES
        if invalid_types.any?
          return render json: {
            success: false,
            error: "Invalid contact types: #{invalid_types.join(', ')}"
          }, status: :unprocessable_entity
        end

        # Update all contacts in a single query using update_all for performance
        # This bypasses validations and callbacks but is much faster for bulk operations
        updated_count = Contact.where(id: contact_ids).update_all(contact_types: contact_types)

        if updated_count > 0
          render json: {
            success: true,
            updated_count: updated_count,
            message: "Successfully updated #{updated_count} contact#{updated_count == 1 ? '' : 's'}"
          }
        else
          render json: {
            success: false,
            error: "No contacts found with the provided IDs"
          }, status: :not_found
        end
      rescue => e
        render json: {
          success: false,
          error: "Failed to update contacts: #{e.message}"
        }, status: :internal_server_error
      end

      # POST /api/v1/contacts/match_supplier
      def match_supplier
        contact_id = params[:contact_id]
        supplier_name = params[:supplier_name]

        if contact_id.blank? || supplier_name.blank?
          return render json: {
            success: false,
            error: "contact_id and supplier_name are required"
          }, status: :bad_request
        end

        contact = Contact.find(contact_id)

        # Find supplier by name (case-insensitive)
        supplier = Supplier.where("LOWER(name) = ?", supplier_name.downcase).first

        unless supplier
          return render json: {
            success: false,
            error: "No supplier found with name '#{supplier_name}'"
          }, status: :not_found
        end

        # Import supplier history into contact
        contact.update(
          contact_types: (contact.contact_types + ['supplier']).uniq,
          rating: supplier.rating || contact.rating,
          response_rate: supplier.response_rate || contact.response_rate,
          avg_response_time: supplier.avg_response_time || contact.avg_response_time,
          is_active: supplier.is_active.nil? ? contact.is_active : supplier.is_active,
          supplier_code: supplier.supplier_code || contact.supplier_code,
          address: supplier.address || contact.address,
          notes: [contact.notes, supplier.notes].compact.join("\n\n")
        )

        # Link the supplier to this contact
        supplier.update(contact_id: contact.id)

        render json: {
          success: true,
          message: "Successfully matched contact with supplier '#{supplier.name}'",
          contact: contact.as_json(
            only: [:id, :full_name, :first_name, :last_name, :email, :contact_types, :rating, :notes]
          ),
          imported_fields: {
            rating: supplier.rating,
            response_rate: supplier.response_rate,
            avg_response_time: supplier.avg_response_time,
            supplier_code: supplier.supplier_code,
            notes: supplier.notes.present?
          }
        }
      rescue ActiveRecord::RecordNotFound => e
        render json: {
          success: false,
          error: "Contact not found: #{e.message}"
        }, status: :not_found
      rescue => e
        render json: {
          success: false,
          error: "Failed to match supplier: #{e.message}"
        }, status: :internal_server_error
      end

      # POST /api/v1/contacts/merge
      def merge
        target_id = params[:target_id]
        source_ids = params[:source_ids]

        if target_id.blank? || source_ids.blank? || !source_ids.is_a?(Array)
          return render json: {
            success: false,
            error: "target_id and source_ids (array) are required"
          }, status: :bad_request
        end

        target_contact = Contact.find(target_id)
        source_contacts = Contact.where(id: source_ids)

        if source_contacts.empty?
          return render json: {
            success: false,
            error: "No source contacts found"
          }, status: :not_found
        end

        ActiveRecord::Base.transaction do
          source_contacts.each do |source|
            # Merge contact types
            merged_types = (target_contact.contact_types + source.contact_types).uniq
            target_contact.update(contact_types: merged_types)

            # Fill in missing contact information from source if target is missing it
            target_contact.update(email: source.email) if target_contact.email.blank? && source.email.present?
            target_contact.update(mobile_phone: source.mobile_phone) if target_contact.mobile_phone.blank? && source.mobile_phone.present?
            target_contact.update(office_phone: source.office_phone) if target_contact.office_phone.blank? && source.office_phone.present?
            target_contact.update(website: source.website) if target_contact.website.blank? && source.website.present?
            target_contact.update(address: source.address) if target_contact.address.blank? && source.address.present?

            # Merge supplier-specific fields (if both are suppliers)
            if source.is_supplier? && target_contact.is_supplier?
              # Keep the better rating
              if source.rating.to_i > target_contact.rating.to_i
                target_contact.update(rating: source.rating)
              end
              # Combine notes if both have them
              if source.notes.present? && target_contact.notes.present?
                target_contact.update(notes: "#{target_contact.notes}\n\n--- Merged from contact ##{source.id} ---\n#{source.notes}")
              elsif source.notes.present?
                target_contact.update(notes: source.notes)
              end
            end

            # Update foreign keys from source to target
            # These associations now point directly to contacts (supplier_id = contact_id after migration)
            PricebookItem.where(supplier_id: source.id).update_all(supplier_id: target_id)
            PurchaseOrder.where(supplier_id: source.id).update_all(supplier_id: target_id)
            PriceHistory.where(supplier_id: source.id).update_all(supplier_id: target_id)

            # Delete the source contact
            source.destroy
          end
        end

        render json: {
          success: true,
          message: "Successfully merged #{source_contacts.count} contact(s) into #{target_contact.full_name}",
          contact: target_contact.as_json(
            only: [:id, :full_name, :first_name, :last_name, :email, :mobile_phone, :office_phone, :website, :contact_types]
          )
        }
      rescue ActiveRecord::RecordNotFound => e
        render json: {
          success: false,
          error: "Contact not found: #{e.message}"
        }, status: :not_found
      rescue => e
        render json: {
          success: false,
          error: "Failed to merge contacts: #{e.message}"
        }, status: :internal_server_error
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
          :primary_contact_type,
          :rating,
          :response_rate,
          :avg_response_time,
          :is_active,
          :supplier_code,
          :address,
          :notes,
          contact_types: []
        )
      end
    end
  end
end
