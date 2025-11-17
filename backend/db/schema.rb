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

ActiveRecord::Schema[8.0].define(version: 2025_11_17_051007) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pg_stat_statements"
  enable_extension "pg_trgm"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "agent_definitions", force: :cascade do |t|
    t.string "agent_id", null: false
    t.string "name", null: false
    t.string "agent_type", null: false
    t.string "focus", null: false
    t.string "model", default: "sonnet"
    t.text "purpose"
    t.text "capabilities"
    t.text "when_to_use"
    t.text "tools_available"
    t.text "success_criteria"
    t.text "example_invocations"
    t.text "important_notes"
    t.integer "total_runs", default: 0
    t.integer "successful_runs", default: 0
    t.integer "failed_runs", default: 0
    t.datetime "last_run_at"
    t.string "last_status"
    t.text "last_message"
    t.jsonb "last_run_details", default: {}
    t.jsonb "metadata", default: {}
    t.boolean "active", default: true
    t.integer "priority", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_agent_definitions_on_active"
    t.index ["agent_id"], name: "index_agent_definitions_on_agent_id", unique: true
    t.index ["agent_type"], name: "index_agent_definitions_on_agent_type"
  end

  create_table "bug_hunter_test_runs", force: :cascade do |t|
    t.string "test_id", null: false
    t.string "status", null: false
    t.text "message"
    t.float "duration"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "template_id"
    t.text "console_output"
    t.index ["created_at"], name: "index_bug_hunter_test_runs_on_created_at"
    t.index ["test_id"], name: "index_bug_hunter_test_runs_on_test_id"
  end

  create_table "chat_messages", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "project_id"
    t.text "content", null: false
    t.string "channel", default: "general", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "recipient_user_id"
    t.bigint "construction_id"
    t.boolean "saved_to_job", default: false
    t.index ["channel", "created_at"], name: "index_chat_messages_on_channel_and_created_at"
    t.index ["construction_id", "channel", "created_at"], name: "index_chat_messages_on_construction_channel_created"
    t.index ["construction_id"], name: "index_chat_messages_on_construction_id"
    t.index ["created_at"], name: "index_chat_messages_on_created_at"
    t.index ["project_id", "created_at"], name: "index_chat_messages_on_project_id_and_created_at"
    t.index ["project_id"], name: "index_chat_messages_on_project_id"
    t.index ["user_id"], name: "index_chat_messages_on_user_id"
  end

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
    t.boolean "has_cross_table_refs", default: false, null: false
    t.index ["has_cross_table_refs"], name: "index_columns_on_has_cross_table_refs"
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
    t.string "twilio_account_sid"
    t.string "twilio_auth_token"
    t.string "twilio_phone_number"
    t.boolean "twilio_enabled", default: false
    t.string "timezone", default: "Australia/Brisbane"
    t.jsonb "working_days"
  end

  create_table "construction_contacts", force: :cascade do |t|
    t.bigint "construction_id", null: false
    t.bigint "contact_id", null: false
    t.boolean "primary", default: false, null: false
    t.string "role"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["construction_id", "contact_id"], name: "index_construction_contacts_on_construction_id_and_contact_id", unique: true
    t.index ["construction_id", "primary"], name: "index_construction_contacts_on_construction_id_and_primary"
    t.index ["construction_id"], name: "index_construction_contacts_on_construction_id"
    t.index ["contact_id"], name: "index_construction_contacts_on_contact_id"
  end

  create_table "construction_documentation_tabs", force: :cascade do |t|
    t.bigint "construction_id", null: false
    t.string "name", null: false
    t.string "icon"
    t.string "color"
    t.text "description"
    t.integer "sequence_order", default: 0
    t.boolean "is_active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "folder_path"
    t.index ["construction_id", "name"], name: "idx_on_construction_id_name_4a8823caab", unique: true
    t.index ["construction_id", "sequence_order"], name: "idx_on_construction_id_sequence_order_48145dc07a"
    t.index ["construction_id"], name: "index_construction_documentation_tabs_on_construction_id"
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
    t.string "site_supervisor_phone", default: "0407 150 081"
    t.bigint "design_id"
    t.string "design_name"
    t.datetime "onedrive_folders_created_at"
    t.string "onedrive_folder_creation_status", default: "not_requested"
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.string "location"
    t.index ["created_at"], name: "index_constructions_on_created_at"
    t.index ["design_id"], name: "index_constructions_on_design_id"
    t.index ["design_name"], name: "index_constructions_on_design_name"
    t.index ["onedrive_folder_creation_status"], name: "index_constructions_on_onedrive_folder_creation_status"
    t.index ["status"], name: "index_constructions_on_status"
  end

  create_table "contact_activities", force: :cascade do |t|
    t.bigint "contact_id", null: false
    t.string "activity_type"
    t.text "description"
    t.jsonb "metadata"
    t.string "performed_by_type", null: false
    t.bigint "performed_by_id", null: false
    t.datetime "occurred_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["contact_id"], name: "index_contact_activities_on_contact_id"
    t.index ["performed_by_type", "performed_by_id"], name: "index_contact_activities_on_performed_by"
  end

  create_table "contact_addresses", force: :cascade do |t|
    t.bigint "contact_id", null: false
    t.string "address_type"
    t.string "line1"
    t.string "line2"
    t.string "line3"
    t.string "line4"
    t.string "city"
    t.string "region"
    t.string "postal_code"
    t.string "country"
    t.string "attention_to"
    t.boolean "is_primary", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["address_type"], name: "index_contact_addresses_on_address_type"
    t.index ["contact_id", "address_type"], name: "index_contact_addresses_on_contact_id_and_address_type"
    t.index ["contact_id", "is_primary"], name: "index_contact_addresses_on_contact_id_and_is_primary"
    t.index ["contact_id"], name: "index_contact_addresses_on_contact_id"
  end

  create_table "contact_group_memberships", force: :cascade do |t|
    t.bigint "contact_id", null: false
    t.bigint "contact_group_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["contact_group_id"], name: "index_contact_group_memberships_on_contact_group_id"
    t.index ["contact_id"], name: "index_contact_group_memberships_on_contact_id"
  end

  create_table "contact_groups", force: :cascade do |t|
    t.string "xero_contact_group_id", null: false
    t.string "name", null: false
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_contact_groups_on_name"
    t.index ["status"], name: "index_contact_groups_on_status"
    t.index ["xero_contact_group_id"], name: "index_contact_groups_on_xero_contact_group_id", unique: true
  end

  create_table "contact_persons", force: :cascade do |t|
    t.bigint "contact_id", null: false
    t.string "first_name"
    t.string "last_name"
    t.string "email"
    t.boolean "include_in_emails", default: true
    t.boolean "is_primary", default: false
    t.string "xero_contact_person_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role"
    t.string "mobile"
    t.index ["contact_id", "is_primary"], name: "index_contact_persons_on_contact_id_and_is_primary"
    t.index ["contact_id"], name: "index_contact_persons_on_contact_id"
    t.index ["email"], name: "index_contact_persons_on_email"
    t.index ["xero_contact_person_id"], name: "index_contact_persons_on_xero_contact_person_id"
  end

  create_table "contact_relationships", force: :cascade do |t|
    t.bigint "source_contact_id", null: false
    t.bigint "related_contact_id", null: false
    t.string "relationship_type", null: false
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["related_contact_id"], name: "index_contact_relationships_on_related_contact_id"
    t.index ["source_contact_id", "related_contact_id"], name: "index_contact_relationships_on_source_and_related", unique: true
    t.index ["source_contact_id"], name: "index_contact_relationships_on_source_contact_id"
  end

  create_table "contact_roles", force: :cascade do |t|
    t.string "name", null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "contact_types", default: [], comment: "Array of contact types: customer, supplier, sales, land_agent. Empty array = shared/universal role", array: true
    t.index ["contact_types"], name: "index_contact_roles_on_contact_types", using: :gin
    t.index ["name"], name: "index_contact_roles_on_name", unique: true
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
    t.string "contact_types", default: [], array: true
    t.string "primary_contact_type"
    t.integer "rating", default: 0
    t.decimal "response_rate", precision: 5, scale: 2, default: "0.0"
    t.integer "avg_response_time"
    t.text "notes"
    t.boolean "is_active", default: true
    t.string "supplier_code"
    t.text "address"
    t.text "lgas", default: [], array: true
    t.string "bank_bsb"
    t.string "bank_account_number"
    t.string "bank_account_name"
    t.string "default_purchase_account"
    t.integer "bill_due_day"
    t.string "bill_due_type"
    t.string "xero_contact_number"
    t.string "xero_contact_status"
    t.string "xero_account_number"
    t.string "company_number"
    t.string "fax_phone"
    t.string "default_sales_account"
    t.decimal "default_discount", precision: 5, scale: 2
    t.integer "sales_due_day"
    t.string "sales_due_type"
    t.decimal "accounts_receivable_outstanding", precision: 15, scale: 2
    t.decimal "accounts_receivable_overdue", precision: 15, scale: 2
    t.decimal "accounts_payable_outstanding", precision: 15, scale: 2
    t.decimal "accounts_payable_overdue", precision: 15, scale: 2
    t.boolean "portal_enabled", default: false
    t.datetime "portal_welcome_sent_at"
    t.decimal "trapid_rating", precision: 3, scale: 2
    t.integer "total_ratings_count", default: 0
    t.index ["contact_types"], name: "index_contacts_on_contact_types", using: :gin
    t.index ["email"], name: "index_contacts_on_email"
    t.index ["is_active"], name: "index_contacts_on_is_active"
    t.index ["portal_enabled"], name: "index_contacts_on_portal_enabled"
    t.index ["primary_contact_type"], name: "index_contacts_on_primary_contact_type"
    t.index ["rating"], name: "index_contacts_on_rating"
    t.index ["supplier_code"], name: "index_contacts_on_supplier_code", unique: true, where: "(supplier_code IS NOT NULL)"
    t.index ["trapid_rating"], name: "index_contacts_on_trapid_rating"
    t.index ["xero_contact_number"], name: "index_contacts_on_xero_contact_number"
    t.index ["xero_contact_status"], name: "index_contacts_on_xero_contact_status"
    t.index ["xero_id", "last_synced_at"], name: "index_contacts_on_xero_id_and_last_synced_at"
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

  create_table "document_tasks", force: :cascade do |t|
    t.bigint "construction_id", null: false
    t.string "category"
    t.string "name"
    t.text "description"
    t.boolean "required"
    t.boolean "has_document"
    t.boolean "is_validated"
    t.datetime "uploaded_at"
    t.string "uploaded_by"
    t.datetime "validated_at"
    t.string "validated_by"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["construction_id"], name: "index_document_tasks_on_construction_id"
  end

  create_table "documentation_categories", force: :cascade do |t|
    t.string "name", null: false
    t.string "icon"
    t.string "color"
    t.text "description"
    t.integer "sequence_order", default: 0
    t.boolean "is_default", default: false
    t.boolean "is_active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "folder_path"
    t.index ["name"], name: "index_documentation_categories_on_name", unique: true
  end

  create_table "emails", force: :cascade do |t|
    t.bigint "construction_id", null: false
    t.string "from_email"
    t.string "to_email"
    t.string "subject"
    t.text "body"
    t.datetime "received_at"
    t.text "raw_email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["construction_id"], name: "index_emails_on_construction_id"
    t.index ["received_at"], name: "index_emails_on_received_at"
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
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
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
    t.index ["construction_id", "status"], name: "index_estimates_on_construction_and_status"
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
    t.string "name", null: false
    t.integer "level", default: 0, null: false
    t.integer "order", default: 0, null: false
    t.bigint "parent_id"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["folder_template_id", "order"], name: "index_folder_template_items_on_folder_template_id_and_order"
    t.index ["folder_template_id"], name: "index_folder_template_items_on_folder_template_id"
    t.index ["level"], name: "index_folder_template_items_on_level"
    t.index ["parent_id"], name: "index_folder_template_items_on_parent_id"
  end

  create_table "folder_templates", force: :cascade do |t|
    t.string "name", null: false
    t.string "template_type"
    t.boolean "is_system_default", default: false, null: false
    t.boolean "is_active", default: true, null: false
    t.bigint "created_by_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_folder_templates_on_created_by_id"
    t.index ["is_active"], name: "index_folder_templates_on_is_active"
    t.index ["is_system_default"], name: "index_folder_templates_on_is_system_default"
    t.index ["name"], name: "index_folder_templates_on_name"
    t.index ["template_type"], name: "index_folder_templates_on_template_type"
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

  create_table "implementation_patterns", force: :cascade do |t|
    t.integer "chapter_number", null: false
    t.string "chapter_name", null: false
    t.string "section_number", null: false
    t.string "pattern_title", null: false
    t.string "bible_rule_reference"
    t.text "quick_start"
    t.text "full_implementation"
    t.text "architecture"
    t.text "common_mistakes"
    t.text "testing"
    t.text "migration_guide"
    t.text "integration"
    t.text "notes"
    t.jsonb "code_examples", default: []
    t.jsonb "metadata", default: {}
    t.text "search_text"
    t.string "complexity", default: "medium"
    t.string "languages", default: [], array: true
    t.string "tags", default: [], array: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chapter_number", "section_number"], name: "index_implementation_patterns_on_chapter_and_section", unique: true
    t.index ["chapter_number"], name: "index_implementation_patterns_on_chapter_number"
    t.index ["complexity"], name: "index_implementation_patterns_on_complexity"
    t.index ["languages"], name: "index_implementation_patterns_on_languages", using: :gin
    t.index ["search_text"], name: "index_implementation_patterns_on_search_text", opclass: :gin_trgm_ops, using: :gin
    t.index ["section_number"], name: "index_implementation_patterns_on_section_number"
    t.index ["tags"], name: "index_implementation_patterns_on_tags", using: :gin
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

  create_table "maintenance_requests", force: :cascade do |t|
    t.bigint "construction_id", null: false
    t.bigint "supplier_contact_id"
    t.bigint "reported_by_user_id"
    t.bigint "purchase_order_id"
    t.string "request_number", null: false
    t.string "status", default: "open", null: false
    t.string "priority", default: "medium"
    t.string "category"
    t.string "title", null: false
    t.text "description"
    t.text "resolution_notes"
    t.date "reported_date", null: false
    t.date "due_date"
    t.date "resolved_date"
    t.boolean "warranty_claim", default: false
    t.decimal "estimated_cost", precision: 10, scale: 2
    t.decimal "actual_cost", precision: 10, scale: 2
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["construction_id", "status"], name: "index_maintenance_requests_on_construction_id_and_status"
    t.index ["construction_id"], name: "index_maintenance_requests_on_construction_id"
    t.index ["purchase_order_id"], name: "index_maintenance_requests_on_purchase_order_id"
    t.index ["reported_by_user_id"], name: "index_maintenance_requests_on_reported_by_user_id"
    t.index ["request_number"], name: "index_maintenance_requests_on_request_number", unique: true
    t.index ["status"], name: "index_maintenance_requests_on_status"
    t.index ["supplier_contact_id", "status"], name: "index_maintenance_requests_on_supplier_contact_id_and_status"
    t.index ["supplier_contact_id"], name: "index_maintenance_requests_on_supplier_contact_id"
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

  create_table "organization_outlook_credentials", force: :cascade do |t|
    t.text "access_token"
    t.text "refresh_token"
    t.datetime "expires_at"
    t.string "email"
    t.string "tenant_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "outlook_credentials", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.text "access_token"
    t.text "refresh_token"
    t.datetime "expires_at"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_outlook_credentials_on_user_id"
  end

  create_table "payments", force: :cascade do |t|
    t.bigint "purchase_order_id", null: false
    t.decimal "amount", precision: 15, scale: 2, null: false
    t.date "payment_date", null: false
    t.string "payment_method"
    t.string "reference_number"
    t.text "notes"
    t.string "xero_payment_id"
    t.datetime "xero_synced_at"
    t.text "xero_sync_error"
    t.bigint "created_by_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_payments_on_created_by_id"
    t.index ["payment_date"], name: "index_payments_on_payment_date"
    t.index ["purchase_order_id", "payment_date"], name: "index_payments_on_purchase_order_id_and_payment_date"
    t.index ["purchase_order_id"], name: "index_payments_on_purchase_order_id"
    t.index ["xero_payment_id"], name: "index_payments_on_xero_payment_id"
  end

  create_table "portal_access_logs", force: :cascade do |t|
    t.bigint "portal_user_id", null: false
    t.string "action"
    t.string "ip_address"
    t.string "user_agent"
    t.jsonb "metadata"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["action"], name: "index_portal_access_logs_on_action"
    t.index ["created_at"], name: "index_portal_access_logs_on_created_at"
    t.index ["portal_user_id", "created_at"], name: "index_portal_access_logs_on_portal_user_id_and_created_at"
    t.index ["portal_user_id"], name: "index_portal_access_logs_on_portal_user_id"
  end

  create_table "portal_users", force: :cascade do |t|
    t.bigint "contact_id", null: false
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "portal_type", null: false
    t.boolean "active", default: true
    t.datetime "last_login_at"
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.integer "failed_login_attempts", default: 0
    t.datetime "locked_until"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["contact_id", "portal_type"], name: "index_portal_users_on_contact_id_and_portal_type", unique: true
    t.index ["contact_id"], name: "index_portal_users_on_contact_id"
    t.index ["email"], name: "index_portal_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_portal_users_on_reset_password_token", unique: true
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
    t.string "user_name"
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
    t.string "qr_code_url"
    t.boolean "requires_photo", default: false
    t.boolean "requires_spec", default: false
    t.string "spec_url"
    t.string "gst_code"
    t.boolean "photo_attached", default: false
    t.boolean "spec_attached", default: false
    t.string "image_file_id"
    t.string "spec_file_id"
    t.string "qr_code_file_id"
    t.index ["category", "is_active", "supplier_id"], name: "index_pricebook_items_on_category_active_supplier"
    t.index ["category"], name: "index_pricebook_items_on_category"
    t.index ["default_supplier_id"], name: "index_pricebook_items_on_default_supplier_id"
    t.index ["image_fetch_status"], name: "index_pricebook_items_on_image_fetch_status"
    t.index ["is_active"], name: "index_pricebook_items_on_is_active"
    t.index ["item_code"], name: "index_pricebook_items_on_item_code", unique: true
    t.index ["needs_pricing_review"], name: "index_pricebook_items_on_needs_pricing_review"
    t.index ["price_last_updated_at"], name: "index_pricebook_items_on_price_last_updated_at"
    t.index ["searchable_text"], name: "idx_pricebook_search", using: :gin
    t.index ["supplier_id"], name: "index_pricebook_items_on_supplier_id"
  end

  create_table "project_task_checklist_items", force: :cascade do |t|
    t.bigint "project_task_id", null: false
    t.string "name", null: false
    t.text "description"
    t.string "category"
    t.boolean "is_completed", default: false
    t.datetime "completed_at"
    t.string "completed_by"
    t.integer "sequence_order", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "response_type"
    t.text "response_note"
    t.string "response_photo_url"
    t.index ["is_completed"], name: "index_project_task_checklist_items_on_is_completed"
    t.index ["project_task_id", "sequence_order"], name: "idx_on_project_task_id_sequence_order_cc3d531d29"
    t.index ["project_task_id"], name: "index_project_task_checklist_items_on_project_task_id"
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
    t.bigint "schedule_template_row_id"
    t.string "spawned_type"
    t.bigint "parent_task_id"
    t.boolean "requires_supervisor_check", default: false, null: false
    t.datetime "supervisor_checked_at"
    t.bigint "supervisor_checked_by_id"
    t.datetime "photo_uploaded_at"
    t.datetime "certificate_uploaded_at"
    t.jsonb "tags", default: [], null: false
    t.boolean "critical_po", default: false, null: false
    t.boolean "auto_complete_predecessors", default: false, null: false
    t.jsonb "auto_complete_task_ids", default: [], null: false
    t.jsonb "subtask_template_ids", default: [], null: false
    t.boolean "manual_task", default: false, null: false
    t.boolean "allow_multiple_instances", default: false, null: false
    t.boolean "order_required", default: false, null: false
    t.boolean "call_up_required", default: false, null: false
    t.boolean "plan_required", default: false, null: false
    t.integer "duration", default: 0, null: false
    t.index ["assigned_to_id"], name: "index_project_tasks_on_assigned_to_id"
    t.index ["is_critical_path"], name: "index_project_tasks_on_is_critical_path"
    t.index ["parent_task_id"], name: "index_project_tasks_on_parent_task_id"
    t.index ["planned_start_date", "planned_end_date"], name: "index_project_tasks_on_planned_start_date_and_planned_end_date"
    t.index ["project_id", "status", "planned_start_date"], name: "index_project_tasks_on_project_status_start"
    t.index ["project_id", "status"], name: "index_project_tasks_on_project_id_and_status"
    t.index ["project_id"], name: "index_project_tasks_on_project_id"
    t.index ["purchase_order_id"], name: "index_project_tasks_on_purchase_order_id"
    t.index ["requires_supervisor_check"], name: "index_project_tasks_on_requires_supervisor_check"
    t.index ["schedule_template_row_id"], name: "index_project_tasks_on_schedule_template_row_id"
    t.index ["spawned_type"], name: "index_project_tasks_on_spawned_type"
    t.index ["supervisor_checked_by_id"], name: "index_project_tasks_on_supervisor_checked_by_id"
    t.index ["tags"], name: "index_project_tasks_on_tags", using: :gin
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

  create_table "public_holidays", force: :cascade do |t|
    t.string "name"
    t.date "date"
    t.string "region"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "purchase_order_documents", force: :cascade do |t|
    t.bigint "purchase_order_id", null: false
    t.bigint "document_task_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["document_task_id"], name: "index_purchase_order_documents_on_document_task_id"
    t.index ["purchase_order_id", "document_task_id"], name: "index_po_documents_on_po_and_document", unique: true
    t.index ["purchase_order_id"], name: "index_purchase_order_documents_on_purchase_order_id"
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
    t.boolean "visible_to_supplier", default: false
    t.jsonb "payment_schedule"
    t.index ["construction_id", "status"], name: "index_purchase_orders_on_construction_and_status"
    t.index ["construction_id"], name: "index_purchase_orders_on_construction_id"
    t.index ["creates_schedule_tasks"], name: "index_purchase_orders_on_creates_schedule_tasks"
    t.index ["estimate_id"], name: "index_purchase_orders_on_estimate_id"
    t.index ["payment_status"], name: "index_purchase_orders_on_payment_status"
    t.index ["purchase_order_number"], name: "index_purchase_orders_on_purchase_order_number", unique: true
    t.index ["required_date"], name: "index_purchase_orders_on_required_date"
    t.index ["required_on_site_date"], name: "index_purchase_orders_on_required_on_site_date"
    t.index ["status"], name: "index_purchase_orders_on_status"
    t.index ["supplier_id"], name: "index_purchase_orders_on_supplier_id"
    t.index ["visible_to_supplier"], name: "index_purchase_orders_on_visible_to_supplier"
  end

  create_table "rain_logs", force: :cascade do |t|
    t.bigint "construction_id", null: false
    t.date "date", null: false
    t.decimal "rainfall_mm", precision: 10, scale: 2
    t.decimal "hours_affected", precision: 5, scale: 2
    t.string "severity"
    t.string "source", default: "manual", null: false
    t.bigint "created_by_user_id"
    t.text "notes"
    t.jsonb "weather_api_response"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["construction_id", "date"], name: "index_rain_logs_on_construction_id_and_date", unique: true
    t.index ["construction_id"], name: "index_rain_logs_on_construction_id"
    t.index ["created_by_user_id"], name: "index_rain_logs_on_created_by_user_id"
    t.index ["date"], name: "index_rain_logs_on_date"
    t.index ["source"], name: "index_rain_logs_on_source"
  end

  create_table "sam_quick_est_items", force: :cascade do |t|
    t.string "item_code", null: false
    t.string "item_name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "claude_estimate", precision: 10, scale: 2
    t.index ["item_code"], name: "index_sam_quick_est_items_on_item_code", unique: true
  end

  create_table "schedule_task_checklist_items", force: :cascade do |t|
    t.bigint "schedule_task_id", null: false
    t.string "name", null: false
    t.text "description"
    t.string "category"
    t.boolean "is_completed", default: false
    t.datetime "completed_at"
    t.string "completed_by"
    t.integer "sequence_order", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "response_type"
    t.text "response_note"
    t.string "response_photo_url"
    t.index ["is_completed"], name: "index_schedule_task_checklist_items_on_is_completed"
    t.index ["schedule_task_id", "sequence_order"], name: "idx_on_schedule_task_id_sequence_order_bbbbb75501"
    t.index ["schedule_task_id"], name: "index_schedule_task_checklist_items_on_schedule_task_id"
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
    t.index ["start_date"], name: "index_schedule_tasks_on_start_date"
    t.index ["status"], name: "index_schedule_tasks_on_status"
  end

  create_table "schedule_template_row_audits", force: :cascade do |t|
    t.bigint "schedule_template_row_id", null: false
    t.bigint "user_id", null: false
    t.string "field_name", null: false
    t.boolean "old_value"
    t.boolean "new_value"
    t.datetime "changed_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["schedule_template_row_id", "changed_at"], name: "idx_on_schedule_template_row_id_changed_at_d2d3f08a64"
    t.index ["schedule_template_row_id"], name: "index_schedule_template_row_audits_on_schedule_template_row_id"
    t.index ["user_id"], name: "index_schedule_template_row_audits_on_user_id"
  end

  create_table "schedule_template_rows", force: :cascade do |t|
    t.bigint "schedule_template_id", null: false
    t.string "name", null: false
    t.bigint "supplier_id"
    t.jsonb "predecessor_ids", default: [], null: false
    t.boolean "po_required", default: false, null: false
    t.boolean "create_po_on_job_start", default: false, null: false
    t.jsonb "price_book_item_ids", default: [], null: false
    t.boolean "critical_po", default: false, null: false
    t.jsonb "tags", default: [], null: false
    t.boolean "require_photo", default: false, null: false
    t.boolean "require_certificate", default: false, null: false
    t.integer "cert_lag_days", default: 10, null: false
    t.boolean "require_supervisor_check", default: false, null: false
    t.boolean "auto_complete_predecessors", default: false, null: false
    t.boolean "has_subtasks", default: false, null: false
    t.integer "subtask_count"
    t.jsonb "subtask_names", default: [], null: false
    t.integer "sequence_order", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "assigned_user_id"
    t.integer "documentation_category_ids", default: [], array: true
    t.text "linked_task_ids", default: "[]"
    t.integer "linked_template_id"
    t.integer "supervisor_checklist_template_ids", default: [], array: true
    t.jsonb "auto_complete_task_ids", default: [], null: false
    t.jsonb "subtask_template_ids", default: [], null: false
    t.boolean "manual_task", default: false, null: false
    t.boolean "allow_multiple_instances", default: false, null: false
    t.boolean "order_required", default: false, null: false
    t.boolean "call_up_required", default: false, null: false
    t.boolean "plan_required", default: false, null: false
    t.integer "duration", default: 0, null: false
    t.integer "start_date", default: 0, null: false
    t.boolean "manually_positioned", default: false, null: false
    t.boolean "confirm", default: false, null: false
    t.boolean "supplier_confirm", default: false, null: false
    t.boolean "start", default: false, null: false
    t.boolean "complete", default: false, null: false
    t.boolean "dependencies_broken", default: false, null: false
    t.jsonb "broken_predecessor_ids", default: [], null: false
    t.index ["documentation_category_ids"], name: "index_schedule_template_rows_on_documentation_category_ids", using: :gin
    t.index ["schedule_template_id", "sequence_order"], name: "idx_on_schedule_template_id_sequence_order_1bea5d762b"
    t.index ["schedule_template_id"], name: "index_schedule_template_rows_on_schedule_template_id"
    t.index ["sequence_order"], name: "index_schedule_template_rows_on_sequence_order"
    t.index ["supervisor_checklist_template_ids"], name: "index_schedule_template_rows_on_supervisor_checklist_template_i", using: :gin
    t.index ["supplier_id"], name: "index_schedule_template_rows_on_supplier_id"
  end

  create_table "schedule_templates", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.boolean "is_default", default: false, null: false
    t.bigint "created_by_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_id"], name: "index_schedule_templates_on_created_by_id"
    t.index ["is_default"], name: "index_schedule_templates_on_is_default"
    t.index ["name"], name: "index_schedule_templates_on_name"
  end

  create_table "sms_messages", force: :cascade do |t|
    t.bigint "contact_id", null: false
    t.bigint "user_id"
    t.string "from_phone", null: false
    t.string "to_phone", null: false
    t.text "body", null: false
    t.string "direction", null: false
    t.string "status"
    t.string "twilio_sid"
    t.datetime "sent_at"
    t.datetime "received_at"
    t.text "error_message"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["contact_id", "created_at"], name: "index_sms_messages_on_contact_id_and_created_at"
    t.index ["contact_id"], name: "index_sms_messages_on_contact_id"
    t.index ["direction", "status"], name: "index_sms_messages_on_direction_and_status"
    t.index ["twilio_sid"], name: "index_sms_messages_on_twilio_sid", unique: true
    t.index ["user_id"], name: "index_sms_messages_on_user_id"
  end

  create_table "solid_queue_blocked_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.string "concurrency_key", null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.index ["concurrency_key", "priority", "job_id"], name: "index_solid_queue_blocked_executions_for_release"
    t.index ["expires_at", "concurrency_key"], name: "index_solid_queue_blocked_executions_for_maintenance"
    t.index ["job_id"], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
  end

  create_table "solid_queue_claimed_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.bigint "process_id"
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
  end

  create_table "solid_queue_failed_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.text "error"
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_executions_on_job_id", unique: true
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "queue_name", null: false
    t.string "class_name", null: false
    t.text "arguments"
    t.integer "priority", default: 0, null: false
    t.string "active_job_id"
    t.datetime "scheduled_at"
    t.datetime "finished_at"
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "key_hash"
    t.index ["active_job_id"], name: "index_solid_queue_jobs_on_active_job_id"
    t.index ["class_name"], name: "index_solid_queue_jobs_on_class_name"
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["key_hash"], name: "index_solid_queue_jobs_on_key_hash", unique: true
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_for_filtering"
    t.index ["scheduled_at", "finished_at"], name: "index_solid_queue_jobs_for_alerting"
  end

  create_table "solid_queue_pauses", force: :cascade do |t|
    t.string "queue_name", null: false
    t.datetime "created_at", null: false
    t.index ["queue_name"], name: "index_solid_queue_pauses_on_queue_name", unique: true
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.bigint "supervisor_id"
    t.integer "pid", null: false
    t.string "hostname"
    t.text "metadata"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["name", "supervisor_id"], name: "index_solid_queue_processes_on_name_and_supervisor_id", unique: true
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    t.index ["priority", "job_id"], name: "index_solid_queue_poll_all"
    t.index ["queue_name", "priority", "job_id"], name: "index_solid_queue_poll_by_queue"
  end

  create_table "solid_queue_recurring_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "task_key", null: false
    t.datetime "run_at", null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
    t.index ["task_key", "run_at"], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
  end

  create_table "solid_queue_recurring_tasks", force: :cascade do |t|
    t.string "key", null: false
    t.string "schedule", null: false
    t.string "command", limit: 2048
    t.string "class_name"
    t.text "arguments"
    t.string "queue_name"
    t.integer "priority", default: 0
    t.boolean "static", default: true, null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    t.index ["static"], name: "index_solid_queue_recurring_tasks_on_static"
  end

  create_table "solid_queue_scheduled_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.datetime "scheduled_at", null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    t.index ["scheduled_at", "priority", "job_id"], name: "index_solid_queue_dispatch_all"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.string "key", null: false
    t.integer "value", default: 1, null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value"
    t.index ["key"], name: "index_solid_queue_semaphores_on_key", unique: true
  end

  create_table "supervisor_checklist_templates", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.string "category"
    t.integer "sequence_order", default: 0
    t.boolean "is_active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "response_type"
    t.index ["category"], name: "index_supervisor_checklist_templates_on_category"
    t.index ["name"], name: "index_supervisor_checklist_templates_on_name", unique: true
    t.index ["sequence_order"], name: "index_supervisor_checklist_templates_on_sequence_order"
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

  create_table "supplier_ratings", force: :cascade do |t|
    t.bigint "contact_id", null: false
    t.bigint "rated_by_user_id", null: false
    t.bigint "construction_id"
    t.bigint "purchase_order_id"
    t.integer "quality_rating"
    t.integer "timeliness_rating"
    t.integer "communication_rating"
    t.integer "professionalism_rating"
    t.integer "value_rating"
    t.decimal "overall_rating", precision: 3, scale: 2
    t.text "positive_feedback"
    t.text "areas_for_improvement"
    t.text "internal_notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["construction_id"], name: "index_supplier_ratings_on_construction_id"
    t.index ["contact_id", "created_at"], name: "index_supplier_ratings_on_contact_id_and_created_at"
    t.index ["contact_id"], name: "index_supplier_ratings_on_contact_id"
    t.index ["purchase_order_id"], name: "index_supplier_ratings_on_purchase_order_id"
    t.index ["rated_by_user_id"], name: "index_supplier_ratings_on_rated_by_user_id"
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
    t.string "slug"
    t.index ["database_table_name"], name: "index_tables_on_database_table_name", unique: true
    t.index ["slug"], name: "index_tables_on_slug", unique: true
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

  create_table "teaching_patterns", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "trinity", force: :cascade do |t|
    t.integer "chapter_number", null: false
    t.string "chapter_name", null: false
    t.string "component"
    t.string "title", null: false
    t.string "status", default: "open"
    t.string "severity", default: "medium"
    t.date "first_reported"
    t.date "last_occurred"
    t.date "fixed_date"
    t.text "scenario"
    t.text "root_cause"
    t.text "solution"
    t.text "prevention"
    t.jsonb "metadata", default: {}
    t.text "search_text"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "entry_type", default: "bug", null: false
    t.text "description"
    t.text "details"
    t.text "examples"
    t.text "recommendations"
    t.string "rule_reference"
    t.string "section_number"
    t.string "difficulty"
    t.text "summary"
    t.text "code_example"
    t.text "common_mistakes"
    t.text "testing_strategy"
    t.text "related_rules"
    t.string "category", null: false
    t.index ["category", "chapter_number"], name: "index_trinity_on_category_and_chapter_number"
    t.index ["category"], name: "index_trinity_on_category"
    t.index ["chapter_number", "entry_type"], name: "index_trinity_on_chapter_number_and_entry_type"
    t.index ["chapter_number", "section_number"], name: "index_trinity_on_chapter_number_and_section_number"
    t.index ["chapter_number", "status"], name: "index_trinity_on_chapter_number_and_status"
    t.index ["chapter_number"], name: "index_trinity_on_chapter_number"
    t.index ["entry_type"], name: "index_trinity_on_entry_type"
    t.index ["search_text"], name: "index_trinity_on_search_text", opclass: :gin_trgm_ops, using: :gin
    t.index ["section_number"], name: "index_trinity_on_section_number"
    t.index ["severity"], name: "index_trinity_on_severity"
    t.index ["status"], name: "index_trinity_on_status"
  end

  create_table "unreal_variables", force: :cascade do |t|
    t.string "variable_name"
    t.decimal "claude_value", precision: 10, scale: 2
    t.boolean "is_active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_9_30_upload_4b12581f", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.string "parenttype"
    t.string "drive_id"
    t.date "folder_id"
    t.string "code"
    t.string "description"
    t.string "unit"
    t.decimal "range_id", precision: 15, scale: 2
    t.string "range"
    t.decimal "rangetype", precision: 15, scale: 2
    t.date "colour_spec_id"
    t.string "colour_spec"
    t.date "colour_spectype"
    t.decimal "tedmodel_id", precision: 15, scale: 2
    t.string "tedmodel"
    t.date "tedmodeltype"
    t.decimal "price", precision: 15, scale: 2
    t.string "default_supplier"
    t.string "brand_linked"
    t.string "budget_zone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_document_tab_3728eb5f", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_document_tab_7a84cd47", force: :cascade do |t|
    t.decimal "budget", precision: 15, scale: 2, default: "0.0"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_document_tab_dd6cfcbf", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_import_1761885699_f0f78b8e7fc2f1fc_78992af1", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.string "parenttype"
    t.string "drive_id"
    t.date "folder_id"
    t.string "code"
    t.string "description"
    t.string "unit"
    t.decimal "range_id", precision: 15, scale: 2
    t.string "range"
    t.decimal "rangetype", precision: 15, scale: 2
    t.date "colour_spec_id"
    t.string "colour_spec"
    t.date "colour_spectype"
    t.decimal "tedmodel_id", precision: 15, scale: 2
    t.string "tedmodel"
    t.date "tedmodeltype"
    t.decimal "price", precision: 15, scale: 2
    t.string "default_supplier"
    t.string "brand_linked"
    t.string "budget_zone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_import_1761885699_f0f78b8e7fc2f1fc_e3560d09", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.string "parenttype"
    t.string "drive_id"
    t.date "folder_id"
    t.string "code"
    t.string "description"
    t.string "unit"
    t.decimal "range_id", precision: 15, scale: 2
    t.string "range"
    t.decimal "rangetype", precision: 15, scale: 2
    t.date "colour_spec_id"
    t.string "colour_spec"
    t.date "colour_spectype"
    t.decimal "tedmodel_id", precision: 15, scale: 2
    t.string "tedmodel"
    t.date "tedmodeltype"
    t.decimal "price", precision: 15, scale: 2
    t.string "default_supplier"
    t.string "brand_linked"
    t.string "budget_zone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_import_1762054183_c576571c2be177ce_c59dc239", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.string "parenttype"
    t.string "drive_id"
    t.date "folder_id"
    t.string "code"
    t.string "description"
    t.string "unit"
    t.decimal "range_id", precision: 15, scale: 2
    t.string "range"
    t.decimal "rangetype", precision: 15, scale: 2
    t.date "colour_spec_id"
    t.string "colour_spec"
    t.date "colour_spectype"
    t.decimal "tedmodel_id", precision: 15, scale: 2
    t.string "tedmodel"
    t.date "tedmodeltype"
    t.decimal "price", precision: 15, scale: 2
    t.string "default_supplier"
    t.string "brand_linked"
    t.string "budget_zone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_import_1762055288_0481fe89c8986d83_77240a42", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.string "parenttype"
    t.string "drive_id"
    t.date "folder_id"
    t.datetime "start_date"
    t.string "title"
    t.string "ba_approval_no"
    t.string "ba_received_date"
    t.string "covenant_approval_received"
    t.string "plumbing_permit_no"
    t.string "ted_number"
    t.boolean "locked"
    t.decimal "contract_value", precision: 15, scale: 2
    t.decimal "live_profit", precision: 15, scale: 2
    t.decimal "live", precision: 15, scale: 2
    t.string "status"
    t.decimal "certifier_job_no", precision: 15, scale: 2
    t.decimal "xero_total_invoices_ex_gst", precision: 15, scale: 2
    t.decimal "total_expenses_ex_gst", precision: 15, scale: 2
    t.boolean "xenna_lock"
    t.boolean "is_kitchen"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_import_1762056023_72d2ca00717e243d_deed2265", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.string "parenttype"
    t.string "drive_id"
    t.date "folder_id"
    t.datetime "start_date"
    t.string "title"
    t.string "ba_approval_no"
    t.string "ba_received_date"
    t.string "covenant_approval_received"
    t.string "plumbing_permit_no"
    t.string "ted_number"
    t.boolean "locked"
    t.decimal "contract_value", precision: 15, scale: 2
    t.decimal "live_profit", precision: 15, scale: 2
    t.decimal "live", precision: 15, scale: 2
    t.string "status"
    t.decimal "certifier_job_no", precision: 15, scale: 2
    t.decimal "xero_total_invoices_ex_gst", precision: 15, scale: 2
    t.decimal "total_expenses_ex_gst", precision: 15, scale: 2
    t.boolean "xenna_lock"
    t.boolean "is_kitchen"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_import_1762056365_8affa6c58b11050f_ab07b46b", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.string "parenttype"
    t.string "drive_id"
    t.date "folder_id"
    t.datetime "start_date"
    t.string "title"
    t.string "ba_approval_no"
    t.string "ba_received_date"
    t.string "covenant_approval_received"
    t.string "plumbing_permit_no"
    t.string "ted_number"
    t.boolean "locked"
    t.decimal "contract_value", precision: 15, scale: 2
    t.decimal "live_profit", precision: 15, scale: 2
    t.decimal "live", precision: 15, scale: 2
    t.string "status"
    t.decimal "certifier_job_no", precision: 15, scale: 2
    t.decimal "xero_total_invoices_ex_gst", precision: 15, scale: 2
    t.decimal "total_expenses_ex_gst", precision: 15, scale: 2
    t.boolean "xenna_lock"
    t.boolean "is_kitchen"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_import_1762056499_7562a44878bae0dd_dc223e1a", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.string "parenttype"
    t.string "drive_id"
    t.date "folder_id"
    t.datetime "start_date"
    t.string "title"
    t.string "ba_approval_no"
    t.string "ba_received_date"
    t.string "covenant_approval_received"
    t.string "plumbing_permit_no"
    t.string "ted_number"
    t.boolean "locked"
    t.decimal "contract_value", precision: 15, scale: 2
    t.decimal "live_profit", precision: 15, scale: 2
    t.decimal "live", precision: 15, scale: 2
    t.string "status"
    t.decimal "certifier_job_no", precision: 15, scale: 2
    t.decimal "xero_total_invoices_ex_gst", precision: 15, scale: 2
    t.decimal "total_expenses_ex_gst", precision: 15, scale: 2
    t.boolean "xenna_lock"
    t.boolean "is_kitchen"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_import_1762059420_a11f2f8f92defc9a_d30f6065", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.string "parenttype"
    t.string "drive_id"
    t.date "folder_id"
    t.string "code"
    t.string "description"
    t.string "unit"
    t.decimal "range_id", precision: 15, scale: 2
    t.string "range"
    t.decimal "rangetype", precision: 15, scale: 2
    t.date "colour_spec_id"
    t.string "colour_spec"
    t.date "colour_spectype"
    t.decimal "tedmodel_id", precision: 15, scale: 2
    t.string "tedmodel"
    t.date "tedmodeltype"
    t.decimal "price", precision: 15, scale: 2
    t.string "default_supplier"
    t.string "brand_linked"
    t.string "budget_zone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_import_1762060168_19920751913157a9_6fcf00a3", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.string "parenttype"
    t.string "drive_id"
    t.date "folder_id"
    t.string "code"
    t.string "description"
    t.string "unit"
    t.decimal "range_id", precision: 15, scale: 2
    t.string "range"
    t.decimal "rangetype", precision: 15, scale: 2
    t.date "colour_spec_id"
    t.string "colour_spec"
    t.date "colour_spectype"
    t.decimal "tedmodel_id", precision: 15, scale: 2
    t.string "tedmodel"
    t.date "tedmodeltype"
    t.decimal "price", precision: 15, scale: 2
    t.string "default_supplier"
    t.string "brand_linked"
    t.string "budget_zone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_import_1762125311_b06c355ec069b654_2f8eb576", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.string "parenttype"
    t.string "drive_id"
    t.date "folder_id"
    t.datetime "start_date"
    t.string "title"
    t.string "ba_approval_no"
    t.string "ba_received_date"
    t.string "covenant_approval_received"
    t.string "plumbing_permit_no"
    t.string "ted_number"
    t.boolean "locked"
    t.decimal "contract_value", precision: 15, scale: 2
    t.decimal "live_profit", precision: 15, scale: 2
    t.decimal "live", precision: 15, scale: 2
    t.string "status"
    t.decimal "certifier_job_no", precision: 15, scale: 2
    t.decimal "xero_total_invoices_ex_gst", precision: 15, scale: 2
    t.decimal "total_expenses_ex_gst", precision: 15, scale: 2
    t.boolean "xenna_lock"
    t.boolean "is_kitchen"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_import_1762125512_3346546a6ffb8b8b_2afd6efb", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.string "parenttype"
    t.string "drive_id"
    t.date "folder_id"
    t.string "code"
    t.string "description"
    t.string "unit"
    t.decimal "range_id", precision: 15, scale: 2
    t.string "range"
    t.decimal "rangetype", precision: 15, scale: 2
    t.date "colour_spec_id"
    t.string "colour_spec"
    t.date "colour_spectype"
    t.decimal "tedmodel_id", precision: 15, scale: 2
    t.string "tedmodel"
    t.date "tedmodeltype"
    t.decimal "price", precision: 15, scale: 2
    t.string "default_supplier"
    t.string "brand_linked"
    t.string "budget_zone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_import_1762125782_81846cbb9a44cbce_a99dc734", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.string "parenttype"
    t.string "drive_id"
    t.date "folder_id"
    t.datetime "start_date"
    t.string "title"
    t.string "ba_approval_no"
    t.string "ba_received_date"
    t.string "covenant_approval_received"
    t.string "plumbing_permit_no"
    t.string "ted_number"
    t.boolean "locked"
    t.decimal "contract_value", precision: 15, scale: 2
    t.decimal "live_profit", precision: 15, scale: 2
    t.decimal "live", precision: 15, scale: 2
    t.string "status"
    t.decimal "certifier_job_no", precision: 15, scale: 2
    t.decimal "xero_total_invoices_ex_gst", precision: 15, scale: 2
    t.decimal "total_expenses_ex_gst", precision: 15, scale: 2
    t.boolean "xenna_lock"
    t.boolean "is_kitchen"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_import_1762126561_e200f5e7e0826b1e_new_558a778c", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.decimal "parenttype", precision: 15, scale: 2
    t.string "drive_id"
    t.date "folder_id"
    t.string "code"
    t.string "description"
    t.string "unit"
    t.decimal "range_id", precision: 15, scale: 2
    t.string "range"
    t.decimal "rangetype", precision: 15, scale: 2
    t.date "colour_spec_id"
    t.string "colour_spec"
    t.date "colour_spectype"
    t.decimal "tedmodel_id", precision: 15, scale: 2
    t.string "tedmodel"
    t.date "tedmodeltype"
    t.decimal "price", precision: 15, scale: 2
    t.string "default_supplier"
    t.string "brand_linked"
    t.string "budget_zone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_import_1762157582_8e8e2d2b69a47e74_4b7d5585", force: :cascade do |t|
    t.string "item_code"
    t.string "item_name"
    t.string "category"
    t.string "unit_of_measure"
    t.decimal "current_price", precision: 15, scale: 2
    t.string "supplier_name"
    t.string "brand"
    t.string "notes"
    t.date "last_updated"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_import_1762215941_806ddfcf23a9a9f4_b7b8c8ac", force: :cascade do |t|
    t.decimal "price", precision: 15, scale: 2
    t.date "effective_date"
    t.string "display_field"
    t.string "pricebook_id"
    t.string "pricebook"
    t.string "pricebooktype"
    t.boolean "default_supplier"
    t.string "supplier_trade_id"
    t.string "supplier_trade"
    t.string "product_id"
    t.string "contact_region"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_jakes_new_test_0e0f1d21", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "phone"
    t.string "status"
    t.date "created_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_newimport_93f20d2d", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.string "parenttype"
    t.string "drive_id"
    t.date "folder_id"
    t.datetime "start_date"
    t.string "title"
    t.string "ba_approval_no"
    t.string "ba_received_date"
    t.string "covenant_approval_received"
    t.string "plumbing_permit_no"
    t.string "ted_number"
    t.boolean "locked"
    t.decimal "contract_value", precision: 15, scale: 2
    t.decimal "live_profit", precision: 15, scale: 2
    t.decimal "live", precision: 15, scale: 2
    t.string "status"
    t.decimal "certifier_job_no", precision: 15, scale: 2
    t.decimal "xero_total_invoices_ex_gst", precision: 15, scale: 2
    t.decimal "total_expenses_ex_gst", precision: 15, scale: 2
    t.boolean "xenna_lock"
    t.boolean "is_kitchen"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_price_book_705651a0", force: :cascade do |t|
    t.string "name", default: "0"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_pricinggggg_c9716c90", force: :cascade do |t|
    t.date "sys_type_id"
    t.string "deleted"
    t.string "parent_id"
    t.string "parent"
    t.string "parenttype"
    t.string "drive_id"
    t.date "folder_id"
    t.string "code"
    t.string "description"
    t.string "unit"
    t.decimal "range_id", precision: 15, scale: 2
    t.string "range"
    t.decimal "rangetype", precision: 15, scale: 2
    t.date "colour_spec_id"
    t.string "colour_spec"
    t.date "colour_spectype"
    t.decimal "tedmodel_id", precision: 15, scale: 2
    t.string "tedmodel"
    t.date "tedmodeltype"
    t.decimal "price", precision: 15, scale: 2
    t.string "default_supplier"
    t.string "brand_linked"
    t.string "budget_zone"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_testing_table_9297d36e", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_untitled_table_3b80ee42", force: :cascade do |t|
    t.string "address"
    t.decimal "contract_price", precision: 15, scale: 2
    t.string "test_phone2"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_untitled_table_61d507e5", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "phone"
    t.string "status"
    t.date "created_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "password_digest"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role", default: "user", null: false
    t.datetime "last_chat_read_at"
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.string "assigned_role"
    t.datetime "last_login_at"
    t.string "mobile_phone"
    t.string "provider"
    t.string "uid"
    t.text "oauth_token"
    t.datetime "oauth_expires_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["role"], name: "index_users_on_role"
  end

  create_table "versions", force: :cascade do |t|
    t.integer "current_version", default: 101, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "workflow_definitions", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.string "workflow_type", null: false
    t.jsonb "config", default: {}, null: false
    t.boolean "active", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_workflow_definitions_on_active"
    t.index ["workflow_type"], name: "index_workflow_definitions_on_workflow_type"
  end

  create_table "workflow_instances", force: :cascade do |t|
    t.bigint "workflow_definition_id", null: false
    t.string "subject_type", null: false
    t.bigint "subject_id", null: false
    t.string "status", default: "pending", null: false
    t.string "current_step"
    t.datetime "started_at"
    t.datetime "completed_at"
    t.jsonb "metadata", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["status"], name: "index_workflow_instances_on_status"
    t.index ["subject_type", "subject_id"], name: "index_workflow_instances_on_subject"
    t.index ["subject_type", "subject_id"], name: "index_workflow_instances_on_subject_type_and_subject_id"
    t.index ["workflow_definition_id"], name: "index_workflow_instances_on_workflow_definition_id"
  end

  create_table "workflow_steps", force: :cascade do |t|
    t.bigint "workflow_instance_id", null: false
    t.string "step_name", null: false
    t.string "status", default: "pending", null: false
    t.string "assigned_to_type"
    t.bigint "assigned_to_id"
    t.datetime "started_at"
    t.datetime "completed_at"
    t.jsonb "data", default: {}
    t.text "comment"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["assigned_to_type", "assigned_to_id"], name: "index_workflow_steps_on_assigned_to"
    t.index ["assigned_to_type", "assigned_to_id"], name: "index_workflow_steps_on_assigned_to_type_and_assigned_to_id"
    t.index ["status"], name: "index_workflow_steps_on_status"
    t.index ["workflow_instance_id"], name: "index_workflow_steps_on_workflow_instance_id"
  end

  create_table "xero_accounts", force: :cascade do |t|
    t.string "code", null: false
    t.string "name", null: false
    t.string "account_type"
    t.string "tax_type"
    t.text "description"
    t.boolean "active", default: true
    t.string "account_class"
    t.boolean "system_account", default: false
    t.boolean "enable_payments_to_account", default: false
    t.boolean "show_in_expense_claims", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_type"], name: "index_xero_accounts_on_account_type"
    t.index ["active"], name: "index_xero_accounts_on_active"
    t.index ["code"], name: "index_xero_accounts_on_code", unique: true
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

  create_table "xero_tax_rates", force: :cascade do |t|
    t.string "code"
    t.string "name"
    t.decimal "rate"
    t.boolean "active"
    t.string "display_rate"
    t.string "tax_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "chat_messages", "constructions"
  add_foreign_key "chat_messages", "projects"
  add_foreign_key "chat_messages", "users"
  add_foreign_key "columns", "tables"
  add_foreign_key "construction_contacts", "constructions"
  add_foreign_key "construction_contacts", "contacts"
  add_foreign_key "construction_documentation_tabs", "constructions"
  add_foreign_key "constructions", "designs"
  add_foreign_key "contact_activities", "contacts"
  add_foreign_key "contact_addresses", "contacts"
  add_foreign_key "contact_group_memberships", "contact_groups"
  add_foreign_key "contact_group_memberships", "contacts"
  add_foreign_key "contact_persons", "contacts"
  add_foreign_key "contact_relationships", "contacts", column: "related_contact_id"
  add_foreign_key "contact_relationships", "contacts", column: "source_contact_id"
  add_foreign_key "document_tasks", "constructions"
  add_foreign_key "emails", "constructions"
  add_foreign_key "estimate_line_items", "estimates"
  add_foreign_key "estimate_reviews", "estimates"
  add_foreign_key "estimates", "constructions"
  add_foreign_key "folder_template_items", "folder_template_items", column: "parent_id"
  add_foreign_key "folder_template_items", "folder_templates"
  add_foreign_key "folder_templates", "users", column: "created_by_id"
  add_foreign_key "grok_plans", "users"
  add_foreign_key "maintenance_requests", "constructions"
  add_foreign_key "maintenance_requests", "contacts", column: "supplier_contact_id"
  add_foreign_key "maintenance_requests", "purchase_orders"
  add_foreign_key "maintenance_requests", "users", column: "reported_by_user_id"
  add_foreign_key "one_drive_credentials", "constructions"
  add_foreign_key "organization_one_drive_credentials", "users", column: "connected_by_id"
  add_foreign_key "outlook_credentials", "users"
  add_foreign_key "payments", "purchase_orders"
  add_foreign_key "payments", "users", column: "created_by_id"
  add_foreign_key "portal_access_logs", "portal_users"
  add_foreign_key "portal_users", "contacts"
  add_foreign_key "price_histories", "contacts", column: "supplier_id", name: "fk_rails_price_histories_contact"
  add_foreign_key "price_histories", "pricebook_items"
  add_foreign_key "pricebook_items", "contacts", column: "default_supplier_id", name: "fk_rails_pricebook_items_default_supplier"
  add_foreign_key "pricebook_items", "contacts", column: "supplier_id", name: "fk_rails_pricebook_items_contact"
  add_foreign_key "project_task_checklist_items", "project_tasks"
  add_foreign_key "project_tasks", "project_tasks", column: "parent_task_id"
  add_foreign_key "project_tasks", "projects"
  add_foreign_key "project_tasks", "purchase_orders"
  add_foreign_key "project_tasks", "schedule_template_rows"
  add_foreign_key "project_tasks", "task_templates"
  add_foreign_key "project_tasks", "users", column: "assigned_to_id"
  add_foreign_key "project_tasks", "users", column: "supervisor_checked_by_id"
  add_foreign_key "projects", "constructions"
  add_foreign_key "projects", "users", column: "project_manager_id"
  add_foreign_key "purchase_order_documents", "document_tasks"
  add_foreign_key "purchase_order_documents", "purchase_orders"
  add_foreign_key "purchase_order_line_items", "pricebook_items"
  add_foreign_key "purchase_order_line_items", "purchase_orders"
  add_foreign_key "purchase_orders", "constructions"
  add_foreign_key "purchase_orders", "contacts", column: "supplier_id", name: "fk_rails_purchase_orders_contact"
  add_foreign_key "purchase_orders", "estimates"
  add_foreign_key "rain_logs", "constructions"
  add_foreign_key "rain_logs", "users", column: "created_by_user_id"
  add_foreign_key "schedule_task_checklist_items", "schedule_tasks"
  add_foreign_key "schedule_tasks", "constructions"
  add_foreign_key "schedule_tasks", "purchase_orders"
  add_foreign_key "schedule_template_row_audits", "schedule_template_rows"
  add_foreign_key "schedule_template_row_audits", "users"
  add_foreign_key "schedule_template_rows", "schedule_templates"
  add_foreign_key "schedule_template_rows", "suppliers"
  add_foreign_key "schedule_templates", "users", column: "created_by_id"
  add_foreign_key "sms_messages", "contacts"
  add_foreign_key "sms_messages", "users"
  add_foreign_key "solid_queue_blocked_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_claimed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_failed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_recurring_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_scheduled_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "supplier_contacts", "contacts"
  add_foreign_key "supplier_contacts", "suppliers"
  add_foreign_key "supplier_ratings", "constructions"
  add_foreign_key "supplier_ratings", "contacts"
  add_foreign_key "supplier_ratings", "purchase_orders"
  add_foreign_key "supplier_ratings", "users", column: "rated_by_user_id"
  add_foreign_key "task_dependencies", "project_tasks", column: "predecessor_task_id"
  add_foreign_key "task_dependencies", "project_tasks", column: "successor_task_id"
  add_foreign_key "task_updates", "project_tasks"
  add_foreign_key "task_updates", "users"
  add_foreign_key "workflow_instances", "workflow_definitions"
  add_foreign_key "workflow_steps", "workflow_instances"
end
