# Service for generating and executing database schema migrations
# Handles Rails migration generation and execution for schema changes
class SchemaMigrationService
  attr_reader :table, :connection, :migration_log

  def initialize(table)
    @table = table
    @connection = ActiveRecord::Base.connection
    @migration_log = []
  end

  # Add a new column to the table
  def add_column(column_name, column_type, options = {})
    table_name = table.database_table_name

    begin
      connection.add_column(table_name, column_name, column_type, options)
      log_success("Added column '#{column_name}' (#{column_type}) to table '#{table_name}'")
      { success: true, message: "Column added successfully" }
    rescue => e
      log_error("Failed to add column '#{column_name}': #{e.message}")
      { success: false, error: e.message }
    end
  end

  # Remove a column from the table
  def remove_column(column_name)
    table_name = table.database_table_name

    begin
      connection.remove_column(table_name, column_name)
      log_success("Removed column '#{column_name}' from table '#{table_name}'")
      { success: true, message: "Column removed successfully" }
    rescue => e
      log_error("Failed to remove column '#{column_name}': #{e.message}")
      { success: false, error: e.message }
    end
  end

  # Rename a column
  def rename_column(old_name, new_name)
    table_name = table.database_table_name

    begin
      connection.rename_column(table_name, old_name, new_name)
      log_success("Renamed column '#{old_name}' to '#{new_name}' in table '#{table_name}'")
      { success: true, message: "Column renamed successfully" }
    rescue => e
      log_error("Failed to rename column '#{old_name}' to '#{new_name}': #{e.message}")
      { success: false, error: e.message }
    end
  end

  # Change column type with data conversion
  def change_column_type(column_name, new_type, options = {})
    table_name = table.database_table_name
    conversion_strategy = options[:conversion_strategy] || 'clear_invalid'

    begin
      # Build the USING clause for type conversion
      using_clause = build_using_clause(column_name, new_type, conversion_strategy)

      if using_clause
        # Use raw SQL for complex conversions
        sql = "ALTER TABLE #{connection.quote_table_name(table_name)} " \
              "ALTER COLUMN #{connection.quote_column_name(column_name)} " \
              "TYPE #{type_to_sql(new_type)} USING #{using_clause}"
        connection.execute(sql)
      else
        # Simple conversion
        connection.change_column(table_name, column_name, new_type, options)
      end

      log_success("Changed column '#{column_name}' type to #{new_type}")
      { success: true, message: "Column type changed successfully" }
    rescue => e
      log_error("Failed to change column '#{column_name}' type: #{e.message}")
      { success: false, error: e.message }
    end
  end

  # Change column NULL constraint
  def change_column_null(column_name, allow_null)
    table_name = table.database_table_name

    begin
      connection.change_column_null(table_name, column_name, allow_null)
      log_success("Changed column '#{column_name}' NULL constraint to: #{allow_null}")
      { success: true, message: "Column constraint changed successfully" }
    rescue => e
      log_error("Failed to change column '#{column_name}' NULL constraint: #{e.message}")
      { success: false, error: e.message }
    end
  end

  # Change column default value
  def change_column_default(column_name, default_value)
    table_name = table.database_table_name

    begin
      connection.change_column_default(table_name, column_name, default_value)
      log_success("Changed column '#{column_name}' default to: #{default_value}")
      { success: true, message: "Column default changed successfully" }
    rescue => e
      log_error("Failed to change column '#{column_name}' default: #{e.message}")
      { success: false, error: e.message }
    end
  end

  # Rename choice values in a dropdown column
  def rename_choice(column_name, old_value, new_value)
    table_name = table.database_table_name

    begin
      quoted_table = connection.quote_table_name(table_name)
      quoted_column = connection.quote_column_name(column_name)

      sql = "UPDATE #{quoted_table} " \
            "SET #{quoted_column} = #{connection.quote(new_value)} " \
            "WHERE #{quoted_column} = #{connection.quote(old_value)}"

      affected_rows = connection.update(sql)

      log_success("Renamed choice '#{old_value}' to '#{new_value}' in column '#{column_name}' (#{affected_rows} rows affected)")
      { success: true, affected_rows: affected_rows, message: "Choice renamed successfully" }
    rescue => e
      log_error("Failed to rename choice: #{e.message}")
      { success: false, error: e.message }
    end
  end

  # Delete a choice value (with optional replacement)
  def delete_choice(column_name, value_to_delete, replacement_value = nil)
    table_name = table.database_table_name

    begin
      quoted_table = connection.quote_table_name(table_name)
      quoted_column = connection.quote_column_name(column_name)

      if replacement_value
        # Replace with new value
        sql = "UPDATE #{quoted_table} " \
              "SET #{quoted_column} = #{connection.quote(replacement_value)} " \
              "WHERE #{quoted_column} = #{connection.quote(value_to_delete)}"
        affected_rows = connection.update(sql)
        log_success("Replaced choice '#{value_to_delete}' with '#{replacement_value}' (#{affected_rows} rows)")
      else
        # Clear the value (set to NULL)
        sql = "UPDATE #{quoted_table} " \
              "SET #{quoted_column} = NULL " \
              "WHERE #{quoted_column} = #{connection.quote(value_to_delete)}"
        affected_rows = connection.update(sql)
        log_success("Cleared choice '#{value_to_delete}' (#{affected_rows} rows set to NULL)")
      end

      { success: true, affected_rows: affected_rows, message: "Choice deleted successfully" }
    rescue => e
      log_error("Failed to delete choice: #{e.message}")
      { success: false, error: e.message }
    end
  end

  # Merge multiple choice values into one
  def merge_choices(column_name, source_values, target_value)
    table_name = table.database_table_name

    begin
      quoted_table = connection.quote_table_name(table_name)
      quoted_column = connection.quote_column_name(column_name)

      # Build IN clause
      quoted_sources = source_values.map { |v| connection.quote(v) }.join(', ')

      sql = "UPDATE #{quoted_table} " \
            "SET #{quoted_column} = #{connection.quote(target_value)} " \
            "WHERE #{quoted_column} IN (#{quoted_sources})"

      affected_rows = connection.update(sql)

      log_success("Merged choices #{source_values.inspect} into '#{target_value}' (#{affected_rows} rows)")
      { success: true, affected_rows: affected_rows, message: "Choices merged successfully" }
    rescue => e
      log_error("Failed to merge choices: #{e.message}")
      { success: false, error: e.message }
    end
  end

  # Add a generated/computed column with formula
  def add_computed_column(column_name, column_type, formula)
    table_name = table.database_table_name

    begin
      # Convert Excel-like formula to PostgreSQL expression
      pg_expression = convert_excel_formula_to_pg(formula)

      # PostgreSQL syntax for generated column
      sql = "ALTER TABLE #{connection.quote_table_name(table_name)} " \
            "ADD COLUMN #{connection.quote_column_name(column_name)} " \
            "#{type_to_sql(column_type)} GENERATED ALWAYS AS (#{pg_expression}) STORED"

      connection.execute(sql)

      log_success("Added computed column '#{column_name}' with formula: #{formula}")
      { success: true, message: "Computed column added successfully" }
    rescue => e
      log_error("Failed to add computed column '#{column_name}': #{e.message}")
      { success: false, error: e.message }
    end
  end

  # Update a computed column's formula
  def update_computed_column(column_name, new_formula)
    # PostgreSQL doesn't support altering generated columns directly
    # We need to drop and recreate
    table_name = table.database_table_name

    begin
      # Get current column type
      column_info = connection.columns(table_name).find { |c| c.name == column_name }
      column_type = column_info.type

      # Drop the column
      connection.remove_column(table_name, column_name)

      # Recreate with new formula
      result = add_computed_column(column_name, column_type, new_formula)

      if result[:success]
        log_success("Updated computed column '#{column_name}' formula")
        { success: true, message: "Computed column formula updated successfully" }
      else
        result
      end
    rescue => e
      log_error("Failed to update computed column '#{column_name}': #{e.message}")
      { success: false, error: e.message }
    end
  end

  # Get the migration log
  def get_log
    migration_log
  end

  private

  def log_success(message)
    @migration_log << { type: 'success', message: message, timestamp: Time.current }
    Rails.logger.info "[SchemaMigration] #{message}"
  end

  def log_error(message)
    @migration_log << { type: 'error', message: message, timestamp: Time.current }
    Rails.logger.error "[SchemaMigration] #{message}"
  end

  def build_using_clause(column_name, new_type, strategy)
    quoted_column = connection.quote_column_name(column_name)

    case strategy
    when 'clear_invalid'
      # Try to cast, set to NULL if it fails
      case new_type.to_sym
      when :integer, :bigint
        "CASE WHEN #{quoted_column} ~ '^-?[0-9]+$' THEN #{quoted_column}::#{type_to_sql(new_type)} ELSE NULL END"
      when :float, :decimal
        "CASE WHEN #{quoted_column} ~ '^-?[0-9]+\\.?[0-9]*$' THEN #{quoted_column}::#{type_to_sql(new_type)} ELSE NULL END"
      when :boolean
        "CASE WHEN #{quoted_column} IN ('true', 't', 'yes', '1') THEN TRUE WHEN #{quoted_column} IN ('false', 'f', 'no', '0') THEN FALSE ELSE NULL END"
      when :date, :datetime, :timestamp
        "CASE WHEN #{quoted_column} IS NOT NULL THEN #{quoted_column}::#{type_to_sql(new_type)} ELSE NULL END"
      else
        nil # Use default casting
      end
    when 'set_default'
      # Use a default value for invalid conversions (not implemented yet)
      nil
    else
      nil # Use default casting
    end
  end

  def type_to_sql(type)
    case type.to_sym
    when :string
      'VARCHAR(255)'
    when :text
      'TEXT'
    when :integer
      'INTEGER'
    when :bigint
      'BIGINT'
    when :float
      'DOUBLE PRECISION'
    when :decimal
      'DECIMAL'
    when :boolean
      'BOOLEAN'
    when :date
      'DATE'
    when :datetime, :timestamp
      'TIMESTAMP'
    when :json
      'JSON'
    when :jsonb
      'JSONB'
    when :uuid
      'UUID'
    else
      type.to_s.upcase
    end
  end

  def convert_excel_formula_to_pg(formula)
    # Remove leading '=' if present
    expression = formula.start_with?('=') ? formula[1..-1] : formula

    # Convert Excel functions to PostgreSQL equivalents
    conversions = {
      /SUM\(([^)]+)\)/i => 'COALESCE(\1, 0)',
      /AVG\(([^)]+)\)/i => 'COALESCE(\1, 0)',
      /IF\(([^,]+),([^,]+),([^)]+)\)/i => 'CASE WHEN \1 THEN \2 ELSE \3 END',
      /CONCAT\(([^)]+)\)/i => 'CONCAT(\1)',
      /LEN\(([^)]+)\)/i => 'LENGTH(\1)',
      /UPPER\(([^)]+)\)/i => 'UPPER(\1)',
      /LOWER\(([^)]+)\)/i => 'LOWER(\1)',
      /ROUND\(([^,]+),([^)]+)\)/i => 'ROUND(\1::numeric, \2)',
      /ROUND\(([^)]+)\)/i => 'ROUND(\1::numeric)',
      /ABS\(([^)]+)\)/i => 'ABS(\1)'
    }

    conversions.each do |pattern, replacement|
      expression = expression.gsub(pattern, replacement)
    end

    # Convert [column_name] references to proper column names
    expression = expression.gsub(/\[([a-z_][a-z0-9_]*)\]/i) do
      connection.quote_column_name($1)
    end

    expression
  end
end
