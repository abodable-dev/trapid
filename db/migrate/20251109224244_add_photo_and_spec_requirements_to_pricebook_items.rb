class AddPhotoAndSpecRequirementsToPricebookItems < ActiveRecord::Migration[8.0]
  def change
    add_column :pricebook_items, :requires_photo, :boolean, default: false
    add_column :pricebook_items, :requires_spec, :boolean, default: false
  end
end
