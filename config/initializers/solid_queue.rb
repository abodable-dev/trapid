Rails.application.configure do
  config.solid_queue.recurring_tasks = [
    {
      key: "apply_price_updates",
      class_name: "ApplyPriceUpdatesJob",
      schedule: "0 0 * * *" # Run daily at midnight (cron syntax)
    }
  ]
end
