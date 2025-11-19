class AssetReminderJob < ApplicationJob
  queue_as :default

  def perform
    service = AssetReminderService.new
    result = service.send_reminders

    Rails.logger.info "AssetReminderJob completed: #{result[:insurance_reminders_sent]} insurance reminders, #{result[:service_reminders_sent]} service reminders sent at #{result[:timestamp]}"
  end
end
