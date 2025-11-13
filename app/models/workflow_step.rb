class WorkflowStep < ApplicationRecord
  belongs_to :workflow_instance
  belongs_to :assigned_to, polymorphic: true
end
