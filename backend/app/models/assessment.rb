# frozen_string_literal: true

##
# Assessment Model
#
# Stores screening questionnaire responses and results from
# the onboarding flow. Supports multiple screener types with
# flexible JSONB storage for responses and AI-generated results.
#
# @see _docs/user-flow.md Phase 2: Holistic Intake
#
# @example Creating an assessment
#   assessment = Assessment.create!(
#     user: current_user,
#     screener_type: 'psc17',
#     responses: { q1: 2, q2: 1, q3: 0 }
#   )
#   assessment.complete!
#
class Assessment < ApplicationRecord
  include Discard::Model

  # Associations
  belongs_to :user, optional: true
  has_one :appointment, dependent: :nullify
  has_one :conversation, dependent: :destroy

  # Status definitions
  STATUSES = {
    'pending' => 'Not yet started',
    'in_progress' => 'Currently being completed',
    'completed' => 'Finished, awaiting results',
    'analyzed' => 'Results available',
    'expired' => 'Session timed out'
  }.freeze

  # Screener type definitions
  SCREENER_TYPES = {
    'psc17' => 'Pediatric Symptom Checklist (17 items)',
    'psc35' => 'Pediatric Symptom Checklist (35 items)',
    'phq9a' => 'Patient Health Questionnaire for Adolescents',
    'gad7' => 'Generalized Anxiety Disorder Scale',
    'scared' => 'Screen for Child Anxiety Related Disorders'
  }.freeze

  # Severity levels
  SEVERITY_LEVELS = ['minimal', 'mild', 'moderate', 'severe'].freeze

  # Validations
  validates :screener_type, presence: true, inclusion: { in: SCREENER_TYPES.keys }
  validates :status, presence: true, inclusion: { in: STATUSES.keys }
  validates :severity, inclusion: { in: SEVERITY_LEVELS, allow_blank: true }

  # Scopes
  scope :pending, -> { where(status: 'pending') }
  scope :in_progress, -> { where(status: 'in_progress') }
  scope :completed, -> { where(status: ['completed', 'analyzed']) }
  scope :by_screener, ->(type) { where(screener_type: type) }

  ##
  # Marks assessment as started
  #
  # @return [Boolean] Whether save succeeded
  #
  def start!
    update!(status: 'in_progress', started_at: Time.current)
  end

  ##
  # Marks assessment as completed and calculates score
  #
  # @return [Boolean] Whether save succeeded
  #
  def complete!
    update!(
      status: 'completed',
      completed_at: Time.current
    )
  end

  ##
  # Updates assessment with analysis results
  #
  # @param results_data [Hash] The analysis results
  # @param calculated_score [Integer] The calculated score
  # @param severity_level [String] The severity classification
  # @return [Boolean] Whether save succeeded
  #
  def analyze!(results_data:, calculated_score:, severity_level:)
    update!(
      status: 'analyzed',
      results: results_data,
      score: calculated_score,
      severity: severity_level
    )
  end

  ##
  # Returns the human-readable screener type label
  #
  # @return [String]
  #
  def screener_type_label
    SCREENER_TYPES[screener_type] || screener_type
  end

  ##
  # Returns the human-readable status label
  #
  # @return [String]
  #
  def status_label
    STATUSES[status] || status
  end

  ##
  # Checks if assessment is editable
  #
  # @return [Boolean]
  #
  def editable?
    ['pending', 'in_progress'].include?(status)
  end

  ##
  # Checks if assessment has been completed
  #
  # @return [Boolean]
  #
  def finished?
    ['completed', 'analyzed'].include?(status)
  end

  ##
  # Returns duration in minutes if completed
  #
  # @return [Integer, nil] Duration in minutes
  #
  def duration_minutes
    return nil unless started_at && completed_at

    ((completed_at - started_at) / 60).round
  end
end
