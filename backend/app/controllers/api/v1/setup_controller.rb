module Api
  module V1
    class SetupController < ApplicationController
      before_action :authorize_request
      before_action :check_admin_access

      # POST /api/v1/setup/pull_from_local
      def pull_from_local
        # This endpoint triggers the rake task to deploy setup data from CSV files
        # It deletes all existing setup data and imports fresh from local CSV exports

        require 'rake'
        Rails.application.load_tasks

        begin
          # Run the deploy task
          Rake::Task['setup:deploy_setup_data'].invoke

          render json: {
            success: true,
            message: 'Setup data successfully pulled from local and deployed',
            counts: {
              users: User.count,
              documentation_categories: DocumentationCategory.count,
              supervisor_checklist_templates: SupervisorChecklistTemplate.count,
              schedule_templates: ScheduleTemplate.count,
              schedule_template_rows: ScheduleTemplateRow.count
            }
          }
        rescue StandardError => e
          Rails.logger.error("Failed to pull setup data from local: #{e.message}")
          Rails.logger.error(e.backtrace.join("\n"))

          render json: {
            success: false,
            error: e.message
          }, status: :unprocessable_entity
        end
      end

      private

      def check_admin_access
        # Only admins or users who can create templates should be able to pull setup data
        unless @current_user.can_create_templates?
          render json: { error: 'Unauthorized - Admin access required' }, status: :forbidden
        end
      end
    end
  end
end
