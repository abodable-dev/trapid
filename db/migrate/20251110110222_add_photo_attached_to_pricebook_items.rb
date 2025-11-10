class AddPhotoAttachedToPricebookItems < ActiveRecord::Migration[8.0]
  def change
    add_column :pricebook_items, :photo_attached, :boolean, default: false
    add_column :pricebook_items, :spec_attached, :boolean, default: false

    # Set photo_attached to true for all items that currently have an image_url
    reversible do |dir|
      dir.up do
        execute <<-SQL
          UPDATE pricebook_items
          SET photo_attached = true
          WHERE image_url IS NOT NULL AND image_url != '';
        SQL

        execute <<-SQL
          UPDATE pricebook_items
          SET spec_attached = true
          WHERE spec_url IS NOT NULL AND spec_url != '';
        SQL
      end
    end
  end
end
