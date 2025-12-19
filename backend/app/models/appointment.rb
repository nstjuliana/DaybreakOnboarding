# frozen_string_literal: true

##
# Appointment Model
#
# Represents a scheduled session between a user and clinician.
# Supports various session types and telehealth functionality.
#
# @see _docs/user-flow.md Phase 4: Commitment (Care)
#
# @example Booking an appointment
#   appointment = Appointment.create!(
#     user: current_user,
#     clinician: matched_clinician,
#     assessment: completed_assessment,
#     scheduled_at: 2.days.from_now,
#     session_type: 'initial'
#   )
#
class Appointment < ApplicationRecord
  include Discard::Model

  # Associations
  belongs_to :user
  belongs_to :clinician
  belongs_to :assessment, optional: true

  # Status definitions
  STATUSES = {
    'scheduled' => 'Appointment booked',
    'confirmed' => 'Confirmed by both parties',
    'in_progress' => 'Session currently active',
    'completed' => 'Session finished',
    'cancelled' => 'Appointment cancelled',
    'no_show' => 'Patient did not attend'
  }.freeze

  # Session type definitions
  SESSION_TYPES = {
    'initial' => 'Initial Consultation (50 min)',
    'followup' => 'Follow-up Session (50 min)',
    'assessment' => 'Diagnostic Assessment (60 min)',
    'crisis' => 'Crisis Support (30 min)',
    'therapy' => 'Therapy Session (50 min)'
  }.freeze

  # Minimum hours before appointment to allow cancellation
  CANCELLATION_WINDOW_HOURS = 24

  # Validations
  validates :scheduled_at, presence: true
  validates :status, presence: true, inclusion: { in: STATUSES.keys }
  validates :session_type, presence: true, inclusion: { in: SESSION_TYPES.keys }
  validates :duration_minutes, numericality: { greater_than: 0 }
  validate :scheduled_in_future, on: :create

  # Scopes
  scope :upcoming, -> { where('scheduled_at > ?', Time.current).where(status: ['scheduled', 'confirmed']) }
  scope :past, -> { where(scheduled_at: ...Time.current) }
  scope :for_clinician, ->(clinician) { where(clinician: clinician) }
  scope :for_user, ->(user) { where(user: user) }
  scope :on_date, ->(date) { where(scheduled_at: date.all_day) }

  ##
  # Confirms the appointment
  #
  # @return [Boolean] Whether save succeeded
  #
  def confirm!
    update!(status: 'confirmed', confirmed_at: Time.current)
  end

  ##
  # Cancels the appointment
  #
  # @param reason [String] The cancellation reason
  # @return [Boolean] Whether save succeeded
  #
  def cancel!(reason: nil)
    update!(
      status: 'cancelled',
      cancelled_at: Time.current,
      cancellation_reason: reason
    )
  end

  ##
  # Marks appointment as completed
  #
  # @return [Boolean] Whether save succeeded
  #
  def complete!
    update!(status: 'completed')
  end

  ##
  # Returns the human-readable session type label
  #
  # @return [String]
  #
  def session_type_label
    SESSION_TYPES[session_type] || session_type
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
  # Checks if appointment can be cancelled
  #
  # @return [Boolean]
  #
  def cancellable?
    can_cancel?
  end

  ##
  # Checks if appointment can be cancelled (24 hour window)
  #
  # @return [Boolean]
  #
  def can_cancel?
    ['scheduled', 'confirmed'].include?(status) &&
      scheduled_at > Time.current &&
      scheduled_at > CANCELLATION_WINDOW_HOURS.hours.from_now
  end

  ##
  # Checks if appointment can be rescheduled
  #
  # @return [Boolean]
  #
  def can_reschedule?
    ['scheduled', 'confirmed'].include?(status) &&
      scheduled_at > Time.current &&
      scheduled_at > CANCELLATION_WINDOW_HOURS.hours.from_now
  end

  ##
  # Checks if appointment is in the future
  #
  # @return [Boolean]
  #
  def upcoming?
    scheduled_at > Time.current && ['scheduled', 'confirmed'].include?(status)
  end

  ##
  # Returns the end time based on duration
  #
  # @return [DateTime]
  #
  def end_time
    scheduled_at + duration_minutes.minutes
  end

  private

  ##
  # Validates that appointment is scheduled in the future
  #
  def scheduled_in_future
    return unless scheduled_at.present? && scheduled_at <= Time.current

    errors.add(:scheduled_at, 'must be in the future')
  end
end
