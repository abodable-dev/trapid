module Api
  module V1
    class ImportsController < ApplicationController
      # POST /api/v1/imports/upload
      # Upload a file and get preview data with type detection
      def upload
        unless params[:file].present?
          return render json: { error: 'No file provided' }, status: :unprocessable_entity
        end

        file = params[:file]

        # Save uploaded file temporarily
        temp_file = save_temp_file(file)

        # Parse the spreadsheet
        parser = SpreadsheetParser.new(temp_file.to_s)
        result = parser.parse

        if result[:success]
          render json: {
            success: true,
            data: {
              headers: result[:headers],
              preview_rows: result[:preview_data],
              total_rows: result[:total_rows],
              detected_types: result[:detected_types],
              suggested_table_name: result[:suggested_table_name],
              temp_file_path: temp_file.to_s,
              original_filename: file.original_filename
            }
          }
        else
          render json: {
            success: false,
            errors: result[:errors]
          }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/imports/execute
      # Create table and import data
      def execute
        file_path = params[:temp_file_path]

        unless file_path && File.exist?(file_path)
          return render json: { error: 'No file found. Please upload again.' }, status: :unprocessable_entity
        end

        # Extract parameters
        table_name = params[:table_name]
        columns_data = params[:columns] || []

        # Create the table record
        table = Table.new(
          name: table_name,
          singular_name: params[:singular_name],
          plural_name: params[:plural_name],
          icon: params[:icon],
          title_column: params[:title_column],
          description: params[:description]
        )

        unless table.save
          return render json: { success: false, errors: table.errors.full_messages }, status: :unprocessable_entity
        end

        # Create column records
        columns_data.each_with_index do |col_data, index|
          column = table.columns.build(
            name: col_data[:name],
            column_name: col_data[:column_name] || col_data[:name].parameterize(separator: '_'),
            column_type: col_data[:column_type],
            searchable: col_data[:searchable] != false,
            is_title: col_data[:is_title] == true,
            is_unique: col_data[:is_unique] == true,
            required: col_data[:required] == true,
            position: index
          )

          unless column.save
            table.destroy
            return render json: { success: false, errors: column.errors.full_messages }, status: :unprocessable_entity
          end
        end

        # Create the actual database table
        builder = TableBuilder.new(table)
        build_result = builder.create_database_table

        unless build_result[:success]
          table.destroy
          return render json: { success: false, errors: build_result[:errors] }, status: :unprocessable_entity
        end

        # Import the data
        importer = DataImporter.new(table, file_path, params[:column_mapping] || {})
        import_result = importer.import

        # Clean up temp file
        File.delete(file_path) if File.exist?(file_path)

        render json: {
          success: true,
          table: {
            id: table.id,
            name: table.name,
            database_table_name: table.database_table_name
          },
          import_stats: {
            imported_count: import_result[:imported_count],
            failed_count: import_result[:failed_count],
            total_rows: import_result[:imported_count] + import_result[:failed_count],
            failed_rows: import_result[:failed_rows]
          }
        }
      rescue => e
        table&.destroy
        render json: { success: false, error: e.message }, status: :internal_server_error
      end

      private

      def save_temp_file(uploaded_file)
        # Create temp directory if it doesn't exist
        temp_dir = Rails.root.join('tmp', 'uploads')
        FileUtils.mkdir_p(temp_dir)

        # Generate unique filename
        filename = "#{SecureRandom.hex(8)}#{File.extname(uploaded_file.original_filename)}"
        temp_path = temp_dir.join(filename)

        # Save file
        File.open(temp_path, 'wb') do |file|
          file.write(uploaded_file.read)
        end

        temp_path
      end
    end
  end
end
