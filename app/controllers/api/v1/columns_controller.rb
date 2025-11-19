module Api
  module V1
    class ColumnsController < ApplicationController
      before_action :set_table
      before_action :set_column, only: [:update, :destroy]
      before_action :require_schema_edit_permission, only: [:create, :update, :destroy, :rename_choice, :delete_choice, :merge_choices, :apply_change]
      before_action :check_table_protection, only: [:create, :update, :destroy, :rename_choice, :delete_choice, :merge_choices, :apply_change]

      # POST /api/v1/tables/:table_id/columns
      def create
        column = @table.columns.build(column_params)
        column.position = @table.columns.maximum(:position).to_i + 1

        if column.save
          # Rebuild the database table with the new column
          # Reload table with columns association
          table_reloaded = Table.includes(:columns).find(@table.id)
          builder = TableBuilder.new(table_reloaded)
          result = builder.create_database_table

          if result[:success]
            # Reload the dynamic model to pick up new columns
            table_reloaded.reload_dynamic_model
            # Reset the connection's schema cache for this table
            ActiveRecord::Base.connection.schema_cache.clear_data_source_cache!(table_reloaded.database_table_name)

            render json: {
              success: true,
              column: column_json(column)
            }, status: :created
          else
            # Log the error for debugging
            Rails.logger.error "TableBuilder failed: #{result[:errors].inspect}"
            column.destroy
            render json: {
              success: false,
              errors: result[:errors]
            }, status: :unprocessable_entity
          end
        else
          render json: {
            success: false,
            errors: column.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/tables/:table_id/columns/:id
      def update
        if @column.update(column_params)
          # Rebuild the database table to reflect the changes
          table_reloaded = Table.includes(:columns).find(@table.id)
          builder = TableBuilder.new(table_reloaded)
          result = builder.create_database_table

          if result[:success]
            # Reload the dynamic model to pick up changes
            table_reloaded.reload_dynamic_model
            # Reset the connection's schema cache for this table
            ActiveRecord::Base.connection.schema_cache.clear_data_source_cache!(table_reloaded.database_table_name)

            render json: {
              success: true,
              column: column_json(@column)
            }
          else
            render json: {
              success: false,
              errors: result[:errors]
            }, status: :unprocessable_entity
          end
        else
          render json: {
            success: false,
            errors: @column.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/tables/:table_id/columns/:id
      def destroy
        @column.destroy

        # Rebuild the database table without this column
        table_reloaded = Table.includes(:columns).find(@table.id)
        builder = TableBuilder.new(table_reloaded)
        result = builder.create_database_table

        if result[:success]
          render json: { success: true }
        else
          render json: {
            success: false,
            errors: result[:errors]
          }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/tables/:table_id/columns/:id/lookup_options
      def lookup_options
        column = @table.columns.find(params[:id])

        unless column.column_type.in?(['lookup', 'multiple_lookups'])
          return render json: { error: 'Not a lookup column' }, status: :bad_request
        end

        unless column.lookup_table
          return render json: { error: 'Lookup table not configured' }, status: :unprocessable_entity
        end

        target_table = column.lookup_table
        records = target_table.dynamic_model.limit(1000).order(:id)

        options = records.map do |record|
          {
            id: record.id,
            display: record.send(column.lookup_display_column).to_s
          }
        rescue => e
          Rails.logger.error "Error reading lookup value: #{e.message}"
          { id: record.id, display: "[Error]" }
        end

        render json: {
          success: true,
          options: options
        }
      rescue => e
        render json: { error: e.message }, status: :internal_server_error
      end

      # POST /api/v1/tables/:table_id/columns/test_formula
      def test_formula
        formula_expression = params[:formula]

        if formula_expression.blank?
          return render json: { error: 'Formula is required' }, status: :bad_request
        end

        # Get a sample record to test with (first record or a specific one if provided)
        record_id = params[:record_id]
        model = @table.dynamic_model

        if record_id.present?
          record = model.find_by(id: record_id)
        else
          record = model.first
        end

        unless record
          return render json: {
            success: false,
            error: 'No records available to test the formula. Please add at least one record first.'
          }
        end

        # Build record data hash
        record_data = {}
        @table.columns.each do |column|
          record_data[column.column_name] = record.send(column.column_name) if record.respond_to?(column.column_name)
        end

        # Evaluate the formula
        evaluator = FormulaEvaluator.new(@table)
        result = evaluator.evaluate(formula_expression, record_data, record)

        # Check if formula uses cross-table references
        uses_cross_table = FormulaEvaluator.uses_cross_table_references?(formula_expression)

        render json: {
          success: true,
          result: result,
          uses_cross_table_refs: uses_cross_table,
          tested_with_record_id: record.id,
          sample_data: record_data.slice(*record_data.keys.first(5)) # Show first 5 fields as sample
        }
      rescue => e
        Rails.logger.error "Formula test error: #{e.message}"
        render json: {
          success: false,
          error: e.message
        }, status: :unprocessable_entity
      end

      # GET /api/v1/tables/:table_id/columns/:id/choices
      # Get unique values (choices) from a column
      def choices
        column = @table.columns.find(params[:id])

        begin
          model = @table.dynamic_model
          quoted_column = model.connection.quote_column_name(column.column_name)

          # Get distinct non-null values
          values = model.distinct.where.not(column.column_name => nil)
                       .pluck(column.column_name)
                       .compact
                       .sort

          # Count occurrences for each value
          choices_with_counts = values.map do |value|
            count = model.where(column.column_name => value).count
            { value: value, count: count }
          end

          render json: {
            success: true,
            choices: choices_with_counts,
            total_records: model.count
          }
        rescue => e
          render json: {
            success: false,
            error: e.message
          }, status: :internal_server_error
        end
      end

      # POST /api/v1/tables/:table_id/columns/:id/rename_choice
      # Rename a choice value across all records
      def rename_choice
        column = @table.columns.find(params[:id])
        old_value = params[:old_value]
        new_value = params[:new_value]

        if old_value.blank? || new_value.blank?
          return render json: {
            success: false,
            error: 'Both old_value and new_value are required'
          }, status: :bad_request
        end

        migration_service = SchemaMigrationService.new(@table)
        result = migration_service.rename_choice(column.column_name, old_value, new_value)

        if result[:success]
          render json: result
        else
          render json: result, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/tables/:table_id/columns/:id/delete_choice
      # Delete a choice value (with optional replacement)
      def delete_choice
        column = @table.columns.find(params[:id])
        value_to_delete = params[:value]
        replacement_value = params[:replacement_value]

        if value_to_delete.blank?
          return render json: {
            success: false,
            error: 'value parameter is required'
          }, status: :bad_request
        end

        migration_service = SchemaMigrationService.new(@table)
        result = migration_service.delete_choice(column.column_name, value_to_delete, replacement_value)

        if result[:success]
          render json: result
        else
          render json: result, status: :unprocessable_entity
        end
      end

      # POST /api/v1/tables/:table_id/columns/:id/merge_choices
      # Merge multiple choice values into one
      def merge_choices
        column = @table.columns.find(params[:id])
        source_values = params[:source_values]
        target_value = params[:target_value]

        if source_values.blank? || target_value.blank?
          return render json: {
            success: false,
            error: 'source_values (array) and target_value are required'
          }, status: :bad_request
        end

        migration_service = SchemaMigrationService.new(@table)
        result = migration_service.merge_choices(column.column_name, source_values, target_value)

        if result[:success]
          render json: result
        else
          render json: result, status: :unprocessable_entity
        end
      end

      # POST /api/v1/tables/:table_id/columns/:id/validate_change
      # Validate a schema change before applying it
      def validate_change
        column = @table.columns.find(params[:id])
        change_type = params[:change_type]

        validation_service = SchemaValidationService.new(@table)

        result = case change_type
        when 'change_type'
          old_type = column.column_type
          new_type = params[:new_type]
          conversion_strategy = params[:conversion_strategy] || 'clear_invalid'
          validation_service.validate_change_column_type(column.column_name, old_type, new_type, conversion_strategy)
        when 'rename'
          new_name = params[:new_name]
          validation_service.validate_rename_column(column.column_name, new_name)
        when 'delete'
          validation_service.validate_remove_column(column.column_name)
        when 'change_null'
          allow_null = params[:allow_null]
          validation_service.validate_change_null_constraint(column.column_name, allow_null)
        else
          { valid: false, errors: ["Unknown change_type: #{change_type}"], warnings: [] }
        end

        render json: result
      end

      # POST /api/v1/tables/:table_id/columns/:id/apply_change
      # Apply a schema change (after validation)
      def apply_change
        column = @table.columns.find(params[:id])
        change_type = params[:change_type]

        migration_service = SchemaMigrationService.new(@table)

        result = case change_type
        when 'change_type'
          new_type = params[:new_type]
          conversion_strategy = params[:conversion_strategy] || 'clear_invalid'
          migration_service.change_column_type(column.column_name, new_type, conversion_strategy: conversion_strategy)
        when 'rename'
          new_name = params[:new_name]
          migration_service.rename_column(column.column_name, new_name)
        when 'delete'
          migration_service.remove_column(column.column_name)
        when 'change_null'
          allow_null = params[:allow_null]
          migration_service.change_column_null(column.column_name, allow_null)
        when 'change_default'
          default_value = params[:default_value]
          migration_service.change_column_default(column.column_name, default_value)
        else
          { success: false, error: "Unknown change_type: #{change_type}" }
        end

        if result[:success]
          # Reload the table and reset schema cache
          @table.reload
          ActiveRecord::Base.connection.schema_cache.clear_data_source_cache!(@table.database_table_name)

          render json: result.merge(log: migration_service.get_log)
        else
          render json: result, status: :unprocessable_entity
        end
      end

      # GET /api/v1/tables/:table_id/columns/:id/lookup_search?q=search_term
      def lookup_search
        column = @table.columns.find(params[:id])

        unless column.column_type.in?(['lookup', 'multiple_lookups'])
          return render json: { error: 'Not a lookup column' }, status: :bad_request
        end

        unless column.lookup_table
          return render json: { error: 'Lookup table not configured' }, status: :unprocessable_entity
        end

        search_term = params[:q].to_s.strip
        target_table = column.lookup_table
        model = target_table.dynamic_model

        # If no search term, return top 20 recent records
        if search_term.blank?
          records = model.limit(20).order(created_at: :desc)
        else
          # Get all searchable columns from the target table
          searchable_columns = target_table.columns
            .where(searchable: true)
            .pluck(:column_name)

          # If no searchable columns defined, search all text/string columns
          if searchable_columns.empty?
            searchable_columns = target_table.columns
              .where(column_type: ['single_line_text', 'email', 'phone', 'url', 'multiple_lines_text'])
              .pluck(:column_name)
          end

          # Build search query across all searchable columns
          if searchable_columns.any?
            # Sanitize column names to prevent SQL injection
            search_conditions = searchable_columns.map { |col|
              "#{model.connection.quote_column_name(col)} ILIKE :search"
            }.join(' OR ')
            records = model.where(search_conditions, search: "%#{search_term}%")
              .limit(20)
              .order(:id)
          else
            # Fallback: just search the display column (sanitized)
            quoted_column = model.connection.quote_column_name(column.lookup_display_column)
            records = model.where(
              "#{quoted_column} ILIKE :search",
              search: "%#{search_term}%"
            ).limit(20).order(:id)
          end
        end

        # Build result with display value and additional context
        results = records.map do |record|
          # Get all text columns for context
          context_fields = {}
          target_table.columns
            .where(column_type: ['single_line_text', 'email', 'phone', 'url'])
            .limit(3)
            .each do |col|
              value = record.send(col.column_name)
              context_fields[col.name] = value if value.present?
            end

          {
            id: record.id,
            display: record.send(column.lookup_display_column).to_s,
            context: context_fields
          }
        rescue => e
          Rails.logger.error "Error reading lookup search result: #{e.message}"
          {
            id: record.id,
            display: "[Error]",
            context: {}
          }
        end

        render json: {
          success: true,
          results: results,
          count: results.length
        }
      rescue => e
        Rails.logger.error "Lookup search error: #{e.message}"
        render json: { error: e.message }, status: :internal_server_error
      end

      private

      def set_table
        @table = Table.includes(:columns).find(params[:table_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Table not found' }, status: :not_found
      end

      def set_column
        @column = @table.columns.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Column not found' }, status: :not_found
      end

      def column_params
        params.require(:column).permit(
          :name,
          :column_name,
          :column_type,
          :max_length,
          :min_length,
          :default_value,
          :description,
          :searchable,
          :is_title,
          :is_unique,
          :required,
          :min_value,
          :max_value,
          :validation_message,
          :lookup_table_id,
          :lookup_display_column,
          :is_multiple
        )
      end

      def require_schema_edit_permission
        unless current_user&.can_edit_table_schema?
          render json: {
            success: false,
            errors: ['Unauthorized. Column schema editing requires admin access.']
          }, status: :forbidden
        end
      end

      def check_table_protection
        # Check if this table's name is in the protected tables list
        table_name = @table.database_table_name
        if TableProtection.table_protected?(table_name)
          render json: {
            success: false,
            errors: ["This table is protected and columns cannot be modified."]
          }, status: :forbidden
        end
      end

      def column_json(column)
        {
          id: column.id,
          name: column.name,
          column_name: column.column_name,
          column_type: column.column_type,
          max_length: column.max_length,
          min_length: column.min_length,
          default_value: column.default_value,
          description: column.description,
          searchable: column.searchable,
          is_title: column.is_title,
          is_unique: column.is_unique,
          required: column.required,
          min_value: column.min_value,
          max_value: column.max_value,
          validation_message: column.validation_message,
          position: column.position,
          lookup_table_id: column.lookup_table_id,
          lookup_display_column: column.lookup_display_column,
          is_multiple: column.is_multiple,
          has_cross_table_refs: column.has_cross_table_refs,
          settings: column.settings
        }
      end
    end
  end
end
