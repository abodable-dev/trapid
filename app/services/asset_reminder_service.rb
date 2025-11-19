class AssetReminderService
  def send_reminders
    insurance_reminders = 0
    service_reminders = 0

    # Insurance expiring reminders
    AssetInsurance.expiring_soon(30).find_each do |insurance|
      send_insurance_reminder(insurance)
      insurance_reminders += 1
    end

    # Service due reminders
    AssetServiceHistory.where.not(next_service_date: nil).find_each do |service|
      next unless service.service_due?

      send_service_reminder(service)
      service_reminders += 1
    end

    {
      insurance_reminders_sent: insurance_reminders,
      service_reminders_sent: service_reminders,
      timestamp: Time.current
    }
  end

  private

  def send_insurance_reminder(insurance)
    # TODO: Implement email sending via ActionMailer
    # For now, just log the reminder
    asset = insurance.asset
    days = insurance.days_until_expiry

    Rails.logger.info "Insurance expiring: #{asset.description} - Policy #{insurance.policy_number} expires in #{days} days"

    # Example email implementation:
    # AssetMailer.insurance_expiring_email(insurance).deliver_later
  end

  def send_service_reminder(service)
    # TODO: Implement email sending via ActionMailer
    # For now, just log the reminder
    asset = service.asset
    days = service.days_until_next_service

    Rails.logger.info "Service due: #{asset.description} - Service due in #{days} days"

    # Example email implementation:
    # AssetMailer.service_due_email(service).deliver_later
  end
end
