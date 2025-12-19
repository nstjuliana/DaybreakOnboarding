# frozen_string_literal: true

##
# Migration: Create Conversations Table
#
# Stores chat conversation sessions for AI-administered screeners.
# Links to assessments and tracks conversation state.
#
# @see Conversation model
#
class CreateConversations < ActiveRecord::Migration[8.0]
  def change
    create_table :conversations, id: :uuid do |t|
      t.references :assessment, type: :uuid, foreign_key: true, null: false
      t.references :user, type: :uuid, foreign_key: true, null: false

      # Screener type being administered (psc17, phq9a, scared)
      t.string :screener_type, null: false, default: 'psc17'

      # Conversation status tracking
      t.string :status, null: false, default: 'active'

      # Current question being asked (for resuming)
      t.string :current_question_id

      # Number of questions completed
      t.integer :questions_completed, default: 0

      # Flexible metadata storage (concerns, preferences, etc.)
      t.jsonb :metadata, default: {}

      # Soft delete support
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :conversations, :screener_type
    add_index :conversations, :status
    add_index :conversations, :discarded_at
    add_index :conversations, [:user_id, :created_at]
  end
end

