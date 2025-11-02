class ImportJob < ApplicationJob
  queue_as :default

  def perform(import_session_id, table_id, column_mapping = {})
    import_session = ImportSession.find(import_session_id)
    table = Table.find(table_id)

    # Update progress: starting
    import_session.update(
      status: 'processing',
      progress: 0,
      total_rows: 0,
      processed_rows: 0
    )

    begin
      # Import the data using the saved file
      importer = DataImporter.new(table, import_session.file_path, column_mapping)

      # Pass the import session to track progress
      import_result = importer.import do |current, total|
        import_session.update(
          progress: ((current.to_f / total) * 100).round(2),
          total_rows: total,
          processed_rows: current
        )
      end

      # Update final status
      import_session.update(
        status: 'completed',
        progress: 100,
        total_rows: import_result[:imported_count] + import_result[:failed_count],
        processed_rows: import_result[:imported_count],
        completed_at: Time.current,
        result: {
          imported_count: import_result[:imported_count],
          failed_count: import_result[:failed_count],
          failed_rows: import_result[:failed_rows]
        }
      )

      # Clean up the file after successful import
      import_session.cleanup_file!

    rescue => e
      Rails.logger.error "Import job error: #{e.class} - #{e.message}"
      Rails.logger.error e.backtrace.join("\n")

      import_session.update(
        status: 'failed',
        error_message: e.message,
        completed_at: Time.current
      )

      # Clean up on error
      table&.destroy
      import_session&.cleanup_file!

      raise e
    end
  end
end
