class DropUnusedTables < ActiveRecord::Migration[8.0]
  def up
    # Drop empty user import/test tables with no models or frontend UI
    drop_table :user_9_30_upload_4b12581f, if_exists: true
    drop_table :user_document_tab_3728eb5f, if_exists: true
    drop_table :user_document_tab_7a84cd47, if_exists: true
    drop_table :user_document_tab_dd6cfcbf, if_exists: true
    drop_table :user_import_1762055288_0481fe89c8986d83_77240a42, if_exists: true
    drop_table :user_import_1762056023_72d2ca00717e243d_deed2265, if_exists: true
    drop_table :user_import_1762056365_8affa6c58b11050f_ab07b46b, if_exists: true
    drop_table :user_import_1762056499_7562a44878bae0dd_dc223e1a, if_exists: true
    drop_table :user_import_1762059420_a11f2f8f92defc9a_d30f6065, if_exists: true
    drop_table :user_import_1762060168_19920751913157a9_6fcf00a3, if_exists: true
    drop_table :user_import_1762125311_b06c355ec069b654_2f8eb576, if_exists: true
    drop_table :user_import_1762125512_3346546a6ffb8b8b_2afd6efb, if_exists: true
    drop_table :user_import_1762125782_81846cbb9a44cbce_a99dc734, if_exists: true
    drop_table :user_import_1762126561_e200f5e7e0826b1e_new_558a778c, if_exists: true
    drop_table :user_jakes_new_test_0e0f1d21, if_exists: true
    drop_table :user_newimport_93f20d2d, if_exists: true
    drop_table :user_price_book_705651a0, if_exists: true
    drop_table :user_pricinggggg_c9716c90, if_exists: true
    drop_table :user_testing_table_9297d36e, if_exists: true
    drop_table :user_untitled_table_61d507e5, if_exists: true
    drop_table :sam_quick_est_items, if_exists: true
    drop_table :unreal_variables, if_exists: true
    drop_table :teaching_patterns, if_exists: true
    # Note: Skipping 'designs' table - has foreign key constraint from constructions table
  end

  def down
    # Intentionally left empty - these tables had no data and no models
    # If you need to restore them, check the schema.rb history
    raise ActiveRecord::IrreversibleMigration, "Cannot restore dropped test/import tables - they contained no data"
  end
end
