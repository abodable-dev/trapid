class WorkflowInstance < ApplicationRecord
  belongs_to :workflow_definition
  belongs_to :subject, polymorphic: true
end
