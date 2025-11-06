module Api
  module V1
    class JobDocumentsController < ApplicationController
      before_action :set_construction
      before_action :set_document, only: [:show, :update, :destroy, :approve, :archive, :create_version, :download, :analyze]

      # GET /api/v1/constructions/:construction_id/documents
      def index
        @documents = @construction.job_documents.includes(:document_category, :uploaded_by, :approved_by).active

        # Filter by category
        @documents = @documents.by_category(params[:category_id]) if params[:category_id].present?

        # Filter by status
        case params[:status]
        when 'pending_approval'
          @documents = @documents.pending_approval
        when 'approved'
          @documents = @documents.approved
        when 'archived'
          @documents = @documents.archived
        end

        # Only latest versions by default
        @documents = @documents.latest_versions unless params[:include_old_versions] == 'true'

        # Order by most recent
        @documents = @documents.recent

        render json: {
          success: true,
          documents: @documents.as_json(
            include: {
              document_category: { only: [:id, :name, :icon] },
              uploaded_by: { only: [:id, :email, :first_name, :last_name] },
              approved_by: { only: [:id, :email, :first_name, :last_name] }
            },
            methods: [:file_extension, :file_size_mb]
          ),
          total: @documents.count
        }
      end

      # GET /api/v1/constructions/:construction_id/documents/pending_approval
      def pending_approval
        @documents = @construction.job_documents.pending_approval.recent

        render json: {
          success: true,
          documents: @documents.as_json(
            include: {
              document_category: { only: [:id, :name] },
              uploaded_by: { only: [:id, :email, :first_name, :last_name] }
            }
          ),
          count: @documents.count
        }
      end

      # GET /api/v1/constructions/:construction_id/documents/:id
      def show
        render json: {
          success: true,
          document: @document.as_json(
            include: {
              document_category: { only: [:id, :name, :icon] },
              uploaded_by: { only: [:id, :email, :first_name, :last_name] },
              approved_by: { only: [:id, :email, :first_name, :last_name] },
              previous_version: { only: [:id, :title, :version, :created_at] },
              newer_versions: { only: [:id, :title, :version, :created_at] },
              document_activities: {
                include: { user: { only: [:id, :email, :first_name, :last_name] } },
                methods: [:action_label, :formatted_timestamp]
              }
            },
            methods: [:file_extension, :file_size_mb]
          )
        }
      end

      # POST /api/v1/constructions/:construction_id/documents
      def create
        @document = @construction.job_documents.new(document_params)
        @document.uploaded_by = current_user if defined?(current_user)

        if @document.save
          # TODO: Upload file to OneDrive if configured
          # upload_to_onedrive(@document) if @construction.onedrive_folder_id.present?

          render json: {
            success: true,
            document: @document
          }, status: :created
        else
          render json: {
            success: false,
            errors: @document.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/constructions/:construction_id/documents/:id
      def update
        if @document.update(document_params)
          render json: {
            success: true,
            document: @document
          }
        else
          render json: {
            success: false,
            errors: @document.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/constructions/:construction_id/documents/:id
      def destroy
        @document.update(status: 'deleted')

        render json: { success: true }
      end

      # POST /api/v1/constructions/:construction_id/documents/:id/approve
      def approve
        if @document.approve!(current_user)
          render json: {
            success: true,
            document: @document
          }
        else
          render json: {
            success: false,
            errors: @document.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/constructions/:construction_id/documents/:id/archive
      def archive
        if @document.archive!
          render json: {
            success: true,
            document: @document
          }
        else
          render json: {
            success: false,
            errors: @document.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/constructions/:construction_id/documents/:id/create_version
      def create_version
        new_version = @document.create_new_version(version_params)

        if new_version
          render json: {
            success: true,
            document: new_version
          }, status: :created
        else
          render json: {
            success: false,
            error: "Failed to create new version"
          }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/constructions/:construction_id/documents/:id/download
      def download
        # TODO: Implement OneDrive download
        # For now, return the file path
        render json: {
          success: true,
          download_url: @document.onedrive_web_url || @document.file_path
        }
      end

      # POST /api/v1/constructions/:construction_id/documents/:id/analyze
      def analyze
        analysis_type = params[:analysis_type] || 'plan_review'

        @analysis = @document.document_ai_analyses.create!(
          construction: @construction,
          analysis_type: analysis_type,
          status: 'pending'
        )

        # TODO: Queue background job for AI analysis
        # DocumentAiAnalysisJob.perform_later(@analysis.id)

        render json: {
          success: true,
          analysis: @analysis,
          message: "AI analysis queued"
        }, status: :created
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

      def set_document
        @document = @construction.job_documents.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: {
          success: false,
          error: "Document not found"
        }, status: :not_found
      end

      def document_params
        params.require(:document).permit(
          :title,
          :description,
          :document_category_id,
          :file_name,
          :file_path,
          :file_type,
          :file_size,
          :onedrive_file_id,
          :onedrive_web_url,
          :requires_approval,
          :status,
          tags: [],
          metadata: {}
        )
      end

      def version_params
        params.require(:document).permit(
          :title,
          :description,
          :file_name,
          :file_path,
          :file_type,
          :file_size,
          :onedrive_file_id,
          :onedrive_web_url
        )
      end
    end
  end
end
