module Api
  module V1
    class SamQuickEstItemsController < ApplicationController
      before_action :set_sam_quick_est_item, only: [:show, :update, :destroy]

      # GET /api/v1/sam_quick_est
      def index
        @items = SamQuickEstItem.includes(:supplier, :default_supplier).active

        # Filter by specific IDs if provided
        if params[:ids].present?
          ids = params[:ids].split(',').map(&:to_i)
          @items = @items.where(id: ids)
        else
          # Apply search
          @items = @items.search(params[:search]) if params[:search].present?

          # Apply filters
          @items = @items.by_category(params[:category]) if params[:category].present?
          @items = @items.by_supplier(params[:supplier_id]) if params[:supplier_id].present?
          @items = @items.price_range(params[:min_price], params[:max_price])
          @items = @items.needs_pricing if params[:needs_pricing] == "true"

          # Boolean field filters
          @items = @items.where(requires_photo: params[:requires_photo] == "true") if params[:requires_photo].present?
          @items = @items.where(requires_spec: params[:requires_spec] == "true") if params[:requires_spec].present?
          @items = @items.where(photo_attached: params[:photo_attached] == "true") if params[:photo_attached].present?
          @items = @items.where(spec_attached: params[:spec_attached] == "true") if params[:spec_attached].present?
          @items = @items.where(needs_pricing_review: params[:needs_pricing_review] == "true") if params[:needs_pricing_review].present?

          # Risk level filter
          @items = @items.by_risk_level(params[:risk_level]) if params[:risk_level].present?
        end

        # Sorting
        if params[:sort_by].present? && !@items.is_a?(Array)
          sort_column = params[:sort_by]
          sort_direction = params[:sort_direction]&.downcase == 'desc' ? 'desc' : 'asc'

          # Map frontend column names to database columns (whitelist)
          column_mapping = {
            'item_code' => 'item_code',
            'item_name' => 'item_name',
            'category' => 'category',
            'current_price' => 'current_price',
            'supplier' => 'contacts.full_name'
          }

          db_column = column_mapping[sort_column] || 'item_code'

          # Join contacts table if sorting by supplier
          if sort_column == 'supplier'
            @items = @items.left_joins(:supplier)
            @items = @items.order(Arel.sql("#{Contact.connection.quote_column_name('contacts')}.#{Contact.connection.quote_column_name('full_name')} #{sort_direction}"))
          else
            @items = @items.order(Arel.sql("#{SamQuickEstItem.connection.quote_column_name(db_column)} #{sort_direction}"))
          end
        end

        # Pagination
        page = [params[:page]&.to_i || 1, 1].max
        limit = (params[:limit] || params[:per_page])&.to_i || 100

        # Allow unlimited results when filtering by supplier_id
        if params[:supplier_id].present? && limit == 0
          limit = nil
        else
          limit = [[limit, 1].max, 1000].min
        end

        offset = (page - 1) * (limit || 0)
        total_count = @items.is_a?(Array) ? @items.count : @items.count

        # Apply pagination
        if @items.is_a?(Array)
          paginated_items = limit ? (@items[offset, limit] || []) : @items
        else
          if limit
            @items = @items.limit(limit).offset(offset)
          end
          paginated_items = @items
        end

        # Filter suppliers by category if category filter is active
        suppliers_list = if params[:category].present?
          default_supplier_ids = Contact.joins("INNER JOIN sam_quick_est_items ON sam_quick_est_items.default_supplier_id = contacts.id")
                                        .where(sam_quick_est_items: { category: params[:category], is_active: true })
                                        .where("'supplier' = ANY(contacts.contact_types)")
                                        .distinct
                                        .pluck(:id)

          Contact.where(id: default_supplier_ids).order(:full_name).pluck(:id, :full_name)
        else
          default_supplier_ids = Contact.joins("INNER JOIN sam_quick_est_items ON sam_quick_est_items.default_supplier_id = contacts.id")
                                        .where(sam_quick_est_items: { is_active: true })
                                        .where("'supplier' = ANY(contacts.contact_types)")
                                        .distinct
                                        .pluck(:id)

          Contact.where(id: default_supplier_ids).order(:full_name).pluck(:id, :full_name)
        end

        render json: {
          items: paginated_items.map { |item| item_with_risk_data(item) },
          pagination: {
            page: page,
            limit: limit,
            total_count: total_count,
            total_pages: limit ? (total_count.to_f / limit).ceil : 1
          },
          filters: {
            categories: SamQuickEstItem.categories,
            suppliers: suppliers_list
          }
        }
      end

      # GET /api/v1/sam_quick_est/:id
      def show
        item_json = @item.as_json(
          include: {
            supplier: { only: [:id, :full_name, :email, :mobile_phone, :office_phone, :rating] },
            default_supplier: { only: [:id, :full_name] }
          }
        )

        # Map full_name to name for backwards compatibility
        if item_json['supplier']
          item_json['supplier']['name'] = item_json['supplier']['full_name']
        end
        if item_json['default_supplier']
          item_json['default_supplier']['name'] = item_json['default_supplier']['full_name']
        end

        render json: item_with_risk_data(@item).merge(item_json)
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

      # PATCH /api/v1/sam_quick_est/bulk_update
      def bulk_update
        updates = params[:updates] || []
        results = { success: [], errors: [] }

        updates.each do |update|
          item = SamQuickEstItem.find_by(id: update[:id])
          if item
            permitted_attrs = update.to_unsafe_h.slice(:current_price, :supplier_id, :default_supplier_id, :notes, :category, :requires_photo, :requires_spec, :photo_attached, :spec_attached, :needs_pricing_review)

            if item.update(permitted_attrs)
              results[:success] << item.id
            else
              results[:errors] << { id: update[:id], errors: item.errors.full_messages }
            end
          else
            results[:errors] << { id: update[:id], errors: ["Item not found"] }
          end
        end

        render json: results
      end

      # GET /api/v1/sam_quick_est/export
      def export
        supplier_id = params[:supplier_id]
        category = params[:category]
        item_ids = params[:item_ids]&.split(',')&.map(&:to_i)

        # Build query
        items = SamQuickEstItem.includes(:supplier, :default_supplier).active

        if item_ids.present?
          items = items.where(id: item_ids)
        else
          items = items.by_supplier(supplier_id) if supplier_id.present?
          items = items.by_category(category) if category.present?
        end

        # Generate CSV
        csv_data = CSV.generate(headers: true) do |csv|
          csv << ['Item Code', 'Item Name', 'Category', 'Current Price', 'Unit', 'Supplier', 'Brand', 'Notes']

          items.each do |item|
            csv << [
              item.item_code,
              item.item_name,
              item.category,
              item.current_price,
              item.unit_of_measure,
              item.default_supplier&.full_name || item.supplier&.full_name,
              item.brand,
              item.notes
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

      def item_with_risk_data(item)
        item_json = item.as_json(include: {
          supplier: { only: [:id, :full_name] },
          default_supplier: { only: [:id, :full_name] }
        })

        # Map full_name to name for backwards compatibility
        if item_json['supplier']
          item_json['supplier']['name'] = item_json['supplier']['full_name']
        end
        if item_json['default_supplier']
          item_json['default_supplier']['name'] = item_json['default_supplier']['full_name']
        end

        item_json.merge(
          price_last_updated_at: item.price_last_updated_at,
          price_age_days: item.price_age_in_days,
          price_freshness: {
            status: item.price_freshness_status,
            label: item.price_freshness_label,
            color: item.price_freshness_color
          },
          risk: {
            score: item.risk_score,
            level: item.risk_level,
            label: item.risk_level_label,
            color: item.risk_level_color
          },
          supplier_reliability: item.supplier_reliability_score,
          image_url: item.image_url,
          qr_code_url: item.qr_code_url,
          image_fetch_status: item.image_fetch_status
        )
      end
    end
  end
end
