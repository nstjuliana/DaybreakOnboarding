# frozen_string_literal: true

##
# CreateClinicians Migration
#
# Creates the clinicians table for therapist/counselor profiles.
# Used for matching users with appropriate mental health providers.
#
# @see Clinician model
# @see _docs/user-flow.md Phase 3D: Clinician Matching
#
class CreateClinicians < ActiveRecord::Migration[8.0]
  def change
    create_table :clinicians, id: :uuid do |t|
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :credentials
      t.text :bio
      t.string :photo_url
      t.string :video_url
      t.string :email
      t.string :phone

      ## Specialties and availability
      t.string :specialties, array: true, default: []
      t.jsonb :availability, default: {}

      ## Status
      t.string :status, null: false, default: 'active'

      ## Soft delete support
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :clinicians, :status
    add_index :clinicians, :specialties, using: :gin
    add_index :clinicians, :discarded_at
  end
end

