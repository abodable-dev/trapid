class Table < ApplicationRecord
  has_many :columns, dependent: :destroy

  validates :name, presence: true
  validates :database_table_name, presence: true, uniqueness: true

  before_validation :generate_database_table_name, if: -> { database_table_name.blank? }

  # Get the dynamically created ActiveRecord model for this table
  def dynamic_model
    return @dynamic_model if @dynamic_model

    class_name = name.classify
    table_name = database_table_name

    # Check if class already exists
    if Object.const_defined?(class_name)
      @dynamic_model = Object.const_get(class_name)
    else
      # Create the dynamic model class
      @dynamic_model = Object.const_set(class_name, Class.new(ApplicationRecord) do
        self.table_name = table_name
      end)
    end

    @dynamic_model
  end

  # Reload the dynamic model (useful after adding columns or relationships)
  def reload_dynamic_model
    class_name = name.classify
    Object.send(:remove_const, class_name) if Object.const_defined?(class_name)
    @dynamic_model = nil
    dynamic_model
  end

  private

  def generate_database_table_name
    # Generate a safe database table name from the name field
    # e.g., "My Contacts" => "my_contacts_abc123"
    base_name = name.parameterize(separator: '_')
    # Add a random suffix to avoid collisions
    random_suffix = SecureRandom.hex(4)
    self.database_table_name = "user_#{base_name}_#{random_suffix}"
  end
end
