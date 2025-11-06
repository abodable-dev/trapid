module Api
  module V1
    class DocumentCategoriesController < ApplicationController
      before_action :set_document_category, only: [:show, :update, :destroy]

      # GET /api/v1/document_categories
      def index
        @categories = DocumentCategory.active.ordered

        render json: {
          success: true,
          categories: @categories
        }
      end

      # GET /api/v1/document_categories/:id
      def show
        render json: {
          success: true,
          category: @category
        }
      end

      # POST /api/v1/document_categories
      def create
        @category = DocumentCategory.new(category_params)

        if @category.save
          render json: {
            success: true,
            category: @category
          }, status: :created
        else
          render json: {
            success: false,
            errors: @category.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/document_categories/:id
      def update
        if @category.update(category_params)
          render json: {
            success: true,
            category: @category
          }
        else
          render json: {
            success: false,
            errors: @category.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/document_categories/:id
      def destroy
        if @category.job_documents.any?
          render json: {
            success: false,
            error: "Cannot delete category with existing documents"
          }, status: :unprocessable_entity
        else
          @category.update(is_active: false)
          render json: { success: true }
        end
      end

      # POST /api/v1/document_categories/seed_defaults
      def seed_defaults
        DocumentCategory.seed_defaults

        render json: {
          success: true,
          message: "Default categories seeded successfully",
          categories: DocumentCategory.active.ordered
        }
      end

      private

      def set_document_category
        @category = DocumentCategory.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: {
          success: false,
          error: "Document category not found"
        }, status: :not_found
      end

      def category_params
        params.require(:document_category).permit(
          :name,
          :description,
          :display_order,
          :icon,
          :is_active
        )
      end
    end
  end
end
