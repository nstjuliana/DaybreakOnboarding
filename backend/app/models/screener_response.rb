# frozen_string_literal: true

##
# ScreenerResponse Model
#
# Stores extracted structured responses from conversational answers.
# Links to messages and tracks confidence scores.
#
# @attr [String] question_id - The question this answers (e.g., 'psc17_1')
# @attr [String] response_text - User's original response text
# @attr [Integer] extracted_value - Extracted Likert scale value
# @attr [Float] confidence - Confidence score (0.0 to 1.0)
# @attr [Boolean] verified - Whether response has been verified
# @attr [Hash] extraction_metadata - Raw extraction data from OpenAI
#
class ScreenerResponse < ApplicationRecord
  # Associations
  belongs_to :conversation
  belongs_to :message

  # Validations
  validates :question_id, presence: true
  validates :response_text, presence: true
  validates :confidence, numericality: { greater_than_or_equal_to: 0.0,
                                         less_than_or_equal_to: 1.0 }
  validates :extracted_value, numericality: { greater_than_or_equal_to: 0,
                                              less_than_or_equal_to: 4 },
                              allow_nil: true
  validates :question_id, uniqueness: { scope: :conversation_id,
                                        message: 'already answered in this conversation' }

  # Scopes
  scope :verified, -> { where(verified: true) }
  scope :unverified, -> { where(verified: false) }
  scope :high_confidence, -> { where(confidence: 0.8..) }
  scope :low_confidence, -> { where(confidence: ...0.6) }
  scope :needs_clarification, -> { unverified.low_confidence }
  scope :by_question, ->(id) { where(question_id: id) }
  scope :for_screener, ->(prefix) { where('question_id LIKE ?', "#{prefix}%") }

  # Confidence thresholds
  HIGH_CONFIDENCE_THRESHOLD = 0.8
  LOW_CONFIDENCE_THRESHOLD = 0.6

  ##
  # Checks if response has high confidence
  #
  # @return [Boolean] true if confidence >= 0.8
  #
  def high_confidence?
    confidence >= HIGH_CONFIDENCE_THRESHOLD
  end

  ##
  # Checks if response has low confidence
  #
  # @return [Boolean] true if confidence < 0.6
  #
  def low_confidence?
    confidence < LOW_CONFIDENCE_THRESHOLD
  end

  ##
  # Checks if response needs clarification
  #
  # @return [Boolean] true if unverified and low confidence
  #
  def needs_clarification?
    !verified? && low_confidence?
  end

  ##
  # Marks response as verified
  #
  # @return [Boolean] true if save was successful
  #
  def verify!
    update!(verified: true)
  end

  ##
  # Records a clarification attempt
  #
  # @return [Boolean] true if save was successful
  #
  def record_clarification_attempt!
    increment!(:clarification_attempts)
  end

  ##
  # Updates the extracted value with new extraction
  #
  # @param value [Integer] new extracted value
  # @param new_confidence [Float] new confidence score
  # @param metadata [Hash] extraction metadata
  # @return [Boolean] true if save was successful
  #
  def update_extraction!(value:, new_confidence:, metadata: {})
    update!(
      extracted_value: value,
      confidence: new_confidence,
      extraction_metadata: extraction_metadata.merge(metadata)
    )
  end

  ##
  # Gets the screener type from question_id prefix
  #
  # @return [String] screener type (psc17, phq9a, scared)
  #
  def screener_type
    case question_id
    when /^psc17/ then 'psc17'
    when /^phq9a/ then 'phq9a'
    when /^scared/ then 'scared'
    else 'unknown'
    end
  end

  ##
  # Gets the question number from question_id
  #
  # @return [Integer, nil] question number
  #
  def question_number
    match = question_id.match(/(\d+)$/)
    match ? match[1].to_i : nil
  end
end
