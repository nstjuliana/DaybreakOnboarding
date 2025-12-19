# frozen_string_literal: true

##
# Migration: Create Patients Table
#
# Stores patient/child information for the onboarding flow.
# Linked to users (parents/guardians) who create the account.
#
# @see Patient model
# @see _docs/phases/phase-3-insurance-matching.md
#
class CreatePatients < ActiveRecord::Migration[8.0]
  def change
    create_table :patients, id: :uuid do |t|
      t.references :user, type: :uuid, foreign_key: true, null: false

      # Patient demographics
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.date :date_of_birth
      t.string :gender
      t.string :pronouns
      t.string :preferred_name

      # Contact info (for minors who can be contacted directly)
      t.string :email
      t.string :phone

      # Additional info
      t.string :school
      t.string :grade

      # Address
      t.string :address_line1
      t.string :address_line2
      t.string :city
      t.string :state
      t.string :zip_code

      # Emergency contact
      t.string :emergency_contact_name
      t.string :emergency_contact_relationship
      t.string :emergency_contact_phone

      # For self-seeking minors, this links to parent involvement
      t.uuid :parent_user_id

      # Additional metadata
      t.jsonb :metadata, default: {}

      # Soft delete
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :patients, :discarded_at
    add_index :patients, [:user_id, :created_at]
    add_index :patients, :parent_user_id
  end
end


