# frozen_string_literal: true

##
# Migration: Create Crisis Events Table
#
# Logs crisis detection events for clinical review.
# Tracks risk levels, triggers, and resolution status.
#
# @see CrisisEvent model
#
class CreateCrisisEvents < ActiveRecord::Migration[8.0]
  def change
    create_table :crisis_events, id: :uuid do |t|
      t.references :conversation, type: :uuid, foreign_key: true, null: false
      t.references :message, type: :uuid, foreign_key: true
      t.references :user, type: :uuid, foreign_key: true, null: false

      # Risk level: low, medium, high, critical
      t.string :risk_level, null: false

      # The content that triggered the crisis detection
      t.text :trigger_content, null: false

      # Keywords or patterns that matched
      t.jsonb :matched_keywords, default: []

      # Additional context about the detection
      t.jsonb :context, default: {}

      # Detection method used (keyword, sentiment, llm)
      t.string :detection_method, default: 'keyword'

      # Whether safety pivot was shown to user
      t.boolean :safety_pivot_shown, default: false

      # User's response to safety pivot (if any)
      t.string :user_response

      # Resolution tracking
      t.datetime :resolved_at
      t.string :resolved_by
      t.text :resolution_notes

      # Clinical review status
      t.boolean :reviewed, default: false
      t.datetime :reviewed_at
      t.string :reviewed_by

      t.timestamps
    end

    add_index :crisis_events, :risk_level
    add_index :crisis_events, :detection_method
    add_index :crisis_events, :safety_pivot_shown
    add_index :crisis_events, :reviewed
    add_index :crisis_events, :resolved_at
    add_index :crisis_events, [:user_id, :created_at]
    add_index :crisis_events, [:risk_level, :reviewed]
  end
end

