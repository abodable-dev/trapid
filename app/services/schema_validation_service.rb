# Service for pre-validating database schema changes before applying them
# Checks for PostgreSQL constraints, foreign keys, indexes, and data compatibility
class SchemaValidationService
  attr_reader :table, :connection, :errors, :warnings

  def initialize(table)
    @table = table
    @connection = ActiveRecord::Base.connection
    @errors = []
    @warnings = []
  end

  # Validate adding a new column
  def validate_add_column(column_name, column_type, options = {})
    reset_messages

    # Check if column already exists
    if column_exists?(column_name)
      add_error("Column '#{column_name}' already exists in table '#{table.database_table_name}'")
      return validation_result
    end

    # Validate column name format
    unless valid_column_name?(column_name)
      add_error("Invalid column name '#{column_name}'. Must start with letter, contain only alphanumeric and underscores")
      return validation_result
    end

    # Check NOT NULL constraint with existing data
    if options[:null] == false && table_has_records?
      unless options[:default].present?
        add_error("Cannot add NOT NULL column without default value when table has existing records")
      end
    end

    # Validate column type
    unless valid_column_type?(column_type)
      add_error("Invalid column type '#{column_type}'")
    end

    validation_result
  end

  # Validate removing a column
  def validate_remove_column(column_name)
    reset_messages

    unless column_exists?(column_name)
      add_error("Column '#{column_name}' does not exist in table '#{table.database_table_name}'")
      return validation_result
    end

    # Check if column is used in indexes
    indexes = indexes_using_column(column_name)
    if indexes.any?
      index_names = indexes.map(&:name).join(', ')
      add_warning("Column is used in indexes: #{index_names}. These indexes will be dropped.")
    end

    # Check if column is referenced by foreign keys
    foreign_keys = foreign_keys_referencing_column(column_name)
    if foreign_keys.any?
      fk_info = foreign_keys.map { |fk| "#{fk.from_table}.#{fk.column}" }.join(', ')
      add_error("Column is referenced by foreign keys: #{fk_info}. Remove these foreign keys first.")
    end

    # Warn about data loss
    if table_has_records?
      record_count = get_record_count
      add_warning("This will permanently delete data in column '#{column_name}' for #{record_count} record(s)")
    end

    validation_result
  end

  # Validate renaming a column
  def validate_rename_column(old_name, new_name)
    reset_messages

    unless column_exists?(old_name)
      add_error("Column '#{old_name}' does not exist")
      return validation_result
    end

    if column_exists?(new_name)
      add_error("Column '#{new_name}' already exists")
      return validation_result
    end

    unless valid_column_name?(new_name)
      add_error("Invalid new column name '#{new_name}'")
      return validation_result
    end

    # Check if column is used in generated columns (formulas)
    formula_columns = columns_with_formulas_referencing(old_name)
    if formula_columns.any?
      column_names = formula_columns.map(&:name).join(', ')
      add_warning("Column is referenced in formulas: #{column_names}. These will need to be updated.")
    end

    validation_result
  end

  # Validate changing column type
  def validate_change_column_type(column_name, old_type, new_type, conversion_strategy = 'clear_invalid')
    reset_messages

    unless column_exists?(column_name)
      add_error("Column '#{column_name}' does not exist")
      return validation_result
    end

    # Check if conversion is possible
    conversion_info = analyze_type_conversion(column_name, old_type, new_type)

    if conversion_info[:incompatible]
      add_error("Cannot convert #{old_type} to #{new_type}: #{conversion_info[:reason]}")
      return validation_result
    end

    # Warn about data loss or conversion issues
    if table_has_records? && conversion_info[:may_lose_data]
      case conversion_strategy
      when 'clear_invalid'
        invalid_count = count_invalid_conversions(column_name, old_type, new_type)
        if invalid_count > 0
          add_warning("#{invalid_count} record(s) have values that cannot be converted. They will be set to NULL.")
        end
      when 'fail_on_invalid'
        invalid_count = count_invalid_conversions(column_name, old_type, new_type)
        if invalid_count > 0
          add_error("#{invalid_count} record(s) have invalid values for conversion. Fix these first or choose 'clear_invalid' strategy.")
        end
      end
    end

    # Check if column is used in indexes that might need rebuilding
    indexes = indexes_using_column(column_name)
    if indexes.any? && !types_index_compatible?(old_type, new_type)
      add_warning("Indexes will be rebuilt: #{indexes.map(&:name).join(', ')}")
    end

    validation_result
  end

  # Validate changing NOT NULL constraint
  def validate_change_null_constraint(column_name, allow_null)
    reset_messages

    unless column_exists?(column_name)
      add_error("Column '#{column_name}' does not exist")
      return validation_result
    end

    # If setting to NOT NULL, check for existing NULL values
    if !allow_null && table_has_records?
      null_count = count_null_values(column_name)
      if null_count > 0
        add_error("Cannot set NOT NULL constraint: #{null_count} record(s) have NULL values. Update these records first.")
      end
    end

    validation_result
  end

  # Validate formula syntax
  def validate_formula(formula_expression, table_columns)
    reset_messages

    if formula_expression.blank?
      add_error("Formula cannot be empty")
      return validation_result
    end

    # Check for valid Excel-like syntax
    unless formula_expression.start_with?('=')
      add_error("Formula must start with '='")
      return validation_result
    end

    # Extract column references and validate they exist
    referenced_columns = extract_column_references(formula_expression)
    invalid_refs = referenced_columns - table_columns.map(&:column_name)

    if invalid_refs.any?
      add_error("Formula references non-existent columns: #{invalid_refs.join(', ')}")
    end

    # Try to parse the formula (basic validation)
    begin
      # Remove the leading '=' and validate basic syntax
      expression = formula_expression[1..-1]
      validate_formula_syntax(expression)
    rescue => e
      add_error("Invalid formula syntax: #{e.message}")
    end

    validation_result
  end

  private

  def reset_messages
    @errors = []
    @warnings = []
  end

  def validation_result
    {
      valid: errors.empty?,
      errors: errors,
      warnings: warnings
    }
  end

  def add_error(message)
    @errors << message
  end

  def add_warning(message)
    @warnings << message
  end

  def column_exists?(column_name)
    connection.column_exists?(table.database_table_name, column_name)
  end

  def valid_column_name?(name)
    # PostgreSQL column naming rules: start with letter, alphanumeric + underscore
    name =~ /\A[a-z_][a-z0-9_]*\z/i
  end

  def valid_column_type?(column_type)
    valid_types = %w[
      string text integer bigint float decimal boolean date datetime timestamp
      json jsonb uuid binary
    ]
    valid_types.include?(column_type.to_s)
  end

  def table_has_records?
    get_record_count > 0
  rescue
    false
  end

  def get_record_count
    connection.select_value("SELECT COUNT(*) FROM #{connection.quote_table_name(table.database_table_name)}").to_i
  end

  def indexes_using_column(column_name)
    connection.indexes(table.database_table_name).select do |index|
      index.columns.include?(column_name.to_s)
    end
  end

  def foreign_keys_referencing_column(column_name)
    # Get foreign keys FROM other tables TO this table's column
    all_tables = connection.tables
    foreign_keys = []

    all_tables.each do |other_table|
      connection.foreign_keys(other_table).each do |fk|
        if fk.to_table == table.database_table_name && fk.primary_key == column_name
          foreign_keys << fk
        end
      end
    end

    foreign_keys
  end

  def columns_with_formulas_referencing(column_name)
    # This assumes you have a way to store formulas - adjust based on your schema
    table.columns.select do |col|
      col.respond_to?(:formula) && col.formula.present? && col.formula.include?(column_name)
    end
  end

  def analyze_type_conversion(column_name, old_type, new_type)
    # Define conversion compatibility matrix
    conversions = {
      # From text types
      'string' => {
        'text' => { safe: true },
        'integer' => { safe: false, may_lose_data: true },
        'float' => { safe: false, may_lose_data: true },
        'boolean' => { safe: false, may_lose_data: true },
        'date' => { safe: false, may_lose_data: true },
        'datetime' => { safe: false, may_lose_data: true }
      },
      'text' => {
        'string' => { safe: false, may_lose_data: true }, # might truncate
        'integer' => { safe: false, may_lose_data: true },
        'float' => { safe: false, may_lose_data: true }
      },
      # From numeric types
      'integer' => {
        'bigint' => { safe: true },
        'float' => { safe: true },
        'decimal' => { safe: true },
        'string' => { safe: true },
        'text' => { safe: true },
        'boolean' => { safe: false, may_lose_data: true }
      },
      'float' => {
        'decimal' => { safe: true },
        'string' => { safe: true },
        'text' => { safe: true },
        'integer' => { safe: false, may_lose_data: true }
      },
      # From boolean
      'boolean' => {
        'string' => { safe: true },
        'text' => { safe: true },
        'integer' => { safe: true }
      },
      # From date/time types
      'date' => {
        'datetime' => { safe: true },
        'timestamp' => { safe: true },
        'string' => { safe: true },
        'text' => { safe: true }
      },
      'datetime' => {
        'timestamp' => { safe: true },
        'string' => { safe: true },
        'text' => { safe: true },
        'date' => { safe: false, may_lose_data: true } # loses time
      }
    }

    conversion = conversions.dig(old_type.to_s, new_type.to_s)

    if conversion.nil?
      {
        incompatible: true,
        reason: "No conversion path defined from #{old_type} to #{new_type}",
        may_lose_data: true
      }
    else
      conversion.merge(incompatible: false)
    end
  end

  def count_invalid_conversions(column_name, old_type, new_type)
    quoted_column = connection.quote_column_name(column_name)
    quoted_table = connection.quote_table_name(table.database_table_name)

    case "#{old_type}_to_#{new_type}"
    when 'string_to_integer', 'text_to_integer'
      # Count rows where value cannot be cast to integer
      connection.select_value("
        SELECT COUNT(*) FROM #{quoted_table}
        WHERE #{quoted_column} IS NOT NULL
        AND #{quoted_column} !~ '^-?[0-9]+$'
      ").to_i
    when 'string_to_float', 'text_to_float'
      # Count rows where value cannot be cast to float
      connection.select_value("
        SELECT COUNT(*) FROM #{quoted_table}
        WHERE #{quoted_column} IS NOT NULL
        AND #{quoted_column} !~ '^-?[0-9]+\\.?[0-9]*$'
      ").to_i
    when 'string_to_date', 'text_to_date'
      # Count rows where value cannot be cast to date
      begin
        connection.select_value("
          SELECT COUNT(*) FROM #{quoted_table}
          WHERE #{quoted_column} IS NOT NULL
          AND #{quoted_column}::date IS NULL
        ").to_i
      rescue
        0
      end
    else
      0
    end
  end

  def count_null_values(column_name)
    quoted_column = connection.quote_column_name(column_name)
    quoted_table = connection.quote_table_name(table.database_table_name)

    connection.select_value("
      SELECT COUNT(*) FROM #{quoted_table}
      WHERE #{quoted_column} IS NULL
    ").to_i
  end

  def types_index_compatible?(old_type, new_type)
    # Some type changes don't require index rebuilding
    compatible_changes = [
      ['string', 'text'],
      ['integer', 'bigint'],
      ['datetime', 'timestamp']
    ]

    compatible_changes.any? { |pair| pair == [old_type.to_s, new_type.to_s] }
  end

  def extract_column_references(formula)
    # Extract column references from formula (simple implementation)
    # Assumes columns are referenced as [column_name] or column_name
    references = []

    # Match [column_name] pattern
    formula.scan(/\[([a-z_][a-z0-9_]*)\]/i).each do |match|
      references << match[0]
    end

    # Match standalone identifiers that aren't functions
    formula.scan(/\b([a-z_][a-z0-9_]*)\b/i).each do |match|
      identifier = match[0].downcase
      # Skip common Excel functions
      unless excel_function?(identifier)
        references << match[0]
      end
    end

    references.uniq
  end

  def excel_function?(name)
    functions = %w[
      sum avg count min max if and or not abs round floor ceiling
      concat left right mid len trim upper lower
    ]
    functions.include?(name.downcase)
  end

  def validate_formula_syntax(expression)
    # Basic syntax validation
    # Check balanced parentheses
    paren_count = 0
    expression.each_char do |char|
      paren_count += 1 if char == '('
      paren_count -= 1 if char == ')'
      raise "Unbalanced parentheses" if paren_count < 0
    end
    raise "Unbalanced parentheses" if paren_count != 0

    # Check for common syntax errors
    raise "Empty expression" if expression.strip.empty?
    raise "Formula cannot end with operator" if expression =~ /[+\-*\/]$/
  end
end
