# frozen_string_literal: true

##
# Scheduling::BookAppointmentService
#
# Handles appointment booking with validation, conflict checking,
# and post-booking notifications.
#
# @see Appointment model
# @see Clinician model
# @see _docs/phases/phase-3-insurance-matching.md
#
# @example Booking an appointment
#   service = Scheduling::BookAppointmentService.new(
#     user: current_user,
#     clinician: clinician,
#     scheduled_at: DateTime.parse('2024-01-20 10:00'),
#     session_type: 'initial'
#   )
#   result = service.book
#   # => { success: true, appointment: #<Appointment> }
#
module Scheduling
  class BookAppointmentService
    # Default appointment duration in minutes
    DEFAULT_DURATION = 50

    # Session types with durations
    SESSION_TYPES = {
      'initial' => { duration: 50, label: 'Initial Consultation' },
      'followup' => { duration: 50, label: 'Follow-up Session' },
      'assessment' => { duration: 60, label: 'Diagnostic Assessment' },
      'crisis' => { duration: 30, label: 'Crisis Support' }
    }.freeze

    ##
    # Initializes the booking service
    #
    # @param user [User] The user booking the appointment
    # @param clinician [Clinician] The clinician being booked
    # @param scheduled_at [DateTime] The appointment time
    # @param session_type [String] Type of session
    # @param assessment [Assessment, nil] Optional linked assessment
    #
    def initialize(user:, clinician:, scheduled_at:, session_type: 'initial', assessment: nil)
      @user = user
      @clinician = clinician
      @scheduled_at = scheduled_at
      @session_type = session_type
      @assessment = assessment || user.latest_assessment
      @errors = []
    end

    ##
    # Books the appointment
    #
    # @return [Hash] Result with success status and appointment or errors
    #
    def book
      return failure_result unless valid_booking?

      appointment = create_appointment
      return failure_result unless appointment.persisted?

      send_confirmations(appointment)

      {
        success: true,
        appointment: appointment
      }
    end

    private

    ##
    # Validates the booking request
    #
    # @return [Boolean] Whether validation passed
    #
    def valid_booking?
      validate_clinician_active
      validate_slot_available
      validate_no_user_conflict
      validate_session_type

      @errors.empty?
    end

    ##
    # Validates clinician is active
    #
    def validate_clinician_active
      return if @clinician.active? && !@clinician.discarded?

      @errors << 'Clinician is not available for booking'
    end

    ##
    # Validates the slot is available
    #
    def validate_slot_available
      return if slot_available?

      @errors << 'This time slot is no longer available'
    end

    ##
    # Checks if user has another appointment at the same time
    #
    def validate_no_user_conflict
      return unless user_has_conflict?

      @errors << 'You already have an appointment at this time'
    end

    ##
    # Validates session type is valid
    #
    def validate_session_type
      return if SESSION_TYPES.key?(@session_type)

      @errors << 'Invalid session type'
    end

    ##
    # Checks if the slot is available
    #
    # @return [Boolean]
    #
    def slot_available?
      duration = session_duration
      duration.minutes

      # Check clinician availability service
      service = Scheduling::AvailabilityService.new(
        @clinician,
        @scheduled_at.to_date,
        @scheduled_at.to_date
      )

      service.slot_available?(@scheduled_at.to_date, @scheduled_at.strftime('%H:%M'))
    end

    ##
    # Checks if user has conflicting appointment
    #
    # @return [Boolean]
    #
    def user_has_conflict?
      duration = session_duration
      end_time = @scheduled_at + duration.minutes

      @user.appointments
        .kept
        .where(status: ['scheduled', 'confirmed'])
        .exists?(['scheduled_at < ? AND scheduled_at + (duration_minutes || \' minutes\')::interval > ?', end_time,
                  @scheduled_at])
    end

    ##
    # Creates the appointment record
    #
    # @return [Appointment]
    #
    def create_appointment
      Appointment.create(
        user: @user,
        clinician: @clinician,
        assessment: @assessment,
        scheduled_at: @scheduled_at,
        duration_minutes: session_duration,
        session_type: @session_type,
        status: 'scheduled',
        telehealth_url: generate_telehealth_url
      )
    end

    ##
    # Sends confirmation notifications
    #
    # @param appointment [Appointment] The booked appointment
    #
    def send_confirmations(appointment)
      # Send confirmation email
      SendAppointmentConfirmationJob.perform_later(appointment.id)
    end

    ##
    # Gets session duration based on type
    #
    # @return [Integer] Duration in minutes
    #
    def session_duration
      SESSION_TYPES.dig(@session_type, :duration) || DEFAULT_DURATION
    end

    ##
    # Generates a placeholder telehealth URL
    # In production, this would integrate with video platform
    #
    # @return [String]
    #
    def generate_telehealth_url
      token = SecureRandom.hex(16)
      "https://care.daybreakhealth.com/session/#{token}"
    end

    ##
    # Returns failure result with errors
    #
    # @return [Hash]
    #
    def failure_result
      {
        success: false,
        errors: @errors
      }
    end
  end
end
