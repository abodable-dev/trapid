class ComplianceReminderJob < ApplicationJob
  queue_as :default

  def perform
    service = ComplianceReminderService.new
    result = service.send_reminders

    Rails.logger.info "ComplianceReminderJob completed: #{result[:reminders_sent]} reminders sent at #{result[:timestamp]}"
  end
end
