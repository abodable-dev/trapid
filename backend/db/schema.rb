# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_11_05_051002) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "columns", force: :cascade do |t|
    t.bigint "table_id", null: false
    t.string "name", null: false
    t.string "column_name", null: false
    t.string "column_type", null: false
    t.integer "max_length"
    t.integer "min_length"
    t.string "default_value"
    t.text "description"
    t.boolean "searchable", default: true
    t.boolean "is_title", default: false
    t.boolean "is_unique", default: false
    t.boolean "required", default: false
    t.decimal "min_value"
    t.decimal "max_value"
    t.text "validation_message"
    t.integer "position"
    t.integer "lookup_table_id"
    t.string "lookup_display_column"
    t.boolean "is_multiple", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["lookup_table_id"], name: "index_columns_on_lookup_table_id"
    t.index ["table_id", "column_name"], name: "index_columns_on_table_id_and_column_name", unique: true
    t.index ["table_id"], name: "index_columns_on_table_id"
  end

  create_table "company_settings", force: :cascade do |t|
    t.string "company_name"
    t.string "abn"
    t.string "gst_number"
    t.string "email"
    t.string "phone"
    t.text "address"
    t.string "logo_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "constructions", force: :cascade do |t|
    t.string "title"
    t.decimal "contract_value", precision: 15, scale: 2
    t.decimal "live_profit", precision: 15, scale: 2
    t.decimal "profit_percentage", precision: 10, scale: 2
    t.string "stage"
    t.string "status"
    t.string "ted_number"
    t.string "certifier_job_no"
    t.date "start_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "purchase_orders_count", default: 0, null: false
    t.string "site_supervisor_name", default: "Andrew Clement"
    t.string "site_supervisor_email"
    t.string "site_supervisor_phone"
    t.bigint "design_id"
    t.string "design_name"
    t.datetime "onedrive_folders_created_at"
    t.string "onedrive_folder_creation_status", default: "not_requested"
    t.index ["design_id"], name: "index_constructions_on_design_id"
    t.index ["design_name"], name: "index_constructions_on_design_name"
    t.index ["onedrive_folder_creation_status"], name: "index_constructions_on_onedrive_folder_creation_status"
    t.index ["status"], name: "index_constructions_on_status"
  end

  create_table "contacts", force: :cascade do |t|
    t.integer "sys_type_id"
    t.boolean "deleted"
    t.integer "parent_id"
    t.string "parent"
    t.string "drive_id"
    t.string "folder_id"
    t.string "tax_number"
    t.string "xero_id"
    t.string "email"
    t.string "office_phone"
    t.string "mobile_phone"
    t.string "website"
    t.string "first_name"
    t.string "last_name"
    t.string "full_name"
    t.boolean "sync_with_xero"
    t.integer "contact_region_id"
    t.string "contact_region"
    t.boolean "branch"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "last_synced_at"
    t.text "xero_sync_error"
  end

  create_table "designs", force: :cascade do |t|
    t.string "name", null: false
    t.decimal "size", precision: 10, scale: 2
    t.decimal "frontage_required", precision: 10, scale: 2
    t.string "floor_plan_url"
    t.text "description"
    t.boolean "is_active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["is_active"], name: "index_designs_on_is_active"
    t.index ["name"], name: "index_designs_on_name", unique: true
  end

  create_table "estimate_line_items", force: :cascade do |t|
    t.bigint "estimate_id", null: false
    t.string "category"
    t.string "item_description", null: false
    t.decimal "quantity", precision: 15, scale: 3, default: "1.0"
    t.string "unit", default: "ea"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_estimate_line_items_on_category"
    t.index ["estimate_id"], name: "index_estimate_line_items_on_estimate_id"
  end

  create_table "estimate_reviews", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "estimate_id", null: false
    t.string "status", default: "pending", null: false
    t.text "ai_findings"
    t.text "discrepancies"
    t.integer "items_matched", default: 0
    t.integer "items_mismatched", default: 0
    t.integer "items_missing", default: 0
    t.integer "items_extra", default: 0
    t.decimal "confidence_score", precision: 5, scale: 2
    t.datetime "reviewed_at"
    t.index ["estimate_id"], name: "index_estimate_reviews_on_estimate_id"
    t.index ["reviewed_at"], name: "index_estimate_reviews_on_reviewed_at"
    t.index ["status"], name: "index_estimate_reviews_on_status"
  end

  create_table "estimates", force: :cascade do |t|
    t.bigint "construction_id"
    t.string "source", default: "unreal_engine", null: false
    t.string "estimator_name"
    t.string "job_name_from_source", null: false
    t.boolean "matched_automatically", default: false
    t.decimal "match_confidence_score", precision: 5, scale: 2
    t.string "status", default: "pending", null: false
    t.integer "total_items", default: 0
    t.datetime "imported_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["construction_id"], name: "index_estimates_on_construction_id"
    t.index ["imported_at"], name: "index_estimates_on_imported_at"
    t.index ["source"], name: "index_estimates_on_source"
    t.index ["status"], name: "index_estimates_on_status"
  end

  create_table "external_integrations", force: :cascade do |t|
    t.string "name", null: false
    t.string "api_key_digest", null: false
    t.boolean "is_active", default: true
    t.datetime "last_used_at"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["is_active"], name: "index_external_integrations_on_is_active"
    t.index ["name"], name: "index_external_integrations_on_name", unique: true
  end

  create_table "folder_template_items", force: :cascade do |t|
    t.bigint "folder_template_id", null: false
    t.string "name"
    t.integer "level"
    t.integer "order"
    t.integer "parent_id"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["folder_template_id"], name: "index_folder_template_items_on_folder_template_id"
  end

  create_table "folder_templates", force: :cascade do |t|
    t.string "name"
    t.string "template_type"
    t.boolean "is_system_default"
    t.boolean "is_active"
    t.integer "created_by_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "grok_plans", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.jsonb "conversation", default: []
    t.string "status", default: "planning"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_grok_plans_on_user_id"
  end

  create_table "import_sessions", force: :cascade do |t|
    t.string "session_key"
    t.string "file_path"
    t.string "original_filename"
    t.integer "file_size"
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "status", default: "pending"
    t.decimal "progress", precision: 5, scale: 2, default: "0.0"
    t.integer "total_rows", default: 0
    t.integer "processed_rows", default: 0
    t.datetime "completed_at"
    t.text "error_message"
    t.json "result"
    t.integer "table_id"
    t.text "file_data"
    t.index ["session_key"], name: "index_import_sessions_on_session_key", unique: true
    t.index ["status"], name: "index_import_sessions_on_status"
    t.index ["table_id"], name: "index_import_sessions_on_table_id"
  end

  create_table "ml_features", id: :serial, force: :cascade do |t|
    t.string "feature_type", limit: 50, null: false
    t.integer "entity_id", null: false
    t.string "entity_type", limit: 50, null: false
    t.jsonb "features", null: false
    t.datetime "computed_at", precision: nil, default: -> { "now()" }, null: false
    t.datetime "created_at", precision: nil, default: -> { "now()" }, null: false
    t.datetime "updated_at", precision: nil, default: -> { "now()" }, null: false
    t.index ["computed_at"], name: "idx_features_computed_at"
    t.index ["entity_type", "entity_id"], name: "idx_features_entity"
    t.index ["feature_type"], name: "idx_features_type"
  end

  create_table "ml_predictions", id: :serial, force: :cascade do |t|
    t.string "model_name", limit: 100, null: false
    t.string "model_version", limit: 50, null: false
    t.integer "entity_id", null: false
    t.string "entity_type", limit: 50, null: false
    t.jsonb "prediction_value", null: false
    t.float "confidence_score"
    t.datetime "predicted_at", precision: nil, default: -> { "now()" }, null: false
    t.datetime "created_at", precision: nil, default: -> { "now()" }, null: false
    t.index ["entity_type", "entity_id"], name: "idx_predictions_entity"
    t.index ["model_name", "model_version"], name: "idx_predictions_model"
    t.index ["predicted_at"], name: "idx_predictions_predicted_at"
  end

  create_table "one_drive_credentials", force: :cascade do |t|
    t.bigint "construction_id", null: false
    t.text "access_token"
    t.text "refresh_token"
    t.datetime "token_expires_at"
    t.string "drive_id"
    t.string "root_folder_id"
    t.string "folder_path"
    t.jsonb "metadata", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["construction_id"], name: "index_one_drive_credentials_on_construction_id", unique: true
    t.index ["drive_id"], name: "index_one_drive_credentials_on_drive_id"
    t.index ["token_expires_at"], name: "index_one_drive_credentials_on_token_expires_at"
  end

  create_table "organization_one_drive_credentials", force: :cascade do |t|
    t.text "access_token"
    t.text "refresh_token"
    t.datetime "token_expires_at"
    t.string "drive_id"
    t.string "drive_name"
    t.string "root_folder_id"
    t.string "root_folder_path"
    t.jsonb "metadata", default: {}
    t.boolean "is_active", default: true
    t.bigint "connected_by_id"
    t.datetime "last_synced_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["connected_by_id"], name: "index_organization_one_drive_credentials_on_connected_by_id"
    t.index ["is_active"], name: "index_organization_one_drive_credentials_on_is_active", unique: true, where: "(is_active = true)"
    t.index ["token_expires_at"], name: "index_organization_one_drive_credentials_on_token_expires_at"
  end

  create_table "price_histories", force: :cascade do |t|
    t.bigint "pricebook_item_id", null: false
    t.decimal "old_price", precision: 10, scale: 2
    t.decimal "new_price", precision: 10, scale: 2
    t.string "change_reason"
    t.bigint "changed_by_user_id"
    t.bigint "supplier_id"
    t.string "quote_reference"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "lga"
    t.date "date_effective"
    t.index ["created_at"], name: "index_price_histories_on_created_at"
    t.index ["pricebook_item_id", "supplier_id", "new_price", "created_at"], name: "index_price_histories_on_unique_combination", unique: true, comment: "Prevents duplicate price history entries from race conditions"
    t.index ["pricebook_item_id"], name: "index_price_histories_on_pricebook_item_id"
    t.index ["supplier_id"], name: "index_price_histories_on_supplier_id"
  end

  create_table "pricebook_items", force: :cascade do |t|
    t.string "item_code", null: false
    t.string "item_name", null: false
    t.string "category"
    t.string "unit_of_measure", default: "Each"
    t.decimal "current_price", precision: 10, scale: 2
    t.bigint "supplier_id"
    t.string "brand"
    t.text "notes"
    t.boolean "is_active", default: true
    t.boolean "needs_pricing_review", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.tsvector "searchable_text"
    t.datetime "price_last_updated_at"
    t.string "image_url"
    t.string "image_source"
    t.datetime "image_fetched_at"
    t.string "image_fetch_status"
    t.bigint "default_supplier_id"
    t.index ["category"], name: "index_pricebook_items_on_category"
    t.index ["default_supplier_id"], name: "index_pricebook_items_on_default_supplier_id"
    t.index ["image_fetch_status"], name: "index_pricebook_items_on_image_fetch_status"
    t.index ["item_code"], name: "index_pricebook_items_on_item_code", unique: true
    t.index ["needs_pricing_review"], name: "index_pricebook_items_on_needs_pricing_review"
    t.index ["price_last_updated_at"], name: "index_pricebook_items_on_price_last_updated_at"
    t.index ["searchable_text"], name: "idx_pricebook_search", using: :gin
    t.index ["supplier_id"], name: "index_pricebook_items_on_supplier_id"
  end

  create_table "project_tasks", force: :cascade do |t|
    t.bigint "project_id", null: false
    t.bigint "task_template_id"
    t.bigint "purchase_order_id"
    t.string "name", null: false
    t.string "task_type", null: false
    t.string "category", null: false
    t.string "task_code"
    t.string "status", default: "not_started"
    t.integer "progress_percentage", default: 0
    t.date "planned_start_date"
    t.date "planned_end_date"
    t.date "actual_start_date"
    t.date "actual_end_date"
    t.integer "duration_days", default: 1
    t.bigint "assigned_to_id"
    t.string "supplier_name"
    t.boolean "is_milestone", default: false
    t.boolean "is_critical_path", default: false
    t.text "notes"
    t.text "completion_notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "sequence_order"
    t.date "required_on_site_date"
    t.index ["assigned_to_id"], name: "index_project_tasks_on_assigned_to_id"
    t.index ["is_critical_path"], name: "index_project_tasks_on_is_critical_path"
    t.index ["planned_start_date", "planned_end_date"], name: "index_project_tasks_on_planned_start_date_and_planned_end_date"
    t.index ["project_id", "status"], name: "index_project_tasks_on_project_id_and_status"
    t.index ["project_id"], name: "index_project_tasks_on_project_id"
    t.index ["purchase_order_id"], name: "index_project_tasks_on_purchase_order_id"
    t.index ["task_template_id"], name: "index_project_tasks_on_task_template_id"
  end

  create_table "projects", force: :cascade do |t|
    t.string "name", null: false
    t.string "project_code"
    t.text "description"
    t.date "start_date"
    t.date "planned_end_date"
    t.date "actual_end_date"
    t.string "status", default: "planning"
    t.string "client_name"
    t.text "site_address"
    t.bigint "project_manager_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "construction_id", null: false
    t.datetime "generated_at"
    t.index ["construction_id"], name: "index_projects_on_construction_id"
    t.index ["project_code"], name: "index_projects_on_project_code", unique: true
    t.index ["project_manager_id"], name: "index_projects_on_project_manager_id"
    t.index ["start_date", "planned_end_date"], name: "index_projects_on_start_date_and_planned_end_date"
    t.index ["status"], name: "index_projects_on_status"
  end

  create_table "purchase_order_line_items", force: :cascade do |t|
    t.bigint "purchase_order_id", null: false
    t.bigint "pricebook_item_id"
    t.text "description", null: false
    t.decimal "quantity", precision: 15, scale: 3, default: "1.0", null: false
    t.decimal "unit_price", precision: 15, scale: 2, default: "0.0", null: false
    t.decimal "tax_amount", precision: 15, scale: 2, default: "0.0"
    t.decimal "total_amount", precision: 15, scale: 2, default: "0.0"
    t.text "notes"
    t.integer "line_number", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["pricebook_item_id"], name: "index_purchase_order_line_items_on_pricebook_item_id"
    t.index ["purchase_order_id", "line_number"], name: "index_po_line_items_on_po_and_line_num"
    t.index ["purchase_order_id"], name: "index_purchase_order_line_items_on_purchase_order_id"
  end

  create_table "purchase_orders", force: :cascade do |t|
    t.string "purchase_order_number", null: false
    t.bigint "construction_id", null: false
    t.bigint "supplier_id"
    t.string "status", default: "draft", null: false
    t.text "description"
    t.text "delivery_address"
    t.text "special_instructions"
    t.decimal "sub_total", precision: 15, scale: 2, default: "0.0"
    t.decimal "tax", precision: 15, scale: 2, default: "0.0"
    t.decimal "total", precision: 15, scale: 2, default: "0.0"
    t.decimal "budget", precision: 15, scale: 2
    t.decimal "amount_invoiced", precision: 15, scale: 2, default: "0.0"
    t.decimal "amount_paid", precision: 15, scale: 2, default: "0.0"
    t.string "xero_invoice_id"
    t.decimal "xero_amount_paid", precision: 15, scale: 2, default: "0.0"
    t.date "required_date"
    t.date "ordered_date"
    t.date "expected_delivery_date"
    t.date "received_date"
    t.integer "created_by_id"
    t.integer "approved_by_id"
    t.datetime "approved_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "amount_still_to_be_invoiced", precision: 15, scale: 2, default: "0.0"
    t.decimal "total_with_allowance", precision: 15, scale: 2, default: "0.0"
    t.text "ted_task"
    t.boolean "estimation_check", default: false
    t.boolean "part_payment", default: false
    t.string "xero_supplier"
    t.boolean "xero_complete", default: false
    t.decimal "xero_still_to_be_paid", precision: 15, scale: 2, default: "0.0"
    t.decimal "xero_budget_diff", precision: 15, scale: 2, default: "0.0"
    t.date "xero_paid_date"
    t.decimal "xero_total_with_allowance", precision: 15, scale: 2, default: "0.0"
    t.decimal "xero_amount_paid_exc_gst", precision: 15, scale: 2, default: "0.0"
    t.decimal "total_allowance_xero_paid", precision: 15, scale: 2, default: "0.0"
    t.decimal "diff_po_with_allowance_versus_budget", precision: 15, scale: 2, default: "0.0"
    t.decimal "diff_xero_and_total_but_not_complete", precision: 15, scale: 2, default: "0.0"
    t.date "required_on_site_date"
    t.boolean "creates_schedule_tasks", default: true
    t.string "task_category"
    t.string "payment_status", default: "pending", null: false
    t.decimal "invoiced_amount", precision: 15, scale: 2, default: "0.0"
    t.date "invoice_date"
    t.string "invoice_reference"
    t.bigint "estimate_id"
    t.index ["construction_id"], name: "index_purchase_orders_on_construction_id"
    t.index ["creates_schedule_tasks"], name: "index_purchase_orders_on_creates_schedule_tasks"
    t.index ["estimate_id"], name: "index_purchase_orders_on_estimate_id"
    t.index ["payment_status"], name: "index_purchase_orders_on_payment_status"
    t.index ["purchase_order_number"], name: "index_purchase_orders_on_purchase_order_number", unique: true
    t.index ["required_date"], name: "index_purchase_orders_on_required_date"
    t.index ["required_on_site_date"], name: "index_purchase_orders_on_required_on_site_date"
    t.index ["status"], name: "index_purchase_orders_on_status"
    t.index ["supplier_id"], name: "index_purchase_orders_on_supplier_id"
  end

  create_table "schedule_tasks", force: :cascade do |t|
    t.bigint "construction_id", null: false
    t.bigint "purchase_order_id"
    t.string "title", null: false
    t.string "status", default: "not_started"
    t.datetime "start_date"
    t.datetime "complete_date"
    t.string "duration"
    t.integer "duration_days"
    t.string "supplier_category"
    t.string "supplier_name"
    t.boolean "paid_internal", default: false
    t.datetime "approx_date"
    t.boolean "confirm", default: false
    t.boolean "supplier_confirm", default: false
    t.datetime "task_started"
    t.datetime "completed"
    t.jsonb "predecessors", default: []
    t.text "attachments"
    t.boolean "matched_to_po", default: false
    t.integer "sequence_order"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["construction_id", "matched_to_po"], name: "index_schedule_tasks_on_construction_id_and_matched_to_po"
    t.index ["construction_id"], name: "index_schedule_tasks_on_construction_id"
    t.index ["matched_to_po"], name: "index_schedule_tasks_on_matched_to_po"
    t.index ["purchase_order_id"], name: "index_schedule_tasks_on_purchase_order_id"
    t.index ["status"], name: "index_schedule_tasks_on_status"
  end

  create_table "supplier_contacts", force: :cascade do |t|
    t.bigint "supplier_id", null: false
    t.bigint "contact_id", null: false
    t.boolean "is_primary", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["contact_id"], name: "index_supplier_contacts_on_contact_id"
    t.index ["supplier_id", "contact_id"], name: "index_supplier_contacts_on_supplier_id_and_contact_id", unique: true
    t.index ["supplier_id"], name: "index_supplier_contacts_on_supplier_id"
  end

  create_table "suppliers", force: :cascade do |t|
    t.string "name", null: false
    t.string "contact_person"
    t.string "email"
    t.string "phone"
    t.text "address"
    t.integer "rating", default: 0
    t.decimal "response_rate", precision: 5, scale: 2, default: "0.0"
    t.integer "avg_response_time"
    t.text "notes"
    t.boolean "is_active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "contact_id"
    t.decimal "confidence_score", precision: 5, scale: 4
    t.string "match_type"
    t.boolean "is_verified", default: false
    t.string "original_name"
    t.string "contact_name"
    t.string "contact_number"
    t.string "supplier_code"
    t.text "trade_categories"
    t.text "is_default_for_trades"
    t.decimal "markup_percentage", precision: 5, scale: 2, default: "0.0"
    t.integer "purchase_orders_count", default: 0, null: false
    t.index ["contact_id"], name: "index_suppliers_on_contact_id"
    t.index ["is_active"], name: "index_suppliers_on_is_active"
    t.index ["is_verified"], name: "index_suppliers_on_is_verified"
    t.index ["match_type"], name: "index_suppliers_on_match_type"
    t.index ["name"], name: "index_suppliers_on_name", unique: true
    t.index ["supplier_code"], name: "index_suppliers_on_supplier_code", unique: true
  end

  create_table "tables", force: :cascade do |t|
    t.string "name", null: false
    t.string "singular_name"
    t.string "plural_name"
    t.string "database_table_name", null: false
    t.string "icon"
    t.string "title_column"
    t.boolean "searchable", default: true
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_live", default: false, null: false
    t.index ["database_table_name"], name: "index_tables_on_database_table_name", unique: true
  end

  create_table "task_dependencies", force: :cascade do |t|
    t.bigint "successor_task_id", null: false
    t.bigint "predecessor_task_id", null: false
    t.string "dependency_type", default: "finish_to_start"
    t.integer "lag_days", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["predecessor_task_id"], name: "index_task_dependencies_on_predecessor_task_id"
    t.index ["successor_task_id", "predecessor_task_id"], name: "index_unique_task_dependency", unique: true
    t.index ["successor_task_id"], name: "index_task_dependencies_on_successor_task_id"
    t.check_constraint "successor_task_id <> predecessor_task_id", name: "check_no_self_dependency"
  end

  create_table "task_templates", force: :cascade do |t|
    t.string "name", null: false
    t.string "task_type", null: false
    t.string "category", null: false
    t.integer "default_duration_days", default: 1
    t.integer "sequence_order", default: 0
    t.integer "predecessor_template_codes", default: [], array: true
    t.text "description"
    t.boolean "is_milestone", default: false
    t.boolean "requires_photo", default: false
    t.boolean "is_standard", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_task_templates_on_category"
    t.index ["sequence_order"], name: "index_task_templates_on_sequence_order"
    t.index ["task_type"], name: "index_task_templates_on_task_type"
  end

  create_table "task_updates", force: :cascade do |t|
    t.bigint "project_task_id", null: false
    t.bigint "user_id", null: false
    t.string "status_before"
    t.string "status_after"
    t.integer "progress_before"
    t.integer "progress_after"
    t.text "notes"
    t.text "photo_urls", default: [], array: true
    t.date "update_date", default: -> { "CURRENT_DATE" }, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_task_id"], name: "index_task_updates_on_project_task_id"
    t.index ["update_date"], name: "index_task_updates_on_update_date"
    t.index ["user_id"], name: "index_task_updates_on_user_id"
  end

  create_table "user_dog_dog_cat_baf84797", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "phone"
    t.string "status"
    t.date "created_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_hel_2f4512ee", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_hello_5c375e87", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_new2_adc4649b", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "phone"
    t.string "status"
    t.date "created_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_test443_66f3065d", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "phone"
    t.string "status"
    t.date "created_date"
    t.string "column_5"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_test_auto_save_a242d512", force: :cascade do |t|
    t.string "email_address"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_test_fa0cb4f3", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_users_7f31c50d", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "password_digest"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "xero_credentials", force: :cascade do |t|
    t.string "access_token", null: false
    t.string "refresh_token", null: false
    t.datetime "expires_at", null: false
    t.string "tenant_id", null: false
    t.string "tenant_name"
    t.string "tenant_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tenant_id"], name: "index_xero_credentials_on_tenant_id"
  end

  add_foreign_key "columns", "tables"
  add_foreign_key "constructions", "designs"
  add_foreign_key "estimate_line_items", "estimates"
  add_foreign_key "estimate_reviews", "estimates"
  add_foreign_key "estimates", "constructions"
  add_foreign_key "folder_template_items", "folder_templates"
  add_foreign_key "grok_plans", "users"
  add_foreign_key "one_drive_credentials", "constructions"
  add_foreign_key "organization_one_drive_credentials", "users", column: "connected_by_id"
  add_foreign_key "price_histories", "pricebook_items"
  add_foreign_key "price_histories", "suppliers"
  add_foreign_key "pricebook_items", "suppliers"
  add_foreign_key "pricebook_items", "suppliers", column: "default_supplier_id"
  add_foreign_key "project_tasks", "projects"
  add_foreign_key "project_tasks", "purchase_orders"
  add_foreign_key "project_tasks", "task_templates"
  add_foreign_key "project_tasks", "users", column: "assigned_to_id"
  add_foreign_key "projects", "constructions"
  add_foreign_key "projects", "users", column: "project_manager_id"
  add_foreign_key "purchase_order_line_items", "pricebook_items"
  add_foreign_key "purchase_order_line_items", "purchase_orders"
  add_foreign_key "purchase_orders", "constructions"
  add_foreign_key "purchase_orders", "estimates"
  add_foreign_key "purchase_orders", "suppliers"
  add_foreign_key "schedule_tasks", "constructions"
  add_foreign_key "schedule_tasks", "purchase_orders"
  add_foreign_key "supplier_contacts", "contacts"
  add_foreign_key "supplier_contacts", "suppliers"
  add_foreign_key "task_dependencies", "project_tasks", column: "predecessor_task_id"
  add_foreign_key "task_dependencies", "project_tasks", column: "successor_task_id"
  add_foreign_key "task_updates", "project_tasks"
  add_foreign_key "task_updates", "users"
end
