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

ActiveRecord::Schema[8.1].define(version: 2024_12_19_000008) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "active_storage_attachments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.uuid "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "appointments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "assessment_id"
    t.string "cancellation_reason"
    t.datetime "cancelled_at"
    t.uuid "clinician_id", null: false
    t.datetime "confirmed_at"
    t.datetime "created_at", null: false
    t.datetime "discarded_at"
    t.integer "duration_minutes", default: 50
    t.jsonb "metadata", default: {}
    t.text "notes"
    t.datetime "scheduled_at", null: false
    t.string "session_type", default: "initial", null: false
    t.string "status", default: "scheduled", null: false
    t.string "telehealth_url"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["assessment_id"], name: "index_appointments_on_assessment_id"
    t.index ["clinician_id", "scheduled_at"], name: "index_appointments_on_clinician_id_and_scheduled_at"
    t.index ["clinician_id"], name: "index_appointments_on_clinician_id"
    t.index ["discarded_at"], name: "index_appointments_on_discarded_at"
    t.index ["scheduled_at"], name: "index_appointments_on_scheduled_at"
    t.index ["session_type"], name: "index_appointments_on_session_type"
    t.index ["status"], name: "index_appointments_on_status"
    t.index ["user_id", "scheduled_at"], name: "index_appointments_on_user_id_and_scheduled_at"
    t.index ["user_id"], name: "index_appointments_on_user_id"
  end

  create_table "assessments", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "discarded_at"
    t.jsonb "responses", default: {}
    t.jsonb "results", default: {}
    t.integer "score"
    t.string "screener_type", default: "psc17", null: false
    t.string "severity"
    t.datetime "started_at"
    t.string "status", default: "pending", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id"
    t.index ["discarded_at"], name: "index_assessments_on_discarded_at"
    t.index ["responses"], name: "index_assessments_on_responses", using: :gin
    t.index ["screener_type"], name: "index_assessments_on_screener_type"
    t.index ["status"], name: "index_assessments_on_status"
    t.index ["user_id", "created_at"], name: "index_assessments_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_assessments_on_user_id"
  end

  create_table "clinicians", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "accepted_insurances", default: [], array: true
    t.boolean "accepts_self_pay", default: true, null: false
    t.jsonb "availability", default: {}
    t.text "bio"
    t.datetime "created_at", null: false
    t.string "credentials"
    t.datetime "discarded_at"
    t.string "email"
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.boolean "offers_sliding_scale", default: false, null: false
    t.string "phone"
    t.string "photo_url"
    t.string "specialties", default: [], array: true
    t.string "status", default: "active", null: false
    t.datetime "updated_at", null: false
    t.string "video_url"
    t.index ["accepted_insurances"], name: "index_clinicians_on_accepted_insurances", using: :gin
    t.index ["accepts_self_pay"], name: "index_clinicians_on_accepts_self_pay"
    t.index ["discarded_at"], name: "index_clinicians_on_discarded_at"
    t.index ["offers_sliding_scale"], name: "index_clinicians_on_offers_sliding_scale"
    t.index ["specialties"], name: "index_clinicians_on_specialties", using: :gin
    t.index ["status"], name: "index_clinicians_on_status"
  end

  create_table "conversations", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "assessment_id", null: false
    t.datetime "created_at", null: false
    t.string "current_question_id"
    t.datetime "discarded_at"
    t.jsonb "metadata", default: {}
    t.integer "questions_completed", default: 0
    t.string "screener_type", default: "psc17", null: false
    t.string "status", default: "active", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["assessment_id"], name: "index_conversations_on_assessment_id"
    t.index ["discarded_at"], name: "index_conversations_on_discarded_at"
    t.index ["screener_type"], name: "index_conversations_on_screener_type"
    t.index ["status"], name: "index_conversations_on_status"
    t.index ["user_id", "created_at"], name: "index_conversations_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_conversations_on_user_id"
  end

  create_table "crisis_events", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.jsonb "context", default: {}
    t.uuid "conversation_id", null: false
    t.datetime "created_at", null: false
    t.string "detection_method", default: "keyword"
    t.jsonb "matched_keywords", default: []
    t.uuid "message_id"
    t.text "resolution_notes"
    t.datetime "resolved_at"
    t.string "resolved_by"
    t.boolean "reviewed", default: false
    t.datetime "reviewed_at"
    t.string "reviewed_by"
    t.string "risk_level", null: false
    t.boolean "safety_pivot_shown", default: false
    t.text "trigger_content", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.string "user_response"
    t.index ["conversation_id"], name: "index_crisis_events_on_conversation_id"
    t.index ["detection_method"], name: "index_crisis_events_on_detection_method"
    t.index ["message_id"], name: "index_crisis_events_on_message_id"
    t.index ["resolved_at"], name: "index_crisis_events_on_resolved_at"
    t.index ["reviewed"], name: "index_crisis_events_on_reviewed"
    t.index ["risk_level", "reviewed"], name: "index_crisis_events_on_risk_level_and_reviewed"
    t.index ["risk_level"], name: "index_crisis_events_on_risk_level"
    t.index ["safety_pivot_shown"], name: "index_crisis_events_on_safety_pivot_shown"
    t.index ["user_id", "created_at"], name: "index_crisis_events_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_crisis_events_on_user_id"
  end

  create_table "insurance_cards", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "discarded_at"
    t.float "extraction_confidence"
    t.string "group_number"
    t.string "member_id"
    t.string "payment_method", null: false
    t.string "plan_name"
    t.date "policyholder_dob"
    t.string "policyholder_name"
    t.string "provider"
    t.jsonb "raw_extraction", default: {}
    t.string "relationship_to_patient"
    t.string "status", default: "pending", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.index ["discarded_at"], name: "index_insurance_cards_on_discarded_at"
    t.index ["payment_method"], name: "index_insurance_cards_on_payment_method"
    t.index ["status"], name: "index_insurance_cards_on_status"
    t.index ["user_id", "created_at"], name: "index_insurance_cards_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_insurance_cards_on_user_id"
  end

  create_table "jwt_denylist", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "exp", null: false
    t.string "jti", null: false
    t.datetime "updated_at", null: false
    t.index ["jti"], name: "index_jwt_denylist_on_jti", unique: true
  end

  create_table "messages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.text "content", null: false
    t.uuid "conversation_id", null: false
    t.datetime "created_at", null: false
    t.jsonb "crisis_flags", default: {}
    t.datetime "discarded_at"
    t.jsonb "extracted_response", default: {}
    t.string "processing_status", default: "complete"
    t.string "risk_level", default: "none"
    t.string "role", default: "user", null: false
    t.string "sender", null: false
    t.integer "sequence_number", null: false
    t.datetime "updated_at", null: false
    t.index ["conversation_id", "sequence_number"], name: "index_messages_on_conversation_id_and_sequence_number"
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["crisis_flags"], name: "index_messages_on_crisis_flags", using: :gin
    t.index ["discarded_at"], name: "index_messages_on_discarded_at"
    t.index ["extracted_response"], name: "index_messages_on_extracted_response", using: :gin
    t.index ["processing_status"], name: "index_messages_on_processing_status"
    t.index ["risk_level"], name: "index_messages_on_risk_level"
    t.index ["role"], name: "index_messages_on_role"
    t.index ["sender"], name: "index_messages_on_sender"
  end

  create_table "patients", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "address_line1"
    t.string "address_line2"
    t.string "city"
    t.datetime "created_at", null: false
    t.date "date_of_birth"
    t.datetime "discarded_at"
    t.string "email"
    t.string "emergency_contact_name"
    t.string "emergency_contact_phone"
    t.string "emergency_contact_relationship"
    t.string "first_name", null: false
    t.string "gender"
    t.string "grade"
    t.string "last_name", null: false
    t.jsonb "metadata", default: {}
    t.uuid "parent_user_id"
    t.string "phone"
    t.string "preferred_name"
    t.string "pronouns"
    t.string "school"
    t.string "state"
    t.datetime "updated_at", null: false
    t.uuid "user_id", null: false
    t.string "zip_code"
    t.index ["discarded_at"], name: "index_patients_on_discarded_at"
    t.index ["parent_user_id"], name: "index_patients_on_parent_user_id"
    t.index ["user_id", "created_at"], name: "index_patients_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_patients_on_user_id"
  end

  create_table "screener_responses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.integer "clarification_attempts", default: 0
    t.float "confidence", default: 0.0
    t.uuid "conversation_id", null: false
    t.datetime "created_at", null: false
    t.integer "extracted_value"
    t.jsonb "extraction_metadata", default: {}
    t.uuid "message_id", null: false
    t.string "question_id", null: false
    t.text "response_text", null: false
    t.datetime "updated_at", null: false
    t.boolean "verified", default: false
    t.index ["confidence"], name: "index_screener_responses_on_confidence"
    t.index ["conversation_id", "question_id"], name: "index_screener_responses_on_conversation_id_and_question_id", unique: true
    t.index ["conversation_id"], name: "index_screener_responses_on_conversation_id"
    t.index ["message_id"], name: "index_screener_responses_on_message_id"
    t.index ["question_id"], name: "index_screener_responses_on_question_id"
    t.index ["verified"], name: "index_screener_responses_on_verified"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.datetime "confirmation_sent_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "created_at", null: false
    t.datetime "current_sign_in_at"
    t.string "current_sign_in_ip"
    t.date "date_of_birth"
    t.datetime "discarded_at"
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.integer "failed_attempts", default: 0, null: false
    t.string "first_name"
    t.string "last_name"
    t.datetime "last_sign_in_at"
    t.string "last_sign_in_ip"
    t.datetime "locked_at"
    t.string "phone"
    t.jsonb "profile", default: {}
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.integer "sign_in_count", default: 0, null: false
    t.string "unconfirmed_email"
    t.string "unlock_token"
    t.datetime "updated_at", null: false
    t.string "user_type", default: "parent", null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["discarded_at"], name: "index_users_on_discarded_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["unlock_token"], name: "index_users_on_unlock_token", unique: true
    t.index ["user_type"], name: "index_users_on_user_type"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "appointments", "assessments"
  add_foreign_key "appointments", "clinicians"
  add_foreign_key "appointments", "users"
  add_foreign_key "assessments", "users"
  add_foreign_key "conversations", "assessments"
  add_foreign_key "conversations", "users"
  add_foreign_key "crisis_events", "conversations"
  add_foreign_key "crisis_events", "messages"
  add_foreign_key "crisis_events", "users"
  add_foreign_key "insurance_cards", "users"
  add_foreign_key "messages", "conversations"
  add_foreign_key "patients", "users"
  add_foreign_key "screener_responses", "conversations"
  add_foreign_key "screener_responses", "messages"
end
