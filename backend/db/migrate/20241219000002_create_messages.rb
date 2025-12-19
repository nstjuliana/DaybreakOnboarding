# frozen_string_literal: true

##
# Migration: Create Messages Table
#
# Stores individual chat messages within a conversation.
# Tracks sender, content, and any extracted response data.
#
# @see Message model
#
class CreateMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :messages, id: :uuid do |t|
      t.references :conversation, type: :uuid, foreign_key: true, null: false

      # Message sender: 'ai' or 'user'
      t.string :sender, null: false

      # Message content (the actual text)
      t.text :content, null: false

      # Role for OpenAI API compatibility (system, assistant, user)
      t.string :role, null: false, default: 'user'

      # Extracted screener response data (question_id, value, confidence)
      t.jsonb :extracted_response, default: {}

      # Crisis detection flags for this message
      t.jsonb :crisis_flags, default: {}

      # Risk level detected (none, low, medium, high, critical)
      t.string :risk_level, default: 'none'

      # Message ordering within conversation
      t.integer :sequence_number, null: false

      # Processing status for async operations
      t.string :processing_status, default: 'complete'

      # Soft delete support
      t.datetime :discarded_at

      t.timestamps
    end

    add_index :messages, :sender
    add_index :messages, :role
    add_index :messages, :risk_level
    add_index :messages, :processing_status
    add_index :messages, :discarded_at
    add_index :messages, [:conversation_id, :sequence_number]
    add_index :messages, :extracted_response, using: :gin
    add_index :messages, :crisis_flags, using: :gin
  end
end

