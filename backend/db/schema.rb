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

ActiveRecord::Schema[8.1].define(version: 2024_12_18_000005) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

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
    t.jsonb "availability", default: {}
    t.text "bio"
    t.datetime "created_at", null: false
    t.string "credentials"
    t.datetime "discarded_at"
    t.string "email"
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "phone"
    t.string "photo_url"
    t.string "specialties", default: [], array: true
    t.string "status", default: "active", null: false
    t.datetime "updated_at", null: false
    t.string "video_url"
    t.index ["discarded_at"], name: "index_clinicians_on_discarded_at"
    t.index ["specialties"], name: "index_clinicians_on_specialties", using: :gin
    t.index ["status"], name: "index_clinicians_on_status"
  end

  create_table "jwt_denylist", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "exp", null: false
    t.string "jti", null: false
    t.datetime "updated_at", null: false
    t.index ["jti"], name: "index_jwt_denylist_on_jti", unique: true
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

  add_foreign_key "appointments", "assessments"
  add_foreign_key "appointments", "clinicians"
  add_foreign_key "appointments", "users"
  add_foreign_key "assessments", "users"
end
