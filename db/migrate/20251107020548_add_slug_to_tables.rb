class AddSlugToTables < ActiveRecord::Migration[8.0]
  def change
    add_column :tables, :slug, :string

    # Generate slugs for existing tables
    reversible do |dir|
      dir.up do
        Table.reset_column_information
        Table.find_each do |table|
          base_slug = table.name.parameterize
          slug_candidate = base_slug
          counter = 1

          # Ensure uniqueness
          while Table.where(slug: slug_candidate).where.not(id: table.id).exists?
            slug_candidate = "#{base_slug}-#{counter}"
            counter += 1
          end

          table.update_column(:slug, slug_candidate)
        end
      end
    end

    add_index :tables, :slug, unique: true
  end
end
