# frozen_string_literal: true

##
# CreateAssessments Migration
#
# Creates the assessments table for storing screening questionnaire
# responses and results from the onboarding flow.
#
# Uses JSONB columns for flexible screener responses and AI-generated results.
#
# @see Assessment model
# @see _docs/user-flow.md Phase 2: Holistic Intake
#
class CreateAssessments < ActiveRecord::Migration[8.0]
  def change
    create_table :assessments, id: :uuid do |t|
      t.references :user, type: :uuid, foreign_key: true

      ## Assessment type and status
      t.string :screener_type, null: false, default: 'psc17'
      t.string :status, null: false, default: 'pending'

      ## Flexible storage for screener responses and results
      t.jsonb :responses, default: {}
      t.jsonb :results, default: {}

      ## Scoring
      t.integer :score
      t.string :severity

      ## Timestamps
      t.datetime :started_at
      t.datetime :completed_at

      ## Soft delete support
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :assessments, :status
    add_index :assessments, :screener_type
    add_index :assessments, :responses, using: :gin
    add_index :assessments, :discarded_at
    add_index :assessments, %i[user_id created_at]
  end
end

