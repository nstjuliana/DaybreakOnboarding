# frozen_string_literal: true

##
# CreateAppointments Migration
#
# Creates the appointments table for scheduling sessions
# between users and matched clinicians.
#
# @see Appointment model
# @see _docs/user-flow.md Phase 4: Commitment (Care)
#
class CreateAppointments < ActiveRecord::Migration[8.0]
  def change
    create_table :appointments, id: :uuid do |t|
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.references :clinician, type: :uuid, null: false, foreign_key: true
      t.references :assessment, type: :uuid, foreign_key: true

      ## Scheduling
      t.datetime :scheduled_at, null: false
      t.integer :duration_minutes, default: 50
      t.string :session_type, null: false, default: 'initial'
      t.string :status, null: false, default: 'scheduled'

      ## Telehealth
      t.string :telehealth_url
      t.jsonb :metadata, default: {}

      ## Notes (encrypted in production)
      t.text :notes

      ## Timestamps
      t.datetime :confirmed_at
      t.datetime :cancelled_at
      t.string :cancellation_reason

      ## Soft delete support
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :appointments, :status
    add_index :appointments, :scheduled_at
    add_index :appointments, :session_type
    add_index :appointments, :discarded_at
    add_index :appointments, %i[clinician_id scheduled_at]
    add_index :appointments, %i[user_id scheduled_at]
  end
end

