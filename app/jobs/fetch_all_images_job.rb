class FetchAllImagesJob < ApplicationJob
  queue_as :default

  def perform(limit = 100)
    results = ProductImageScraper.fetch_images_for_all_items(limit: limit)

    Rails.logger.info "Batch image fetch completed: #{results[:success]} succeeded, #{results[:failed]} failed out of #{results[:total]} items"

    results
  end
end
