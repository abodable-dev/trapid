require 'caxlsx'

class PriceHistoryExportService
  attr_reader :supplier_id, :category, :errors

  def initialize(supplier_id: nil, category: nil)
    @supplier_id = supplier_id
    @category = category
    @errors = []
  end

  def export
    # Fetch pricebook items based on filters
    items = fetch_items

    if items.empty?
      @errors << "No items found for the selected filters"
      return { success: false, errors: @errors }
    end

    # Generate Excel file
    begin
      package = generate_excel(items)

      {
        success: true,
        filename: generate_filename,
        content_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        data: package.to_stream.read,
        total_items: items.count,
        total_history_records: items.sum { |item| item.price_histories.size }
      }
    rescue => e
      @errors << "Failed to generate Excel file: #{e.message}"
      { success: false, errors: @errors }
    end
  end

  private

  def fetch_items
    items = PricebookItem.includes(:supplier, :default_supplier, price_histories: :supplier).active

    # Apply supplier filter
    items = items.by_supplier(@supplier_id) if @supplier_id.present?

    # Apply category filter
    items = items.by_category(@category) if @category.present?

    items
  end

  def generate_excel(items)
    package = Axlsx::Package.new

    package.workbook.add_worksheet(name: "Price History") do |sheet|
      # Define styles
      header_style = sheet.styles.add_style(
        bg_color: "0066CC",
        fg_color: "FFFFFF",
        b: true,
        alignment: { horizontal: :center, vertical: :center, wrap_text: true },
        border: { style: :thin, color: "000000" }
      )

      data_style = sheet.styles.add_style(
        alignment: { vertical: :center, wrap_text: false },
        border: { style: :thin, color: "CCCCCC" }
      )

      currency_style = sheet.styles.add_style(
        format_code: '"$"#,##0.00',
        alignment: { vertical: :center },
        border: { style: :thin, color: "CCCCCC" }
      )

      date_style = sheet.styles.add_style(
        format_code: 'yyyy-mm-dd',
        alignment: { vertical: :center },
        border: { style: :thin, color: "CCCCCC" }
      )

      # Add header row
      sheet.add_row(
        [
          'Item ID',
          'Item Code',
          'Item Name',
          'Category',
          'Unit of Measure',
          'Current Price',
          'Default Supplier',
          'Price History ID',
          'Historical Price',
          'Previous Price',
          'Price Date',
          'Date Effective',
          'Supplier',
          'LGA',
          'Change Reason',
          'Quote Reference',
          'Notes'
        ],
        style: header_style,
        height: 30
      )

      # Add data rows
      items.each do |item|
        if item.price_histories.any?
          # Create a row for each price history entry
          item.price_histories.order(created_at: :desc).each do |history|
            sheet.add_row(
              [
                item.id,
                item.item_code,
                item.item_name,
                item.category,
                item.unit_of_measure,
                item.current_price,
                item.default_supplier&.name,
                history.id,
                history.new_price,
                history.old_price,
                history.created_at&.to_date,
                history.date_effective,
                history.supplier&.name,
                history.lga,
                history.change_reason,
                history.quote_reference,
                item.notes
              ],
              style: [
                data_style,      # Item ID
                data_style,      # Item Code
                data_style,      # Item Name
                data_style,      # Category
                data_style,      # Unit of Measure
                currency_style,  # Current Price
                data_style,      # Default Supplier
                data_style,      # Price History ID
                currency_style,  # Historical Price
                currency_style,  # Previous Price
                date_style,      # Price Date
                date_style,      # Date Effective
                data_style,      # Supplier
                data_style,      # LGA
                data_style,      # Change Reason
                data_style,      # Quote Reference
                data_style       # Notes
              ]
            )
          end
        else
          # Item has no price history, create a single row
          sheet.add_row(
            [
              item.id,
              item.item_code,
              item.item_name,
              item.category,
              item.unit_of_measure,
              item.current_price,
              item.default_supplier&.name,
              nil, # No history ID
              nil, # No historical price
              nil, # No previous price
              nil, # No price date
              nil, # No date effective
              nil, # No supplier in history
              nil, # No LGA
              nil, # No change reason
              nil, # No quote reference
              item.notes
            ],
            style: [
              data_style,      # Item ID
              data_style,      # Item Code
              data_style,      # Item Name
              data_style,      # Category
              data_style,      # Unit of Measure
              currency_style,  # Current Price
              data_style,      # Default Supplier
              data_style,      # Price History ID
              currency_style,  # Historical Price
              currency_style,  # Previous Price
              date_style,      # Price Date
              date_style,      # Date Effective
              data_style,      # Supplier
              data_style,      # LGA
              data_style,      # Change Reason
              data_style,      # Quote Reference
              data_style       # Notes
            ]
          )
        end
      end

      # Auto-fit columns
      sheet.column_widths 10, 15, 30, 20, 15, 15, 20, 15, 15, 15, 12, 12, 20, 25, 20, 20, 30
    end

    package
  end

  def generate_filename
    parts = ["price_history"]

    if @supplier_id.present?
      supplier = Supplier.find_by(id: @supplier_id)
      parts << sanitize_filename(supplier.name) if supplier
    end

    if @category.present?
      parts << sanitize_filename(@category)
    end

    parts << Date.today.strftime("%Y%m%d")

    "#{parts.join('_')}.xlsx"
  end

  def sanitize_filename(name)
    name.to_s.gsub(/[^a-zA-Z0-9_-]/, '_').gsub(/_+/, '_')
  end
end
