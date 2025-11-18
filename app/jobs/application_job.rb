class ApplicationJob < ActiveJob::Base
  # Automatically retry jobs that encountered a deadlock with exponential backoff
  retry_on ActiveRecord::Deadlocked, wait: :exponentially_longer, attempts: 5

  # Retry on transient network errors
  retry_on Net::ReadTimeout, wait: 5.seconds, attempts: 3
  retry_on Net::OpenTimeout, wait: 5.seconds, attempts: 3
  retry_on Errno::ECONNREFUSED, wait: 10.seconds, attempts: 3

  # Most jobs are safe to ignore if the underlying records are no longer available
  discard_on ActiveJob::DeserializationError

  # Log all job failures
  rescue_from StandardError do |exception|
    Rails.logger.error("Job #{self.class.name} failed: #{exception.class} - #{exception.message}")
    Rails.logger.error(exception.backtrace.first(10).join("\n"))

    # TODO: Send to error tracking service (Sentry, Rollbar, etc.)
    # ErrorNotifier.notify(exception, job: self.class.name, arguments: arguments)

    # Re-raise so Active Job can handle retry logic
    raise exception
  end
end
