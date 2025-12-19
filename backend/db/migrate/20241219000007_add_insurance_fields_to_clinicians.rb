# frozen_string_literal: true

##
# AddInsuranceFieldsToClinicians Migration
#
# Adds insurance acceptance fields to clinicians table.
# Enables filtering clinicians by insurance coverage during matching.
#
# @see Clinician model
# @see _docs/user-flow.md Phase 3D: Clinician Matching
#
class AddInsuranceFieldsToClinicians < ActiveRecord::Migration[8.0]
  def change
    # Array of accepted insurance providers
    add_column :clinicians, :accepted_insurances, :string, array: true, default: []

    # Whether clinician accepts self-pay/uninsured patients
    add_column :clinicians, :accepts_self_pay, :boolean, default: true, null: false

    # Whether clinician offers sliding scale fees
    add_column :clinicians, :offers_sliding_scale, :boolean, default: false, null: false

    # Add GIN index for fast array lookups
    add_index :clinicians, :accepted_insurances, using: :gin
    add_index :clinicians, :accepts_self_pay
    add_index :clinicians, :offers_sliding_scale
  end
end

