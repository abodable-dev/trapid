module Api
  module V1
    class CompanyComplianceItemsController < ApplicationController
      before_action :set_compliance_item, only: [:show, :update, :destroy, :mark_complete]

      def index
        @items = CompanyComplianceItem.all
        @items = @items.where(company_id: params[:company_id]) if params[:company_id].present?
        @items = @items.where(completed: params[:completed]) if params[:completed].present?
        @items = @items.overdue if params[:overdue] == 'true'

        @items = @items.includes(:company).order(due_date: :asc)

        render json: {
          compliance_items: @items.as_json(
            include: :company,
            methods: [:is_overdue, :days_until_due]
          )
        }
      end

      def show
        render json: {
          compliance_item: @item.as_json(
            include: :company,
            methods: [:is_overdue, :days_until_due]
          )
        }
      end

      def create
        @item = CompanyComplianceItem.new(compliance_item_params)

        if @item.save
          render json: { compliance_item: @item, message: 'Compliance item created successfully' }, status: :created
        else
          render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @item.update(compliance_item_params)
          render json: { compliance_item: @item, message: 'Compliance item updated successfully' }
        else
          render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @item.destroy
        render json: { message: 'Compliance item deleted successfully' }
      end

      def mark_complete
        @item.mark_complete!
        render json: {
          message: 'Compliance item marked as complete',
          compliance_item: @item.as_json(methods: [:is_overdue, :days_until_due])
        }
      end

      private

      def set_compliance_item
        @item = CompanyComplianceItem.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Compliance item not found' }, status: :not_found
      end

      def compliance_item_params
        params.require(:compliance_item).permit(
          :company_id, :title, :description, :item_type, :due_date,
          :completed, :reminder_days, :notes
        )
      end
    end
  end
end
