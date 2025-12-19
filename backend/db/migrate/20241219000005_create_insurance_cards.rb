# frozen_string_literal: true

##
# Migration: Create Insurance Cards Table
#
# Stores insurance card information captured via OCR or manual entry.
# Supports image attachments via Active Storage.
#
# @see InsuranceCard model
# @see _docs/phases/phase-3-insurance-matching.md
#
class CreateInsuranceCards < ActiveRecord::Migration[8.0]
  def change
    create_table :insurance_cards, id: :uuid do |t|
      t.references :user, type: :uuid, foreign_key: true, null: false

      # Insurance provider details
      t.string :provider
      t.string :member_id
      t.string :group_number
      t.string :plan_name

      # Policyholder information
      t.string :policyholder_name
      t.date :policyholder_dob
      t.string :relationship_to_patient

      # Processing status
      t.string :status, default: 'pending', null: false

      # Payment method selection
      t.string :payment_method, null: false # 'insurance', 'self_pay', 'no_insurance'

      # OCR extraction data
      t.jsonb :raw_extraction, default: {}
      t.float :extraction_confidence

      # For soft deletes
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :insurance_cards, :status
    add_index :insurance_cards, :payment_method
    add_index :insurance_cards, :discarded_at
    add_index :insurance_cards, [:user_id, :created_at]
  end
end

