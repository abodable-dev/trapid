class OnedrivePricebookSyncService
  attr_reader :organization, :folder_path, :results

  def initialize(organization, folder_path = nil)
    @organization = organization
    @folder_path = folder_path || "Pricebook Images"
    @results = {
      matched: 0,
      photos_matched: 0,
      specs_matched: 0,
      qr_codes_matched: 0,
      unmatched_files: [],
      unmatched_items: [],
      errors: []
    }
  end

  def sync
    # Get OneDrive client
    client = get_onedrive_client
    return { success: false, error: "OneDrive not connected" } unless client

    # Find or create the folder
    folder = find_or_create_folder(client, @folder_path)
    return { success: false, error: "Could not access folder: #{@folder_path}" } unless folder

    # Get all files in the folder
    files = list_folder_files(client, folder['id'])

    # Get all active pricebook items
    items = PricebookItem.active

    # Match files to items by name
    match_files_to_items(client, files, items)

    # Update boolean flags for all items after sync
    update_boolean_flags(items)

    {
      success: true,
      matched: @results[:matched],
      photos_matched: @results[:photos_matched],
      specs_matched: @results[:specs_matched],
      qr_codes_matched: @results[:qr_codes_matched],
      unmatched_files: @results[:unmatched_files],
      unmatched_items: @results[:unmatched_items],
      errors: @results[:errors]
    }
  rescue => e
    Rails.logger.error "OneDrive sync error: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    {
      success: false,
      error: e.message
    }
  end

  private

  def get_onedrive_client
    credential = @organization.organization_one_drive_credential
    return nil unless credential

    MicrosoftGraphClient.new(credential)
  end

  def find_or_create_folder(client, folder_name)
    # Try to find existing folder
    response = client.get("/me/drive/root/children")
    folders = response['value'] || []

    folder = folders.find { |f| f['name'] == folder_name && f['folder'] }
    return folder if folder

    # Create folder if it doesn't exist
    response = client.post("/me/drive/root/children", {
      name: folder_name,
      folder: {},
      '@microsoft.graph.conflictBehavior' => 'fail'
    })

    response
  rescue => e
    Rails.logger.error "Error finding/creating folder: #{e.message}"
    nil
  end

  def list_folder_files(client, folder_id)
    response = client.get("/me/drive/items/#{folder_id}/children")
    files = response['value'] || []

    # Filter for image and document files (specs)
    files.select { |f| f['file'] && (is_image_file?(f['name']) || is_spec_file?(f['name'])) }
  end

  def is_image_file?(filename)
    extensions = %w[.jpg .jpeg .png .gif .bmp .webp]
    extensions.any? { |ext| filename.downcase.end_with?(ext) }
  end

  def is_spec_file?(filename)
    extensions = %w[.pdf .doc .docx]
    extensions.any? { |ext| filename.downcase.end_with?(ext) }
  end

  def is_qr_code_file?(filename)
    filename.downcase.include?('qr') || filename.downcase.include?('qrcode')
  end

  def is_spec_file_by_name?(filename)
    spec_keywords = %w[spec specification datasheet data_sheet manual]
    spec_keywords.any? { |keyword| filename.downcase.include?(keyword) }
  end

  def match_files_to_items(client, files, items)
    # Create a hash of items by normalized name for quick lookup
    items_by_name = {}
    items.each do |item|
      normalized = normalize_name(item.item_name)
      items_by_name[normalized] ||= []
      items_by_name[normalized] << item
    end

    # Track which items were matched
    matched_items = Set.new

    # Match each file to an item
    files.each do |file|
      filename_without_ext = File.basename(file['name'], '.*')
      normalized_filename = normalize_name(filename_without_ext)

      matching_items = items_by_name[normalized_filename]

      if matching_items && matching_items.any?
        matching_items.each do |item|
          update_item_with_file(client, item, file)
          matched_items.add(item.id)
        end
      else
        @results[:unmatched_files] << file['name']
      end
    end

    # Track items that weren't matched
    items.each do |item|
      unless matched_items.include?(item.id)
        @results[:unmatched_items] << {
          id: item.id,
          name: item.item_name,
          code: item.item_code
        }
      end
    end
  end

  def update_item_with_file(client, item, file)
    # Get sharing link for the file
    share_response = client.post("/me/drive/items/#{file['id']}/createLink", {
      type: "view",
      scope: "organization"
    })

    share_url = share_response.dig('link', 'webUrl')
    filename = file['name']

    # Determine file type and update appropriate field
    if is_qr_code_file?(filename)
      item.update!(
        qr_code_url: share_url,
        image_source: 'onedrive',
        image_fetched_at: Time.current,
        image_fetch_status: 'success'
      )
      @results[:qr_codes_matched] += 1
      Rails.logger.info "Matched QR code '#{filename}' to item '#{item.item_name}' (#{item.item_code})"
    elsif is_spec_file?(filename) || is_spec_file_by_name?(filename)
      item.update!(
        spec_url: share_url,
        image_source: 'onedrive',
        image_fetched_at: Time.current,
        image_fetch_status: 'success'
      )
      @results[:specs_matched] += 1
      Rails.logger.info "Matched spec '#{filename}' to item '#{item.item_name}' (#{item.item_code})"
    else
      item.update!(
        image_url: share_url,
        image_source: 'onedrive',
        image_fetched_at: Time.current,
        image_fetch_status: 'success'
      )
      @results[:photos_matched] += 1
      Rails.logger.info "Matched photo '#{filename}' to item '#{item.item_name}' (#{item.item_code})"
    end

    @results[:matched] += 1
  rescue => e
    @results[:errors] << "Error updating item #{item.item_code}: #{e.message}"
    Rails.logger.error "Error updating item #{item.item_code}: #{e.message}"
  end

  def update_boolean_flags(items)
    # Update requires_photo and requires_spec flags based on what was found
    items.each do |item|
      has_photo = item.image_url.present?
      has_spec = item.spec_url.present?

      # Only update if flags have changed
      if item.requires_photo != has_photo || item.requires_spec != has_spec
        item.update_columns(
          requires_photo: has_photo,
          requires_spec: has_spec
        )
      end
    end
  end

  def normalize_name(name)
    # Remove special characters, extra spaces, and convert to lowercase
    name.to_s
      .downcase
      .gsub(/[^a-z0-9\s]/, ' ')  # Replace special chars with space
      .gsub(/\s+/, ' ')           # Collapse multiple spaces
      .strip
  end
end
