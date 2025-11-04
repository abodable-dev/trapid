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

ActiveRecord::Schema[8.0].define(version: 2025_11_04_030112) do
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
    t.string "po_number", null: false
    t.bigint "construction_id", null: false
    t.bigint "supplier_id"
    t.string "status", default: "draft", null: false
    t.text "description"
    t.text "delivery_address"
    t.text "special_instructions"
    t.decimal "sub_total", precision: 15, scale: 2, default: "0.0"
    t.decimal "tax_amount", precision: 15, scale: 2, default: "0.0"
    t.decimal "total_amount", precision: 15, scale: 2, default: "0.0"
    t.decimal "budget_allocation", precision: 15, scale: 2
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
    t.index ["construction_id"], name: "index_purchase_orders_on_construction_id"
    t.index ["po_number"], name: "index_purchase_orders_on_po_number", unique: true
    t.index ["required_date"], name: "index_purchase_orders_on_required_date"
    t.index ["status"], name: "index_purchase_orders_on_status"
    t.index ["supplier_id"], name: "index_purchase_orders_on_supplier_id"
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
    t.index ["contact_id"], name: "index_suppliers_on_contact_id"
    t.index ["is_active"], name: "index_suppliers_on_is_active"
    t.index ["is_verified"], name: "index_suppliers_on_is_verified"
    t.index ["match_type"], name: "index_suppliers_on_match_type"
    t.index ["name"], name: "index_suppliers_on_name", unique: true
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

  add_foreign_key "columns", "tables"
  add_foreign_key "grok_plans", "users"
  add_foreign_key "price_histories", "pricebook_items"
  add_foreign_key "price_histories", "suppliers"
  add_foreign_key "pricebook_items", "suppliers"
  add_foreign_key "pricebook_items", "suppliers", column: "default_supplier_id"
  add_foreign_key "purchase_order_line_items", "pricebook_items"
  add_foreign_key "purchase_order_line_items", "purchase_orders"
  add_foreign_key "purchase_orders", "constructions"
  add_foreign_key "purchase_orders", "suppliers"
end
