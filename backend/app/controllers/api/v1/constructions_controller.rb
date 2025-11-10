module Api
  module V1
    class ConstructionsController < ApplicationController
      before_action :set_construction, only: [ :show, :update, :destroy ]

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

        @constructions = @constructions.order(created_at: :desc)
                                       .limit(per_page)
                                       .offset((page - 1) * per_page)

        total_count = Construction.where(status: status_filter).count
        total_pages = (total_count.to_f / per_page).ceil

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

          render json: @construction.as_json.merge(
            folder_creation_enqueued: folder_creation_enqueued
          ), status: :created
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
          :site_supervisor_name,
          :site_supervisor_email,
          :site_supervisor_phone,
          :design_id,
          :design_name
        )
      end
    end
  end
end
