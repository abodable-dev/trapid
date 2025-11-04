class FetchSupplierImagesJob < ApplicationJob
  queue_as :default

  def perform(supplier_id, limit = 50)
    results = ProductImageScraper.fetch_images_for_supplier(supplier_id, limit: limit)

    Rails.logger.info "Supplier #{supplier_id} image fetch completed: #{results[:success]} succeeded, #{results[:failed]} failed out of #{results[:total]} items"

    results
  end
end
