class FormulaEvaluator
  def initialize(table)
    @table = table
    @calculator = Dentaku::Calculator.new
  end

  # Evaluate a formula for a specific record
  def evaluate(formula_expression, record_data)
    return nil if formula_expression.blank?

    # Convert field references like {Field Name} to variable names
    # Store mapping of variable names to actual values
    variables = {}
    processed_formula = formula_expression.dup

    # Find all field references in the format {Field Name}
    formula_expression.scan(/\{([^}]+)\}/).each do |match|
      field_name = match[0]

      # Find the column with this name
      column = @table.columns.find { |c| c.name == field_name }

      if column
        # Create a safe variable name (replace spaces with underscores, etc.)
        var_name = field_name.gsub(/[^a-zA-Z0-9_]/, '_').downcase

        # Get the value from the record data
        value = record_data[column.column_name]

        # Convert to numeric if possible, otherwise use as string
        numeric_value = value.to_f if value.present? && value.to_s.match?(/^-?\d*\.?\d+$/)
        variables[var_name] = numeric_value || value || 0

        # Replace {Field Name} with var_name in the formula
        processed_formula.gsub!("{#{field_name}}", var_name)
      else
        # Field not found, replace with 0
        processed_formula.gsub!("{#{field_name}}", "0")
      end
    end

    begin
      # Evaluate the formula with the variables
      result = @calculator.evaluate(processed_formula, variables)

      # Round to 2 decimal places if it's a float
      result.is_a?(Float) ? result.round(2) : result
    rescue Dentaku::ParseError, Dentaku::ArgumentError => e
      Rails.logger.error("Formula evaluation error: #{e.message}")
      "ERROR: #{e.message}"
    rescue => e
      Rails.logger.error("Unexpected formula error: #{e.class} - #{e.message}")
      "ERROR"
    end
  end

  # Batch evaluate formula for multiple records
  def evaluate_for_records(formula_expression, records)
    records.map do |record|
      evaluate(formula_expression, record)
    end
  end
end
