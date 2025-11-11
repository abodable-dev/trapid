class WorkflowInstance < ApplicationRecord
  # Associations
  belongs_to :workflow_definition
  belongs_to :subject, polymorphic: true
  has_many :workflow_steps, dependent: :destroy

  # Validations
  validates :status, presence: true, inclusion: { in: WorkflowDefinition::STATUSES }

  # Scopes
  scope :pending, -> { where(status: 'pending') }
  scope :in_progress, -> { where(status: 'in_progress') }
  scope :completed, -> { where(status: 'completed') }
  scope :active, -> { where(status: ['pending', 'in_progress']) }

  # Callbacks
  after_create :initialize_first_step

  def current_step_record
    workflow_steps.find_by(step_name: current_step)
  end

  def all_steps_config
    workflow_definition.steps
  end

  def current_step_config
    workflow_definition.step_by_name(current_step)
  end

  def next_step_config
    steps = all_steps_config
    current_index = steps.index { |s| s['name'] == current_step }
    return nil if current_index.nil? || current_index >= steps.length - 1

    steps[current_index + 1]
  end

  def can_advance?
    current_step_record&.status == 'completed' && next_step_config.present?
  end

  def advance!
    return false unless can_advance?

    next_step = next_step_config
    update!(current_step: next_step['name'])
    create_step(next_step)
    true
  end

  def complete!
    return false unless current_step_record&.status == 'completed' && !next_step_config

    update!(status: 'completed', completed_at: Time.current)
    true
  end

  def reject!(reason: nil)
    update!(
      status: 'rejected',
      completed_at: Time.current,
      metadata: (metadata || {}).merge(rejection_reason: reason)
    )
  end

  def cancel!(reason: nil)
    update!(
      status: 'cancelled',
      completed_at: Time.current,
      metadata: (metadata || {}).merge(cancellation_reason: reason)
    )
  end

  private

  def initialize_first_step
    return if current_step.present?

    first_step = workflow_definition.steps.first
    return unless first_step

    update!(
      status: 'in_progress',
      current_step: first_step['name'],
      started_at: Time.current
    )
    create_step(first_step)
  end

  def create_step(step_config)
    workflow_steps.create!(
      step_name: step_config['name'],
      status: 'pending',
      data: step_config,
      started_at: Time.current
    )
  end
end
