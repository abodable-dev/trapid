class WorkflowExecutionService
  class << self
    # Start a workflow for a given subject (e.g., PurchaseOrder, Job, etc.)
    # Options:
    #   - client_name: Name of client/recipient
    #   - client_address: Address of client/recipient
    #   - client_email: Email of client/recipient
    #   - client_phone: Phone of client/recipient
    #   - attachments: Array of attachment hashes [{url:, filename:, content_type:}]
    def start_workflow(workflow_type:, subject:, initiated_by: nil, client_name: nil, client_address: nil,
                       client_email: nil, client_phone: nil, attachments: [])
      workflow_definition = WorkflowDefinition.active.find_by(workflow_type: workflow_type)

      raise "No active workflow found for type: #{workflow_type}" unless workflow_definition

      # Build metadata with client info
      metadata = {
        initiated_by_id: initiated_by&.id,
        initiated_at: Time.current
      }

      metadata[:client_name] = client_name if client_name.present?
      metadata[:client_address] = client_address if client_address.present?
      metadata[:client_email] = client_email if client_email.present?
      metadata[:client_phone] = client_phone if client_phone.present?
      metadata[:attachments] = attachments if attachments.present?

      # Create workflow instance
      instance = WorkflowInstance.create!(
        workflow_definition: workflow_definition,
        subject: subject,
        status: 'pending',
        started_at: Time.current,
        metadata: metadata
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
