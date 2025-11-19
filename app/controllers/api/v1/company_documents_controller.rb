module Api
  module V1
    class CompanyDocumentsController < ApplicationController
      before_action :set_document, only: [:show, :destroy]

      def index
        @documents = CompanyDocument.all
        @documents = @documents.where(company_id: params[:company_id]) if params[:company_id].present?

        @documents = @documents.includes(:company).order(uploaded_at: :desc)

        render json: { documents: @documents.as_json(include: :company) }
      end

      def show
        render json: { document: @document.as_json(include: :company) }
      end

      def create
        @document = CompanyDocument.new(document_params)

        if params[:company_document][:file].present?
          @document.file.attach(params[:company_document][:file])
        end

        if @document.save
          render json: { document: @document, message: 'Document uploaded successfully' }, status: :created
        else
          render json: { errors: @document.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @document.file.purge if @document.file.attached?
        @document.destroy
        render json: { message: 'Document deleted successfully' }
      end

      private

      def set_document
        @document = CompanyDocument.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Document not found' }, status: :not_found
      end

      def document_params
        params.require(:company_document).permit(
          :company_id, :title, :document_type, :document_date, :description
        )
      end
    end
  end
end
