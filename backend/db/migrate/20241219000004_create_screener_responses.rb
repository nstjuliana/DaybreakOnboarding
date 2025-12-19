# frozen_string_literal: true

##
# Migration: Create Screener Responses Table
#
# Stores extracted structured responses from conversational answers.
# Links to messages and tracks confidence scores.
#
# @see ScreenerResponse model
#
class CreateScreenerResponses < ActiveRecord::Migration[8.0]
  def change
    create_table :screener_responses, id: :uuid do |t|
      t.references :conversation, type: :uuid, foreign_key: true, null: false
      t.references :message, type: :uuid, foreign_key: true, null: false

      # Which question this response answers (e.g., 'psc17_1', 'phq9a_q1')
      t.string :question_id, null: false

      # The user's original response text
      t.text :response_text, null: false

      # Extracted numeric value (Likert scale value)
      t.integer :extracted_value

      # Confidence score from extraction (0.0 to 1.0)
      t.float :confidence, default: 0.0

      # Whether this response has been verified/confirmed
      t.boolean :verified, default: false

      # Any clarification attempts made
      t.integer :clarification_attempts, default: 0

      # Raw extraction metadata from OpenAI
      t.jsonb :extraction_metadata, default: {}

      t.timestamps
    end

    add_index :screener_responses, :question_id
    add_index :screener_responses, :verified
    add_index :screener_responses, :confidence
    add_index :screener_responses, [:conversation_id, :question_id], unique: true
  end
end

