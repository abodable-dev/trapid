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

        # Read file content into memory
        file_content = file.read

        # Write to a temp file for parsing
        temp_file = Tempfile.new(['import', File.extname(file.original_filename)])
        temp_file.binmode
        temp_file.write(file_content)
        temp_file.rewind

        # Parse the spreadsheet
        parser = SpreadsheetParser.new(temp_file.path)
        result = parser.parse

        # Close and delete the temp file
        temp_file.close
        temp_file.unlink

        if result[:success]
          # Encode file content as base64 to send back to frontend
          encoded_content = Base64.strict_encode64(file_content)

          render json: {
            success: true,
            data: {
              headers: result[:headers],
              preview_rows: result[:preview_data],
              total_rows: result[:total_rows],
              detected_types: result[:detected_types],
              suggested_table_name: result[:suggested_table_name],
              file_content: encoded_content,
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
        file_content = params[:file_content]
        original_filename = params[:original_filename]

        unless file_content.present?
          return render json: {
            success: false,
            error: 'File content not provided. Please upload the file again.',
          }, status: :unprocessable_entity
        end

        # Decode base64 file content
        begin
          decoded_content = Base64.strict_decode64(file_content)
        rescue ArgumentError => e
          return render json: {
            success: false,
            error: 'Invalid file content encoding.'
          }, status: :unprocessable_entity
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

        # Create a temp file for the importer to use
        temp_file = Tempfile.new(['import', File.extname(original_filename || '.csv')])
        temp_file.binmode
        temp_file.write(decoded_content)
        temp_file.rewind

        begin
          # Import the data
          importer = DataImporter.new(table, temp_file.path, params[:column_mapping] || {})
          import_result = importer.import

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
        ensure
          # Always clean up temp file
          temp_file.close
          temp_file.unlink
        end
      rescue => e
        table&.destroy
        render json: { success: false, error: e.message }, status: :internal_server_error
      end

    end
  end
end
