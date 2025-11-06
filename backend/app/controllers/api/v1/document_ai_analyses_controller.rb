module Api
  module V1
    class DocumentAiAnalysesController < ApplicationController
      before_action :set_construction
      before_action :set_analysis, only: [:show]

      # GET /api/v1/constructions/:construction_id/document_analyses
      def index
        @analyses = @construction.document_ai_analyses.includes(:job_document).recent

        # Filter by status
        @analyses = @analyses.public_send(params[:status]) if params[:status].in?(%w[pending processing completed failed])

        # Filter by analysis type
        @analyses = @analyses.by_type(params[:analysis_type]) if params[:analysis_type].present?

        # Filter by document
        @analyses = @analyses.where(job_document_id: params[:document_id]) if params[:document_id].present?

        render json: {
          success: true,
          analyses: @analyses.as_json(
            include: {
              job_document: { only: [:id, :title, :file_name] }
            },
            methods: [:has_discrepancies?, :discrepancy_count, :processing_duration]
          ),
          total: @analyses.count,
          summary: {
            pending: @construction.document_ai_analyses.pending.count,
            processing: @construction.document_ai_analyses.processing.count,
            completed: @construction.document_ai_analyses.completed.count,
            failed: @construction.document_ai_analyses.failed.count,
            with_discrepancies: @construction.document_ai_analyses.with_discrepancies.count
          }
        }
      end

      # GET /api/v1/constructions/:construction_id/document_analyses/:id
      def show
        render json: {
          success: true,
          analysis: @analysis.as_json(
            include: {
              job_document: {
                only: [:id, :title, :file_name, :document_category_id],
                include: {
                  document_category: { only: [:id, :name] }
                }
              }
            },
            methods: [:has_discrepancies?, :discrepancy_count, :processing_duration]
          )
        }
      end

      private

      def set_construction
        @construction = Construction.find(params[:construction_id])
      rescue ActiveRecord::RecordNotFound
        render json: {
          success: false,
          error: "Construction job not found"
        }, status: :not_found
      end

      def set_analysis
        @analysis = @construction.document_ai_analyses.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: {
          success: false,
          error: "Analysis not found"
        }, status: :not_found
      end
    end
  end
end
