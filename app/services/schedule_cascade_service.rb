# frozen_string_literal: true

# Service to cascade schedule changes to dependent tasks
# When a task's start_date or duration changes, this service:
# 1. Finds all dependent tasks (tasks that have this task as a predecessor)
# 2. Recalculates their start dates based on dependency type and lag
# 3. Recursively cascades to their dependents
# 4. Returns all affected tasks
class ScheduleCascadeService
  # Recalculates dependent task dates when a task changes
  # @param task [ScheduleTemplateRow] The task that was updated
  # @param changed_attributes [Array<Symbol>] List of attributes that changed (e.g., [:start_date, :duration])
  # @return [Array<ScheduleTemplateRow>] List of all tasks affected by the cascade (including the original task)
  def self.cascade_changes(task, changed_attributes = [])
    new(task, changed_attributes).cascade
  end

  def initialize(task, changed_attributes = [])
    @task = task
    @changed_attributes = changed_attributes
    @affected_tasks = {}  # task_id => task (to avoid duplicates)
    @template = task.schedule_template
  end

  def cascade
    # Only cascade if start_date or duration changed
    return [@task] unless cascade_needed?

    Rails.logger.info "🔄 CASCADE: Task #{@task.id} changed (#{@changed_attributes.join(', ')})"

    # Add the original task to affected list
    @affected_tasks[@task.id] = @task

    # Recursively cascade to dependents
    cascade_to_dependents(@task)

    # Return all affected tasks
    affected_list = @affected_tasks.values
    Rails.logger.info "✅ CASCADE COMPLETE: #{affected_list.length} tasks affected"
    affected_list
  end

  private

  def cascade_needed?
    # Cascade if start_date or duration changed
    # We don't check manually_positioned here - we always cascade FROM any task
    # We skip cascading TO manually positioned tasks in cascade_to_dependents
    @changed_attributes.include?(:start_date) || @changed_attributes.include?(:duration)
  end

  def cascade_to_dependents(predecessor_task)
    # Find all tasks that depend on this task
    dependent_tasks = find_dependent_tasks(predecessor_task)

    Rails.logger.info "  📋 Found #{dependent_tasks.length} dependents of task #{predecessor_task.id} (sequence #{predecessor_task.sequence_order})"

    dependent_tasks.each do |dependent_task|
      # Skip if already processed (avoid infinite loops)
      next if @affected_tasks.key?(dependent_task.id)

      # Skip if manually positioned (user explicitly set the date)
      next if dependent_task.manually_positioned?

      # Calculate new start date based on predecessor
      new_start_date = calculate_start_date(dependent_task, predecessor_task)

      # Only update if date actually changed
      if new_start_date && dependent_task.start_date != new_start_date
        old_date = dependent_task.start_date
        dependent_task.update_column(:start_date, new_start_date)
        dependent_task.reload

        Rails.logger.info "  ✏️  Task #{dependent_task.id}: #{old_date} → #{new_start_date}"

        # Add to affected list
        @affected_tasks[dependent_task.id] = dependent_task

        # Recursively cascade to this task's dependents
        cascade_to_dependents(dependent_task)
      end
    end
  end

  def find_dependent_tasks(predecessor_task)
    # Find all tasks in the template where predecessor_ids contains this task
    # NOTE: predecessor_ids are 1-based (1, 2, 3...) while sequence_order is 0-based (0, 1, 2...)
    predecessor_id = predecessor_task.sequence_order + 1  # Convert 0-based to 1-based

    @template.schedule_template_rows.select do |row|
      next false if row.predecessor_ids.blank?

      row.predecessor_ids.any? { |pred| (pred['id'] || pred[:id]).to_i == predecessor_id }
    end
  end

  def calculate_start_date(dependent_task, predecessor_task)
    # Find the predecessor entry in dependent_task's predecessor_ids
    # NOTE: predecessor_ids are 1-based (1, 2, 3...) while sequence_order is 0-based (0, 1, 2...)
    predecessor_id = predecessor_task.sequence_order + 1  # Convert 0-based to 1-based
    pred_entry = dependent_task.predecessor_ids.find do |pred|
      (pred['id'] || pred[:id]).to_i == predecessor_id
    end

    return nil unless pred_entry

    # Extract dependency type and lag
    dep_type = pred_entry['type'] || pred_entry[:type] || 'FS'
    lag = (pred_entry['lag'] || pred_entry[:lag] || 0).to_i

    # Calculate based on dependency type
    predecessor_start = predecessor_task.start_date
    predecessor_end = predecessor_start + (predecessor_task.duration || 1)

    case dep_type
    when 'FS' # Finish-to-Start (most common)
      predecessor_end + lag
    when 'SS' # Start-to-Start
      predecessor_start + lag
    when 'FF' # Finish-to-Finish
      dependent_end = predecessor_end + lag
      dependent_end - (dependent_task.duration || 1)
    when 'SF' # Start-to-Finish (rare)
      dependent_end = predecessor_start + lag
      dependent_end - (dependent_task.duration || 1)
    else
      # Default to FS if unknown type
      predecessor_end + lag
    end
  end
end
