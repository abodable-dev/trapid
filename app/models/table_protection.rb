class TableProtection < ApplicationRecord
  validates :table_name, presence: true, uniqueness: true
  validates :is_protected, inclusion: { in: [true, false] }

  scope :protected_tables, -> { where(is_protected: true) }
  scope :unprotected_tables, -> { where(is_protected: false) }

  # Check if a table is protected from schema modifications
  def self.table_protected?(table_name)
    exists?(table_name: table_name.to_s, is_protected: true)
  end

  # Get list of all protected table names
  def self.protected_table_names
    protected_tables.pluck(:table_name)
  end

  # Check if table can be modified
  def editable?
    !is_protected
  end
end
