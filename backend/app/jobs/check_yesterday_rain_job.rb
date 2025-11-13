class CheckYesterdayRainJob < ApplicationJob
  queue_as :default

  # Check yesterday's weather for all active constructions
  # Auto-creates rain log entries if rainfall detected
  def perform
    yesterday = Date.yesterday
    weather_client = WeatherApiClient.new

    Rails.logger.info("Checking yesterday's rain for all active jobs (#{yesterday})")

    active_jobs_checked = 0
    rain_logs_created = 0
    errors = []

    Construction.active.find_each do |construction|
      active_jobs_checked += 1

      # Get location from job
      location = extract_location(construction)

      unless location
        Rails.logger.warn("No location found for construction #{construction.id} - #{construction.title}")
        errors << { construction_id: construction.id, error: 'No location' }
        next
      end

      begin
        # Fetch weather data
        weather_data = weather_client.fetch_historical(location, yesterday)

        # Skip if no rainfall
        rainfall_mm = weather_data[:rainfall_mm]
        next if rainfall_mm.nil? || rainfall_mm.zero?

        # Check if log already exists for this date
        existing_log = construction.rain_logs.find_by(date: yesterday)
        if existing_log
          Rails.logger.info("Rain log already exists for #{construction.title} on #{yesterday}")
          next
        end

        # Create rain log entry
        rain_log = construction.rain_logs.create!(
          date: yesterday,
          rainfall_mm: rainfall_mm,
          severity: RainLog.calculate_severity(rainfall_mm),
          source: 'automatic',
          weather_api_response: weather_data[:raw_response]
        )

        rain_logs_created += 1
        Rails.logger.info("Created rain log for #{construction.title}: #{rainfall_mm}mm on #{yesterday}")

      rescue WeatherApiClient::Error => e
        Rails.logger.error("Weather API error for #{construction.title}: #{e.message}")
        errors << { construction_id: construction.id, error: e.message }
      rescue StandardError => e
        Rails.logger.error("Failed to create rain log for #{construction.title}: #{e.message}")
        errors << { construction_id: construction.id, error: e.message }
      end
    end

    # Log summary
    Rails.logger.info(
      "Rain check complete: #{active_jobs_checked} jobs checked, " \
      "#{rain_logs_created} rain logs created, #{errors.count} errors"
    )

    # Return summary
    {
      date: yesterday,
      active_jobs_checked: active_jobs_checked,
      rain_logs_created: rain_logs_created,
      errors: errors
    }
  end

  private

  # Extract location from construction record
  # Priority: location field, then parse from project site_address
  def extract_location(construction)
    # First check if construction has a location field
    return construction.location if construction.respond_to?(:location) && construction.location.present?

    # Try to get from project's site_address
    if construction.project&.site_address.present?
      # Extract suburb/city from address (basic parsing)
      address = construction.project.site_address
      # Try to extract the suburb (usually after first comma or last line)
      parts = address.split(',').map(&:strip)
      return parts[-2] if parts.length > 1  # Usually suburb is second-to-last
    end

    # Fallback: try to extract from construction title
    # (e.g., "House Build - Bondi" => "Bondi")
    if construction.title.include?('-')
      potential_location = construction.title.split('-').last.strip
      return potential_location if potential_location.present?
    end

    nil
  end
end
