class Table < ApplicationRecord
  has_many :columns, dependent: :destroy

  RESERVED_NAMES = %w[user users table tables column columns record records].freeze

  validates :name, presence: true
  validates :database_table_name, presence: true, uniqueness: true
  validate :name_not_reserved

  before_validation :generate_database_table_name, if: -> { database_table_name.blank? }

  # Get the dynamically created ActiveRecord model for this table
  def dynamic_model
    return @dynamic_model if @dynamic_model

    # Generate a valid class name from the table name
    # Classify will handle spaces and special characters
    class_name = name.gsub(/[^a-zA-Z0-9_]/, '').classify
    table_name = database_table_name

    # Check if class already exists
    begin
      if Object.const_defined?(class_name)
        @dynamic_model = Object.const_get(class_name)
      else
        # Create the dynamic model class
        @dynamic_model = Object.const_set(class_name, Class.new(ApplicationRecord) do
          self.table_name = table_name
        end)
      end
    rescue NameError => e
      # If we can't create the constant, create a generic class
      # This shouldn't happen with our sanitization, but just in case
      Rails.logger.error "Failed to create dynamic model for table #{id}: #{e.message}"
      @dynamic_model = Class.new(ApplicationRecord) do
        self.table_name = table_name
      end
    end

    @dynamic_model
  end

  # Reload the dynamic model (useful after adding columns or relationships)
  def reload_dynamic_model
    # Use the same sanitization as dynamic_model
    class_name = name.gsub(/[^a-zA-Z0-9_]/, '').classify
    # Only try to remove the constant if it's a valid constant name
    begin
      Object.send(:remove_const, class_name) if Object.const_defined?(class_name)
    rescue NameError
      # If class name is invalid, just skip this step
    end
    @dynamic_model = nil
    dynamic_model
  end

  private

  def name_not_reserved
    if name.present? && RESERVED_NAMES.include?(name.downcase)
      errors.add(:name, "cannot be a reserved name (#{RESERVED_NAMES.join(', ')})")
    end
  end

  def generate_database_table_name
    # Generate a safe database table name from the name field
    # e.g., "My Contacts" => "my_contacts_abc123"
    base_name = name.parameterize(separator: '_')
    # Add a random suffix to avoid collisions
    random_suffix = SecureRandom.hex(4)
    self.database_table_name = "user_#{base_name}_#{random_suffix}"
  end
end
