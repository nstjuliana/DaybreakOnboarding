# frozen_string_literal: true

##
# Message Model
#
# Represents an individual message within a conversation.
# Tracks sender, content, and any extracted response data.
#
# @attr [String] sender - Who sent the message (ai, user)
# @attr [String] content - The message text
# @attr [String] role - OpenAI API role (system, assistant, user)
# @attr [Hash] extracted_response - Structured response data if applicable
# @attr [Hash] crisis_flags - Crisis detection flags
# @attr [String] risk_level - Detected risk level (none, low, medium, high, critical)
# @attr [Integer] sequence_number - Order within conversation
#
class Message < ApplicationRecord
  include Discard::Model

  # Associations
  belongs_to :conversation
  has_one :screener_response, dependent: :destroy

  # Validations
  validates :sender, presence: true, inclusion: { in: ['ai', 'user', 'system'] }
  validates :content, presence: true
  validates :role, presence: true, inclusion: { in: ['system', 'assistant', 'user'] }
  validates :risk_level, inclusion: { in: ['none', 'low', 'medium', 'high', 'critical'] }
  validates :sequence_number, presence: true, numericality: { greater_than: 0 }

  # Scopes
  scope :from_ai, -> { where(sender: 'ai') }
  scope :from_user, -> { where(sender: 'user') }
  scope :by_sequence, -> { order(sequence_number: :asc) }
  scope :with_crisis_flags, -> { where.not(risk_level: 'none') }
  scope :pending_processing, -> { where(processing_status: 'pending') }

  # Callbacks
  before_validation :set_role_from_sender, on: :create
  before_validation :set_sequence_number, on: :create

  # Sender constants
  SENDERS = {
    ai: 'ai',
    user: 'user',
    system: 'system'
  }.freeze

  # Role constants (for OpenAI API)
  ROLES = {
    system: 'system',
    assistant: 'assistant',
    user: 'user'
  }.freeze

  # Risk level constants
  RISK_LEVELS = {
    none: 'none',
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'critical'
  }.freeze

  ##
  # Checks if message is from AI
  #
  # @return [Boolean] true if sender is ai
  #
  def from_ai?
    sender == SENDERS[:ai]
  end

  ##
  # Checks if message is from user
  #
  # @return [Boolean] true if sender is user
  #
  def from_user?
    sender == SENDERS[:user]
  end

  ##
  # Checks if message has any crisis flags
  #
  # @return [Boolean] true if risk level is not none
  #
  def has_crisis_flags?
    risk_level != RISK_LEVELS[:none]
  end

  ##
  # Checks if message has critical risk level
  #
  # @return [Boolean] true if risk level is critical
  #
  def critical_risk?
    risk_level == RISK_LEVELS[:critical]
  end

  ##
  # Checks if message has high or critical risk
  #
  # @return [Boolean] true if high or critical risk
  #
  def high_risk_or_above?
    ['high', 'critical'].include?(risk_level)
  end

  ##
  # Checks if message has an extracted response
  #
  # @return [Boolean] true if extracted_response is not empty
  #
  def has_extracted_response?
    extracted_response.present? && extracted_response.any?
  end

  ##
  # Gets the extracted question ID if present
  #
  # @return [String, nil] question ID or nil
  #
  def extracted_question_id
    extracted_response['question_id']
  end

  ##
  # Gets the extracted value if present
  #
  # @return [Integer, nil] extracted value or nil
  #
  def extracted_value
    extracted_response['extracted_value']
  end

  ##
  # Formats message for OpenAI API
  #
  # @return [Hash] message in OpenAI format
  #
  def to_openai_format
    { role: role, content: content }
  end

  private

  ##
  # Sets the OpenAI role based on sender
  #
  def set_role_from_sender
    return if role.present?

    self.role = case sender
                when 'ai' then ROLES[:assistant]
                when 'user' then ROLES[:user]
                when 'system' then ROLES[:system]
                else ROLES[:user]
                end
  end

  ##
  # Sets the sequence number if not provided
  #
  def set_sequence_number
    return if sequence_number.present?

    self.sequence_number = conversation&.next_sequence_number || 1
  end
end
