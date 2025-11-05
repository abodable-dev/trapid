module Api
  module V1
    class SuppliersController < ApplicationController
      before_action :set_supplier, only: [:show, :update, :destroy, :link_contact, :verify_match, :unlink_contact, :export_pricebook, :import_pricebook, :update_pricebook_item]

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
          # Auto-create linked Contact with Xero sync enabled
          contact = create_contact_from_supplier(@supplier)

          if contact.persisted?
            @supplier.update(contact_id: contact.id)

            # Optionally trigger immediate Xero sync
            # XeroContactSyncJob.perform_later
          end

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

      # GET /api/v1/suppliers/:id/pricebook/export
      def export_pricebook
        # Get all pricebook items for this supplier
        items = @supplier.pricebook_items

        # Generate Excel file
        package = Axlsx::Package.new
        workbook = package.workbook

        # Define styles
        header_style = workbook.styles.add_style(
          bg_color: "4472C4",
          fg_color: "FFFFFF",
          b: true,
          alignment: { horizontal: :center }
        )

        workbook.add_worksheet(name: "Price Book") do |sheet|
          # Add header row
          sheet.add_row [
            "Item Code",
            "Item Name",
            "Category",
            "Unit of Measure",
            "Current Price",
            "Brand",
            "Notes"
          ], style: header_style

          # Add data rows
          items.each do |item|
            sheet.add_row [
              item.item_code,
              item.item_name,
              item.category,
              item.unit_of_measure,
              item.current_price,
              item.brand,
              item.notes
            ]
          end

          # Auto-fit columns
          sheet.column_widths 15, 30, 15, 15, 12, 15, 40
        end

        # Send file
        send_data package.to_stream.read,
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          filename: "#{@supplier.name.parameterize}_pricebook_#{Date.today}.xlsx"
      end

      # POST /api/v1/suppliers/:id/pricebook/import
      def import_pricebook
        unless params[:file]
          return render json: { success: false, error: "No file provided" }, status: :unprocessable_entity
        end

        file = params[:file]
        results = {
          success: true,
          updated: 0,
          created: 0,
          errors: [],
          price_changes: 0
        }

        begin
          # Parse the Excel file using Roo
          spreadsheet = Roo::Spreadsheet.open(file.path)
          sheet = spreadsheet.sheet(0)

          # Get header row (first row)
          headers = sheet.row(1).map(&:to_s).map(&:strip)

          # Validate required columns
          required_columns = ["Item Code"]
          missing_columns = required_columns - headers
          if missing_columns.any?
            return render json: {
              success: false,
              error: "Missing required columns: #{missing_columns.join(', ')}"
            }, status: :unprocessable_entity
          end

          # Map column names to indices
          column_map = {}
          headers.each_with_index do |header, index|
            column_map[header.downcase.gsub(/[^a-z0-9]/, '_')] = index
          end

          # Process each row (skip header)
          (2..sheet.last_row).each do |row_num|
            row = sheet.row(row_num)
            next if row.all?(&:blank?) # Skip empty rows

            item_code = row[column_map['item_code']].to_s.strip
            next if item_code.blank?

            # Find or initialize item by item_code
            item = PricebookItem.find_or_initialize_by(item_code: item_code)

            # Track if this is a new record
            is_new = item.new_record?

            # Prepare attributes to update
            old_price = item.current_price
            attributes = {}

            # Map Excel columns to attributes
            attributes[:item_name] = row[column_map['item_name']].to_s.strip if column_map['item_name'] && row[column_map['item_name']].present?
            attributes[:category] = row[column_map['category']].to_s.strip if column_map['category'] && row[column_map['category']].present?
            attributes[:unit_of_measure] = row[column_map['unit_of_measure']].to_s.strip if column_map['unit_of_measure'] && row[column_map['unit_of_measure']].present?
            attributes[:current_price] = row[column_map['current_price']].to_f if column_map['current_price'] && row[column_map['current_price']].present?
            attributes[:brand] = row[column_map['brand']].to_s.strip if column_map['brand'] && row[column_map['brand']].present?
            attributes[:notes] = row[column_map['notes']].to_s.strip if column_map['notes'] && row[column_map['notes']].present?

            # Always set supplier_id to current supplier
            attributes[:supplier_id] = @supplier.id

            # Assign attributes
            item.assign_attributes(attributes)

            # Validate and save
            if item.valid?
              # Check if price changed
              price_changed = !is_new && old_price.present? && attributes[:current_price].present? && old_price != attributes[:current_price]

              item.save!

              # Create price history if price changed
              if price_changed
                item.price_histories.create!(
                  old_price: old_price,
                  new_price: attributes[:current_price],
                  supplier_id: @supplier.id,
                  change_reason: "excel_import"
                )
                results[:price_changes] += 1
              end

              if is_new
                results[:created] += 1
              else
                results[:updated] += 1
              end
            else
              results[:errors] << {
                row: row_num,
                item_code: item_code,
                errors: item.errors.full_messages
              }
            end
          end

          render json: results
        rescue => e
          render json: {
            success: false,
            error: "Failed to process file: #{e.message}"
          }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/suppliers/:id/pricebook/:item_id
      def update_pricebook_item
        item = @supplier.pricebook_items.find_by(id: params[:item_id])

        unless item
          return render json: { success: false, error: "Item not found" }, status: :not_found
        end

        # Track old price for history
        old_price = item.current_price

        # Update item
        if item.update(pricebook_item_params)
          # Create price history if price changed
          if old_price != item.current_price && item.current_price.present?
            item.price_histories.create!(
              old_price: old_price,
              new_price: item.current_price,
              supplier_id: @supplier.id,
              change_reason: "inline_edit"
            )
          end

          render json: {
            success: true,
            item: item.as_json(only: [:id, :item_code, :item_name, :category, :current_price])
          }
        else
          render json: { success: false, errors: item.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def create_contact_from_supplier(supplier)
        # Create a Contact from Supplier data with Xero sync enabled
        Contact.create(
          full_name: supplier.name,
          email: supplier.email,
          mobile_phone: supplier.phone || supplier.contact_number,
          office_phone: supplier.contact_number,
          sync_with_xero: true
        )
      rescue StandardError => e
        Rails.logger.error("Failed to create contact for supplier #{supplier.id}: #{e.message}")
        # Return unsaved contact to avoid breaking supplier creation
        Contact.new
      end

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

      def pricebook_item_params
        params.require(:item).permit(
          :item_name,
          :category,
          :current_price
        )
      end
    end
  end
end
