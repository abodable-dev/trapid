require 'httparty'
require 'cloudinary'
require 'open-uri'

class ProductImageScraper
  include HTTParty
  base_uri 'https://www.googleapis.com'

  GOOGLE_SEARCH_API_KEY = ENV['GOOGLE_SEARCH_API_KEY'] # Optional - for better results
  GOOGLE_CX = ENV['GOOGLE_SEARCH_CX'] # Optional - Custom Search Engine ID

  def initialize(pricebook_item)
    @item = pricebook_item
    @supplier = @item.supplier
  end

  # Main method to fetch and upload image
  def fetch_and_upload_image
    @item.update(image_fetch_status: 'fetching')

    # Step 1: Search for images using Google
    image_urls = search_google_images
    return fail_with_error("No images found") if image_urls.empty?

    # Step 2: Use Claude AI to select the best image (placeholder for now)
    best_image_url = select_best_image(image_urls)
    return fail_with_error("No suitable image found") unless best_image_url

    # Step 3: Download and upload to Cloudinary
    cloudinary_url = upload_to_cloudinary(best_image_url)
    return fail_with_error("Upload failed") unless cloudinary_url

    # Step 4: Save to database
    @item.update(
      image_url: cloudinary_url,
      image_source: 'google_cloudinary',
      image_fetched_at: Time.current,
      image_fetch_status: 'success'
    )

    { success: true, image_url: cloudinary_url }
  rescue StandardError => e
    fail_with_error(e.message)
  end

  private

  def search_google_images
    # Build search query
    query = build_search_query

    if GOOGLE_SEARCH_API_KEY && GOOGLE_CX
      # Use official Google Custom Search API (better results, requires API key)
      search_with_google_api(query)
    else
      # Fallback: Scrape Google Images (free, but less reliable)
      search_with_scraping(query)
    end
  end

  def build_search_query
    parts = []
    parts << @supplier.name if @supplier
    parts << @item.brand if @item.brand.present?
    parts << @item.item_code if @item.item_code.present?
    parts << @item.item_name

    query = parts.join(' ')
    # Add "product image" to filter out irrelevant results
    "#{query} product"
  end

  def search_with_google_api(query)
    response = self.class.get('/customsearch/v1', query: {
      key: GOOGLE_SEARCH_API_KEY,
      cx: GOOGLE_CX,
      q: query,
      searchType: 'image',
      num: 10,
      imgSize: 'medium',
      safe: 'active'
    })

    if response.success? && response['items']
      response['items'].map { |item| item.dig('link') }.compact
    else
      []
    end
  rescue StandardError => e
    Rails.logger.error "Google API search failed: #{e.message}"
    []
  end

  def search_with_scraping(query)
    # Simple fallback: Use DuckDuckGo image search (no API key needed)
    # DuckDuckGo is more permissive for scraping than Google
    url = "https://duckduckgo.com/"

    begin
      # First get a token
      response = HTTParty.get(url)

      # Then search for images
      search_url = "https://duckduckgo.com/i.js"
      search_response = HTTParty.get(search_url, query: {
        l: 'us-en',
        o: 'json',
        q: query,
        vqd: extract_vqd_token(response.body),
        f: ',,,',
        p: '1'
      })

      if search_response.success? && search_response.parsed_response
        results = search_response.parsed_response['results'] || []
        results.map { |r| r['image'] }.compact.first(10)
      else
        []
      end
    rescue StandardError => e
      Rails.logger.error "DuckDuckGo search failed: #{e.message}"

      # Ultimate fallback: Use a placeholder or return empty
      []
    end
  end

  def extract_vqd_token(html)
    match = html.match(/vqd='([^']+)'/)
    match ? match[1] : ''
  end

  def select_best_image(image_urls)
    # For now, return the first valid image
    # TODO: Integrate Claude AI to analyze and select the best image
    # Claude would look at each image and determine which is most relevant

    image_urls.each do |url|
      # Quick validation: check if URL is accessible and is an image
      next unless url =~ /\.(jpg|jpeg|png|webp|gif)$/i

      begin
        # Test if image is accessible (HEAD request)
        response = HTTParty.head(url, timeout: 5, follow_redirects: true)
        return url if response.success? && response.headers['content-type']&.include?('image')
      rescue StandardError
        next
      end
    end

    nil
  end

  def upload_to_cloudinary(image_url)
    # Download image temporarily
    temp_file = download_image(image_url)
    return nil unless temp_file

    begin
      # Upload to Cloudinary
      result = Cloudinary::Uploader.upload(
        temp_file.path,
        folder: 'pricebook_items',
        public_id: "item_#{@item.id}",
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: :limit },
          { quality: 'auto:good' },
          { fetch_format: :auto }
        ]
      )

      result['secure_url']
    rescue StandardError => e
      Rails.logger.error "Cloudinary upload failed: #{e.message}"
      nil
    ensure
      temp_file.close! if temp_file
    end
  end

  def download_image(url)
    require 'tempfile'

    temp_file = Tempfile.new(['product_image', '.jpg'])
    temp_file.binmode

    URI.open(url, 'rb', read_timeout: 10) do |source|
      temp_file.write(source.read)
    end

    temp_file.rewind
    temp_file
  rescue StandardError => e
    Rails.logger.error "Image download failed: #{e.message}"
    temp_file&.close!
    nil
  end

  def fail_with_error(message)
    @item.update(
      image_fetch_status: 'failed',
      notes: "Image fetch failed: #{message}"
    )

    { success: false, error: message }
  end

  # Class method to process items in batch
  def self.fetch_images_for_all_items(limit: 100)
    items = PricebookItem
            .where(image_url: nil)
            .where.not(image_fetch_status: 'fetching')
            .limit(limit)

    results = {
      total: items.count,
      success: 0,
      failed: 0,
      errors: []
    }

    items.find_each do |item|
      scraper = new(item)
      result = scraper.fetch_and_upload_image

      if result[:success]
        results[:success] += 1
      else
        results[:failed] += 1
        results[:errors] << {
          item_id: item.id,
          item_name: item.item_name,
          error: result[:error]
        }
      end

      # Rate limiting: sleep between requests
      sleep 1
    end

    results
  end

  # Fetch images for specific supplier
  def self.fetch_images_for_supplier(supplier_id, limit: 50)
    items = PricebookItem
            .where(supplier_id: supplier_id)
            .where(image_url: nil)
            .where.not(image_fetch_status: 'fetching')
            .limit(limit)

    results = { total: items.count, success: 0, failed: 0 }

    items.find_each do |item|
      scraper = new(item)
      result = scraper.fetch_and_upload_image

      results[:success] += 1 if result[:success]
      results[:failed] += 1 unless result[:success]

      sleep 1
    end

    results
  end
end
