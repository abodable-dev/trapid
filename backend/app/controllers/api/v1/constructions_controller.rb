module Api
  module V1
    class ConstructionsController < ApplicationController
      before_action :set_construction, only: [:show, :update, :destroy, :saved_messages, :emails, :documentation_tabs]

      # GET /api/v1/constructions
      # GET /api/v1/constructions?status=Active
      def index
        @constructions = Construction.all

        # Filter by status if provided (default to Active jobs)
        status_filter = params[:status] || "Active"
        @constructions = @constructions.where(status: status_filter) if status_filter.present?

        # Pagination
        page = params[:page]&.to_i || 1
        per_page = params[:per_page]&.to_i || 50

        # Get total count before limiting results to avoid separate COUNT query
        total_count = @constructions.count
        total_pages = (total_count.to_f / per_page).ceil

        @constructions = @constructions.order(created_at: :desc)
                                       .limit(per_page)
                                       .offset((page - 1) * per_page)

        render json: {
          constructions: @constructions,
          pagination: {
            current_page: page,
            total_pages: total_pages,
            total_count: total_count,
            per_page: per_page
          }
        }
      end

      # GET /api/v1/constructions/:id
      def show
        render json: @construction
      end

      # POST /api/v1/constructions
      def create
        @construction = Construction.new(construction_params)

        if @construction.save
          # Enqueue OneDrive folder creation if requested
          folder_creation_enqueued = false
          if params[:create_onedrive_folders] == true || params[:create_onedrive_folders] == "true"
            @construction.create_folders_if_needed!(params[:template_id])
            folder_creation_enqueued = true
          end

          # Instantiate schedule template if provided
          template_instantiation_result = nil
          if params[:template_id].present?
            template_instantiation_result = instantiate_schedule_template(params[:template_id])
          end

          response_data = @construction.as_json.merge(
            folder_creation_enqueued: folder_creation_enqueued
          )

          # Add template instantiation info if applicable
          if template_instantiation_result
            response_data[:template_instantiation] = template_instantiation_result
          end

          render json: response_data, status: :created
        else
          render json: { errors: @construction.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT/PATCH /api/v1/constructions/:id
      def update
        if @construction.update(construction_params)
          render json: @construction
        else
          render json: { errors: @construction.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/constructions/:id
      def destroy
        @construction.destroy
        head :no_content
      end

      # GET /api/v1/constructions/:id/saved_messages
      def saved_messages
        @messages = @construction.chat_messages
                                  .where(saved_to_job: true)
                                  .includes(:user)
                                  .order(created_at: :desc)

        render json: @messages.as_json(
          include: { user: { only: [:id, :name, :email] } },
          methods: :formatted_timestamp
        )
      end

      # GET /api/v1/constructions/:id/emails
      def emails
        @emails = @construction.emails
                              .includes(:user)
                              .order(received_at: :desc)

        render json: @emails
      end

      # GET /api/v1/constructions/:id/documentation_tabs
      def documentation_tabs
        @tabs = @construction.construction_documentation_tabs
                            .active
                            .ordered

        render json: @tabs
      end

      private

      def set_construction
        @construction = Construction.find(params[:id])
      end

      def construction_params
        params.require(:construction).permit(
          :title,
          :contract_value,
          # live_profit and profit_percentage are calculated fields, not user-editable
          :stage,
          :status,
          :ted_number,
          :certifier_job_no,
          :start_date,
          :location,
          :latitude,
          :longitude,
          :site_supervisor_name,
          :site_supervisor_email,
          :site_supervisor_phone,
          :design_id,
          :design_name
        )
      end

      def instantiate_schedule_template(template_id)
        # Find the template
        template = ScheduleTemplate.find_by(id: template_id)
        unless template
          Rails.logger.warn("Template #{template_id} not found for construction #{@construction.id}")
          return { success: false, error: "Template not found" }
        end

        # Get or create the project for this construction
        # The project is needed for the template instantiation service
        project = @construction.project
        unless project
          # Create a project using the construction's helper method
          project = @construction.create_project!(
            project_manager: current_user,
            name: "#{@construction.title} - Master Schedule"
          )
        end

        # Instantiate the template using the service
        result = Schedule::TemplateInstantiator.new(
          project: project,
          template: template
        ).call

        if result[:success]
          Rails.logger.info("Successfully instantiated template #{template.name} for construction #{@construction.id}")
          {
            success: true,
            template_name: template.name,
            tasks_created: result[:tasks].count,
            project_id: project.id
          }
        else
          Rails.logger.error("Failed to instantiate template: #{result[:errors].join(', ')}")
          {
            success: false,
            errors: result[:errors]
          }
        end
      rescue StandardError => e
        Rails.logger.error("Exception instantiating template: #{e.message}")
        Rails.logger.error(e.backtrace.join("\n"))
        {
          success: false,
          error: e.message
        }
      end
    end
  end
end
