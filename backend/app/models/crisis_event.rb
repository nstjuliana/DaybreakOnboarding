# frozen_string_literal: true

##
# CrisisEvent Model
#
# Logs crisis detection events for clinical review.
# Tracks risk levels, triggers, and resolution status.
#
# @attr [String] risk_level - Severity level (low, medium, high, critical)
# @attr [String] trigger_content - Content that triggered detection
# @attr [Array] matched_keywords - Keywords/patterns that matched
# @attr [Hash] context - Additional context about detection
# @attr [String] detection_method - Method used (keyword, sentiment, llm)
#
class CrisisEvent < ApplicationRecord
  # Associations
  belongs_to :conversation
  belongs_to :message, optional: true
  belongs_to :user

  # Validations
  validates :risk_level, presence: true,
                         inclusion: { in: ['low', 'medium', 'high', 'critical'] }
  validates :trigger_content, presence: true
  validates :detection_method, inclusion: { in: ['keyword', 'sentiment', 'llm', 'manual'] }

  # Scopes
  scope :unresolved, -> { where(resolved_at: nil) }
  scope :resolved, -> { where.not(resolved_at: nil) }
  scope :unreviewed, -> { where(reviewed: false) }
  scope :reviewed, -> { where(reviewed: true) }
  scope :critical, -> { where(risk_level: 'critical') }
  scope :high_risk, -> { where(risk_level: ['high', 'critical']) }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_risk_level, ->(level) { where(risk_level: level) }

  # Risk level constants
  RISK_LEVELS = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'critical'
  }.freeze

  # Detection method constants
  DETECTION_METHODS = {
    keyword: 'keyword',
    sentiment: 'sentiment',
    llm: 'llm',
    manual: 'manual'
  }.freeze

  ##
  # Checks if event is critical risk level
  #
  # @return [Boolean] true if critical
  #
  def critical?
    risk_level == RISK_LEVELS[:critical]
  end

  ##
  # Checks if event is high risk or above
  #
  # @return [Boolean] true if high or critical
  #
  def high_risk_or_above?
    ['high', 'critical'].include?(risk_level)
  end

  ##
  # Checks if event has been resolved
  #
  # @return [Boolean] true if resolved_at is set
  #
  def resolved?
    resolved_at.present?
  end

  ##
  # Marks the event as resolved
  #
  # @param resolved_by [String] identifier of who resolved it
  # @param notes [String] optional resolution notes
  # @return [Boolean] true if save was successful
  #
  def resolve!(resolved_by:, notes: nil)
    update!(
      resolved_at: Time.current,
      resolved_by: resolved_by,
      resolution_notes: notes
    )
  end

  ##
  # Marks the event as reviewed by clinical staff
  #
  # @param reviewed_by [String] identifier of reviewer
  # @return [Boolean] true if save was successful
  #
  def mark_reviewed!(reviewed_by:)
    update!(
      reviewed: true,
      reviewed_at: Time.current,
      reviewed_by: reviewed_by
    )
  end

  ##
  # Records that safety pivot was shown to user
  #
  # @param response [String] optional user response
  # @return [Boolean] true if save was successful
  #
  def record_safety_pivot_shown!(response: nil)
    update!(
      safety_pivot_shown: true,
      user_response: response
    )
  end

  ##
  # Gets a severity score for sorting/comparison
  #
  # @return [Integer] numeric severity (1-4)
  #
  def severity_score
    case risk_level
    when 'critical' then 4
    when 'high' then 3
    when 'medium' then 2
    when 'low' then 1
    else 0
    end
  end

  ##
  # Checks if this event requires immediate attention
  #
  # @return [Boolean] true if unresolved and high risk or above
  #
  def requires_immediate_attention?
    !resolved? && high_risk_or_above?
  end
end
