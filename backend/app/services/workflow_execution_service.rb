class WorkflowExecutionService
  class << self
    # Start a workflow for a given subject (e.g., PurchaseOrder, Job, etc.)
    def start_workflow(workflow_type:, subject:, initiated_by: nil)
      workflow_definition = WorkflowDefinition.active.find_by(workflow_type: workflow_type)

      raise "No active workflow found for type: #{workflow_type}" unless workflow_definition

      # Create workflow instance
      instance = WorkflowInstance.create!(
        workflow_definition: workflow_definition,
        subject: subject,
        status: 'pending',
        started_at: Time.current,
        metadata: {
          initiated_by_id: initiated_by&.id,
          initiated_at: Time.current
        }
      )

      # Workflow instance after_create callback will initialize first step
      instance
    end

    # Get all pending workflows for a user
    def pending_for_user(user)
      WorkflowStep.includes(:workflow_instance)
                   .where(status: ['pending', 'in_progress'])
                   .select { |step| step.can_action?(user) }
    end

    # Get workflow status for a subject
    def workflow_for_subject(subject)
      WorkflowInstance.find_by(
        subject: subject,
        status: ['pending', 'in_progress']
      )
    end

    # Check if subject has active workflow
    def has_active_workflow?(subject)
      WorkflowInstance.active.exists?(subject: subject)
    end
  end
end
