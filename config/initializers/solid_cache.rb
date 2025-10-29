# Configure SolidCache to use the primary database connection
Rails.application.config.after_initialize do
  if Rails.env.production?
    SolidCache.connects_to database: { writing: :primary, reading: :primary }
  end
end
