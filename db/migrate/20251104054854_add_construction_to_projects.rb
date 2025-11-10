class AddConstructionToProjects < ActiveRecord::Migration[8.0]
  def change
    # First add the column as nullable
    add_reference :projects, :construction, null: true, foreign_key: true

    # Delete any test projects without constructions (from testing)
    reversible do |dir|
      dir.up do
        # First delete related tasks, then templates, then projects
        execute "DELETE FROM task_dependencies WHERE successor_task_id IN (SELECT id FROM project_tasks WHERE project_id IN (SELECT id FROM projects WHERE construction_id IS NULL))"
        execute "DELETE FROM task_dependencies WHERE predecessor_task_id IN (SELECT id FROM project_tasks WHERE project_id IN (SELECT id FROM projects WHERE construction_id IS NULL))"
        execute "DELETE FROM project_tasks WHERE project_id IN (SELECT id FROM projects WHERE construction_id IS NULL)"
        execute "DELETE FROM task_templates WHERE id NOT IN (SELECT task_template_id FROM project_tasks WHERE task_template_id IS NOT NULL)"
        execute "DELETE FROM projects WHERE construction_id IS NULL"
      end
    end

    # Now make it required
    change_column_null :projects, :construction_id, false
  end
end
