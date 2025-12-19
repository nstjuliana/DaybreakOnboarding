# frozen_string_literal: true

##
# Conversation Model
#
# Represents a chat conversation session for AI-administered screeners.
# Links to assessments and contains messages exchanged between user and AI.
#
# @attr [String] screener_type - Type of screener (psc17, phq9a, scared)
# @attr [String] status - Current status (active, completed, abandoned, crisis_paused)
# @attr [String] current_question_id - ID of current question being asked
# @attr [Integer] questions_completed - Count of completed questions
# @attr [Hash] metadata - Flexible storage for concerns, preferences, etc.
#
class Conversation < ApplicationRecord
  include Discard::Model

  # Associations
  belongs_to :assessment
  belongs_to :user
  has_many :messages, dependent: :destroy
  has_many :crisis_events, dependent: :destroy
  has_many :screener_responses, dependent: :destroy

  # Validations
  validates :screener_type, presence: true,
                            inclusion: { in: ['psc17', 'phq9a', 'scared'] }
  validates :status, presence: true,
                     inclusion: { in: ['active', 'completed', 'abandoned', 'crisis_paused'] }
  validates :questions_completed, numericality: { greater_than_or_equal_to: 0 }

  # Scopes
  scope :active, -> { where(status: 'active') }
  scope :completed, -> { where(status: 'completed') }
  scope :by_screener, ->(type) { where(screener_type: type) }
  scope :recent, -> { order(created_at: :desc) }

  # Status constants
  STATUSES = {
    active: 'active',
    completed: 'completed',
    abandoned: 'abandoned',
    crisis_paused: 'crisis_paused'
  }.freeze

  # Screener type constants
  SCREENER_TYPES = {
    psc17: 'psc17',
    phq9a: 'phq9a',
    scared: 'scared'
  }.freeze

  ##
  # Checks if the conversation is currently active
  #
  # @return [Boolean] true if status is active
  #
  def active?
    status == STATUSES[:active]
  end

  ##
  # Checks if the conversation is completed
  #
  # @return [Boolean] true if status is completed
  #
  def completed?
    status == STATUSES[:completed]
  end

  ##
  # Checks if the conversation was paused due to crisis detection
  #
  # @return [Boolean] true if status is crisis_paused
  #
  def crisis_paused?
    status == STATUSES[:crisis_paused]
  end

  ##
  # Marks the conversation as completed
  #
  # @return [Boolean] true if save was successful
  #
  def complete!
    update!(status: STATUSES[:completed])
  end

  ##
  # Pauses the conversation due to crisis detection
  #
  # @return [Boolean] true if save was successful
  #
  def pause_for_crisis!
    update!(status: STATUSES[:crisis_paused])
  end

  ##
  # Resumes the conversation after crisis pause
  #
  # @return [Boolean] true if save was successful
  #
  def resume!
    update!(status: STATUSES[:active])
  end

  ##
  # Gets the next sequence number for messages
  #
  # @return [Integer] next sequence number
  #
  def next_sequence_number
    (messages.maximum(:sequence_number) || 0) + 1
  end

  ##
  # Gets total question count for the current screener
  #
  # @return [Integer] total number of questions
  #
  def total_questions
    case screener_type
    when 'psc17' then 17
    when 'phq9a' then 9
    when 'scared' then 5
    else 0
    end
  end

  ##
  # Calculates completion percentage
  #
  # @return [Float] percentage complete (0.0 to 100.0)
  #
  def completion_percentage
    return 0.0 if total_questions.zero?

    (questions_completed.to_f / total_questions * 100).round(1)
  end

  ##
  # Checks if all questions have been answered
  #
  # @return [Boolean] true if all questions completed
  #
  def all_questions_answered?
    questions_completed >= total_questions
  end

  ##
  # Gets the latest crisis event if any
  #
  # @return [CrisisEvent, nil] most recent crisis event
  #
  def latest_crisis_event
    crisis_events.order(created_at: :desc).first
  end

  ##
  # Checks if there are any unresolved crisis events
  #
  # @return [Boolean] true if unresolved crisis events exist
  #
  def has_unresolved_crisis?
    crisis_events.exists?(resolved_at: nil)
  end
end
