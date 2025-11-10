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
          # Get items where this contact is the supplier OR default_supplier OR has provided a quote (in price_histories)
          items_as_supplier = @contact.pricebook_items.distinct
          items_as_default_supplier = PricebookItem.where(default_supplier_id: @contact.id).distinct
          items_with_price_history = PricebookItem.joins(:price_histories).where(price_histories: { supplier_id: @contact.id }).distinct

          # Combine all three and get unique items
          all_item_ids = (items_as_supplier.pluck(:id) + items_as_default_supplier.pluck(:id) + items_with_price_history.pluck(:id)).uniq
          all_items = PricebookItem.where(id: all_item_ids).order(:item_code)

          contact_json[:pricebook_items_count] = all_items.count
          contact_json[:purchase_orders_count] = @contact.purchase_orders.count
          contact_json[:pricebook_items] = all_items.as_json(
            only: [:id, :item_code, :item_name, :category, :current_price, :unit, :price_last_updated_at]
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

      # GET /api/v1/contacts/:id/categories
      def categories
        contact = Contact.find(params[:id])

        unless contact.is_supplier?
          return render json: {
            success: false,
            error: "Contact must be a supplier"
          }, status: :unprocessable_entity
        end

        # Get distinct categories from pricebook items where this contact is the default supplier
        # or has provided price histories
        categories_from_default = PricebookItem.where(default_supplier_id: contact.id)
                                              .where.not(category: nil)
                                              .distinct
                                              .pluck(:category)

        categories_from_histories = PricebookItem.joins(:price_histories)
                                                .where(price_histories: { supplier_id: contact.id })
                                                .where.not(category: nil)
                                                .distinct
                                                .pluck(:category)

        all_categories = (categories_from_default + categories_from_histories).uniq.sort

        # Get item counts per category
        categories_with_counts = all_categories.map do |category|
          default_count = PricebookItem.where(default_supplier_id: contact.id, category: category).count
          history_count = PricebookItem.joins(:price_histories)
                                      .where(price_histories: { supplier_id: contact.id })
                                      .where(category: category)
                                      .distinct
                                      .count

          {
            category: category,
            default_supplier_count: default_count,
            price_history_count: history_count,
            total_count: [default_count, history_count].max
          }
        end

        render json: {
          success: true,
          categories: categories_with_counts
        }
      rescue ActiveRecord::RecordNotFound => e
        render json: {
          success: false,
          error: "Contact not found: #{e.message}"
        }, status: :not_found
      rescue => e
        render json: {
          success: false,
          error: "Failed to fetch categories: #{e.message}"
        }, status: :internal_server_error
      end

      # POST /api/v1/contacts/:id/copy_price_history
      def copy_price_history
        source_id = params[:source_id]
        categories = params[:categories] # Optional array of categories to filter by
        set_as_default = params[:set_as_default] != false # Default to true unless explicitly false
        effective_date = params[:effective_date].present? ? Date.parse(params[:effective_date]) : Date.today

        if source_id.blank?
          return render json: {
            success: false,
            error: "source_id is required"
          }, status: :bad_request
        end

        target_contact = Contact.find(params[:id])
        source_contact = Contact.find(source_id)

        unless target_contact.is_supplier? || source_contact.is_supplier?
          return render json: {
            success: false,
            error: "Both contacts must be suppliers"
          }, status: :unprocessable_entity
        end

        copied_count = 0
        updated_count = 0

        ActiveRecord::Base.transaction do
          # Get all pricebook items where source is the default supplier
          source_items = PricebookItem.where(default_supplier_id: source_id)

          # Filter by categories if provided
          if categories.present? && categories.is_a?(Array) && categories.any?
            source_items = source_items.where(category: categories)
          end

          source_items.each do |item|
            # Only set target as the new default supplier if requested
            if set_as_default
              item.update!(default_supplier_id: target_contact.id)
              updated_count += 1
            end

            # Only copy the most recent price history for this item from the source supplier
            latest_price_history = PriceHistory.where(
              pricebook_item_id: item.id,
              supplier_id: source_id
            ).order(created_at: :desc).first

            if latest_price_history
              # Check if target already has a price history for this item
              existing_history = PriceHistory.where(
                pricebook_item_id: item.id,
                supplier_id: target_contact.id
              ).exists?

              # Only create if target doesn't already have a price history for this item
              unless existing_history
                PriceHistory.create!(
                  pricebook_item_id: item.id,
                  old_price: latest_price_history.old_price,
                  new_price: latest_price_history.new_price,
                  supplier_id: target_contact.id,
                  lga: latest_price_history.lga,
                  date_effective: effective_date,
                  change_reason: "Copied from #{source_contact.full_name}"
                )
                copied_count += 1
              end
            end
          end
        end

        category_msg = if categories.present? && categories.any?
          " for #{categories.join(', ')} categories"
        else
          ""
        end

        message = if set_as_default
          "Copied #{copied_count} price histories and set as default supplier for #{updated_count} items#{category_msg}"
        else
          "Copied #{copied_count} price histories#{category_msg}"
        end

        render json: {
          success: true,
          message: message,
          copied_count: copied_count,
          updated_count: updated_count,
          source_contact: source_contact.full_name,
          target_contact: target_contact.full_name,
          categories: categories || [],
          set_as_default: set_as_default
        }
      rescue ActiveRecord::RecordNotFound => e
        render json: {
          success: false,
          error: "Contact not found: #{e.message}"
        }, status: :not_found
      rescue => e
        render json: {
          success: false,
          error: "Failed to copy price history: #{e.message}"
        }, status: :internal_server_error
      end

      # DELETE /api/v1/contacts/:id/remove_from_categories
      def remove_from_categories
        categories = params[:categories] # Array of categories to remove supplier from

        if categories.blank? || !categories.is_a?(Array) || categories.empty?
          return render json: {
            success: false,
            error: "categories (array) is required"
          }, status: :bad_request
        end

        contact = Contact.find(params[:id])

        unless contact.is_supplier?
          return render json: {
            success: false,
            error: "Contact must be a supplier"
          }, status: :unprocessable_entity
        end

        removed_from_default_count = 0
        deleted_price_histories_count = 0

        ActiveRecord::Base.transaction do
          # Find all pricebook items where this contact is the default supplier
          # and the category is in the provided list
          default_supplier_items = PricebookItem.where(
            default_supplier_id: contact.id,
            category: categories
          )

          default_supplier_items.each do |item|
            # Set default_supplier_id to nil (unset the supplier)
            item.update!(default_supplier_id: nil)
            removed_from_default_count += 1
          end

          # Delete all price histories for this supplier in the selected categories
          # This removes the supplier's pricing from items even if they weren't the default
          price_histories_to_delete = PriceHistory.joins(:pricebook_item)
            .where(supplier_id: contact.id)
            .where(pricebook_items: { category: categories })

          deleted_price_histories_count = price_histories_to_delete.count
          price_histories_to_delete.delete_all
        end

        message_parts = []
        message_parts << "Removed as default supplier from #{removed_from_default_count} items" if removed_from_default_count > 0
        message_parts << "Deleted #{deleted_price_histories_count} price histories" if deleted_price_histories_count > 0

        message = if message_parts.any?
          "#{message_parts.join(' and ')} in #{categories.join(', ')}"
        else
          "No items or price histories found for this supplier in #{categories.join(', ')}"
        end

        render json: {
          success: true,
          message: message,
          removed_from_default_count: removed_from_default_count,
          deleted_price_histories_count: deleted_price_histories_count,
          categories: categories
        }
      rescue ActiveRecord::RecordNotFound => e
        render json: {
          success: false,
          error: "Contact not found: #{e.message}"
        }, status: :not_found
      rescue => e
        render json: {
          success: false,
          error: "Failed to remove from categories: #{e.message}"
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
