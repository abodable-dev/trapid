module Api
  module V1
    class ScheduleTemplateRowsController < ApplicationController
      before_action :authorize_request
      before_action :set_template
      before_action :set_row, only: [:update, :destroy]
      before_action :check_can_edit_templates

      # POST /api/v1/schedule_templates/:template_id/rows
      def create
        row = @template.schedule_template_rows.build(row_params)

        # Auto-assign sequence order if not provided
        if row.sequence_order.nil?
          max_order = @template.schedule_template_rows.maximum(:sequence_order) || 0
          row.sequence_order = max_order + 1
        end

        if row.save
          render json: row_json(row), status: :created
        else
          render json: { errors: row.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/schedule_templates/:template_id/rows/:id
      def update
        if @row.update(row_params)
          render json: row_json(@row)
        else
          render json: { errors: @row.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/schedule_templates/:template_id/rows/:id
      def destroy
        @row.destroy
        head :no_content
      end

      # POST /api/v1/schedule_templates/:template_id/rows/bulk_update
      def bulk_update
        updates = params[:updates] || []
        errors = []

        ActiveRecord::Base.transaction do
          updates.each do |update_data|
            row = @template.schedule_template_rows.find(update_data[:id])
            unless row.update(row_params_from_hash(update_data))
              errors << { id: row.id, errors: row.errors.full_messages }
            end
          end

          raise ActiveRecord::Rollback if errors.any?
        end

        if errors.empty?
          render json: { success: true }
        else
          render json: { errors: errors }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/schedule_templates/:template_id/rows/reorder
      def reorder
        row_ids = params[:row_ids] || []

        ActiveRecord::Base.transaction do
          row_ids.each_with_index do |row_id, index|
            row = @template.schedule_template_rows.find(row_id)
            row.update!(sequence_order: index)
          end
        end

        render json: { success: true }
      rescue StandardError => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      private

      def set_template
        @template = ScheduleTemplate.find(params[:schedule_template_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Template not found' }, status: :not_found
      end

      def set_row
        @row = @template.schedule_template_rows.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Row not found' }, status: :not_found
      end

      def check_can_edit_templates
        unless @current_user.can_create_templates?
          render json: { error: 'Unauthorized' }, status: :forbidden
        end
      end

      def row_params
        params.require(:schedule_template_row).permit(
          :name,
          :supplier_id,
          :assigned_user_id,
          :po_required,
          :create_po_on_job_start,
          :critical_po,
          :require_photo,
          :require_certificate,
          :cert_lag_days,
          :require_supervisor_check,
          :auto_complete_predecessors,
          :has_subtasks,
          :subtask_count,
          :sequence_order,
          :linked_template_id,
          :manual_task,
          :allow_multiple_instances,
          :order_required,
          :call_up_required,
          :plan_required,
          :duration,
          predecessor_ids: [:id, :type, :lag],
          price_book_item_ids: [],
          documentation_category_ids: [],
          supervisor_checklist_template_ids: [],
          tags: [],
          subtask_names: [],
          linked_task_ids: [],
          auto_complete_task_ids: [],
          subtask_template_ids: []
        )
      end

      def row_params_from_hash(hash)
        ActionController::Parameters.new(hash).permit(
          :name,
          :supplier_id,
          :assigned_user_id,
          :po_required,
          :create_po_on_job_start,
          :critical_po,
          :require_photo,
          :require_certificate,
          :cert_lag_days,
          :require_supervisor_check,
          :auto_complete_predecessors,
          :has_subtasks,
          :subtask_count,
          :sequence_order,
          :linked_template_id,
          :manual_task,
          :allow_multiple_instances,
          :order_required,
          :call_up_required,
          :plan_required,
          :duration,
          predecessor_ids: [:id, :type, :lag],
          price_book_item_ids: [],
          documentation_category_ids: [],
          supervisor_checklist_template_ids: [],
          tags: [],
          subtask_names: [],
          linked_task_ids: [],
          auto_complete_task_ids: [],
          subtask_template_ids: []
        )
      end

      def row_json(row)
        {
          id: row.id,
          name: row.name,
          supplier_id: row.supplier_id,
          supplier_name: row.supplier&.name,
          assigned_user_id: row.assigned_user_id,
          predecessor_ids: row.predecessor_ids,
          predecessor_display: row.predecessor_display,
          po_required: row.po_required,
          create_po_on_job_start: row.create_po_on_job_start,
          price_book_item_ids: row.price_book_item_ids,
          documentation_category_ids: row.documentation_category_ids,
          supervisor_checklist_template_ids: row.supervisor_checklist_template_ids,
          critical_po: row.critical_po,
          tags: row.tags,
          require_photo: row.require_photo,
          require_certificate: row.require_certificate,
          cert_lag_days: row.cert_lag_days,
          require_supervisor_check: row.require_supervisor_check,
          auto_complete_predecessors: row.auto_complete_predecessors,
          auto_complete_task_ids: row.auto_complete_task_ids,
          has_subtasks: row.has_subtasks,
          subtask_count: row.subtask_count,
          subtask_names: row.subtask_names,
          subtask_template_ids: row.subtask_template_ids,
          sequence_order: row.sequence_order,
          linked_task_ids: row.linked_task_ids,
          linked_tasks_display: row.linked_tasks_display,
          linked_template_id: row.linked_template_id,
          linked_template_name: row.linked_template_name,
          manual_task: row.manual_task,
          allow_multiple_instances: row.allow_multiple_instances,
          order_required: row.order_required,
          call_up_required: row.call_up_required,
          plan_required: row.plan_required,
          duration: row.duration
        }
      end
    end
  end
end
