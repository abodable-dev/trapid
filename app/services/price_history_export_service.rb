require 'caxlsx'

class PriceHistoryExportService
  attr_reader :supplier_id, :category, :item_ids, :errors

  def initialize(supplier_id: nil, category: nil, item_ids: nil)
    @supplier_id = supplier_id
    @category = category
    @item_ids = item_ids
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
        total_items: items.count
      }
    rescue => e
      @errors << "Failed to generate Excel file: #{e.message}"
      { success: false, errors: @errors }
    end
  end

  private

  def fetch_items
    items = PricebookItem.includes(:supplier, :default_supplier, price_histories: :supplier).active

    # If specific item IDs are provided, filter by them (takes priority)
    if @item_ids.present?
      items = items.where(id: @item_ids)
    else
      # Otherwise apply supplier and category filters
      items = items.by_supplier(@supplier_id) if @supplier_id.present?
      items = items.by_category(@category) if @category.present?
    end

    items
  end

  def generate_excel(items)
    package = Axlsx::Package.new

    package.workbook.add_worksheet(name: "Pricebook") do |sheet|
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

      # Add header row - simplified to show only current price info
      sheet.add_row(
        [
          'Item Code',
          'Item Name',
          'Category',
          'Unit of Measure',
          'Current Price',
          'Supplier',
          'Price Last Updated',
          'Brand',
          'Notes'
        ],
        style: header_style,
        height: 30
      )

      # Add data rows - one row per item with current price only
      items.each do |item|
        # Use default_supplier if available, otherwise fall back to supplier
        supplier_name = item.default_supplier&.name || item.supplier&.name

        sheet.add_row(
          [
            sanitize_cell_value(item.item_code),
            sanitize_cell_value(item.item_name),
            sanitize_cell_value(item.category),
            sanitize_cell_value(item.unit_of_measure),
            item.current_price,
            sanitize_cell_value(supplier_name),
            item.price_last_updated_at&.to_date,
            sanitize_cell_value(item.brand),
            sanitize_cell_value(item.notes)
          ],
          style: [
            data_style,      # Item Code
            data_style,      # Item Name
            data_style,      # Category
            data_style,      # Unit of Measure
            currency_style,  # Current Price
            data_style,      # Supplier
            date_style,      # Price Last Updated
            data_style,      # Brand
            data_style       # Notes
          ]
        )
      end

      # Auto-fit columns
      sheet.column_widths 15, 30, 20, 15, 15, 20, 15, 20, 30
    end

    package
  end

  def generate_filename
    parts = ["pricebook"]

    if @item_ids.present?
      parts << "selected_#{@item_ids.length}_items"
    else
      if @supplier_id.present?
        supplier = Supplier.find_by(id: @supplier_id)
        parts << sanitize_filename(supplier.name) if supplier
      end

      if @category.present?
        parts << sanitize_filename(@category)
      end
    end

    parts << Date.today.strftime("%Y%m%d")

    "#{parts.join('_')}.xlsx"
  end

  def sanitize_filename(name)
    name.to_s.gsub(/[^a-zA-Z0-9_-]/, '_').gsub(/_+/, '_')
  end

  def sanitize_cell_value(value)
    return '' if value.nil? || value.to_s.strip.empty?

    # Convert to string and clean up problematic characters
    clean_value = value.to_s

    # Remove any invalid UTF-8 sequences
    clean_value = clean_value.encode('UTF-8', invalid: :replace, undef: :replace, replace: '')

    # Remove null bytes and other control characters that can corrupt Excel
    # Keep tab (0x09), newline (0x0A), and carriage return (0x0D)
    # Remove control characters in two passes due to Ruby regex limitations
    clean_value = clean_value.gsub(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/, '')
    clean_value = clean_value.gsub(/[\x80-\x9F]/, '')

    # Truncate very long text to prevent Excel issues (32,767 character limit per cell)
    clean_value = clean_value[0..32000] if clean_value.length > 32000

    # Replace multiple consecutive line breaks with double line break
    clean_value = clean_value.gsub(/\n{3,}/, "\n\n")

    # Remove leading/trailing whitespace
    clean_value = clean_value.strip

    # Return empty string if nothing left after sanitization
    clean_value.empty? ? '' : clean_value
  end
end
