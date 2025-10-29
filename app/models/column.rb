class Column < ApplicationRecord
  belongs_to :table
  belongs_to :lookup_table, class_name: 'Table', optional: true, foreign_key: :lookup_table_id

  validates :name, presence: true
  validates :column_name, presence: true, uniqueness: { scope: :table_id }
  validates :column_type, presence: true, inclusion: {
    in: %w[
      single_line_text
      email
      multiple_lines_text
      date
      date_and_time
      choice
      lookup
      boolean
      number
      percentage
      currency
      whole_number
      computed
      user
      multiple_lookups
    ]
  }

  before_validation :generate_column_name, if: -> { column_name.blank? }

  # Map column types to database column types
  COLUMN_TYPE_MAP = {
    'single_line_text' => :string,
    'email' => :string,
    'multiple_lines_text' => :text,
    'date' => :date,
    'date_and_time' => :datetime,
    'number' => :decimal,
    'percentage' => :decimal,
    'currency' => :decimal,
    'whole_number' => :integer,
    'boolean' => :boolean,
    'lookup' => :integer,  # foreign key
    'choice' => :string,
    'computed' => :string,  # stored as string
    'user' => :integer,  # foreign key to users
    'multiple_lookups' => :text  # stored as JSON array
  }.freeze

  def db_type
    COLUMN_TYPE_MAP[column_type]
  end

  private

  def generate_column_name
    # Generate a safe database column name from the name field
    # e.g., "Contact Email" => "contact_email"
    self.column_name = name.parameterize(separator: '_')
  end
end
