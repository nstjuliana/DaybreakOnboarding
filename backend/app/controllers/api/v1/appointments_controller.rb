# frozen_string_literal: true

##
# Api::V1::AppointmentsController
#
# Handles appointment booking, listing, and management.
# Integrates with BookAppointmentService for booking logic.
#
# @see Appointment model
# @see Scheduling::BookAppointmentService
# @see _docs/phases/phase-3-insurance-matching.md
#
module Api
  module V1
    class AppointmentsController < BaseController
      before_action :authenticate_user!
      before_action :set_appointment, only: [:show, :update, :cancel]

      ##
      # GET /api/v1/appointments
      #
      # Lists user's appointments with optional filters
      #
      # @param status [String] Filter by status (optional)
      # @param upcoming [Boolean] Only future appointments (optional)
      #
      def index
        appointments = current_user.appointments.kept.includes(:clinician, :assessment)

        # Filter by status
        appointments = appointments.where(status: params[:status]) if params[:status].present?

        # Filter upcoming only
        appointments = appointments.where('scheduled_at > ?', Time.current) if params[:upcoming] == 'true'

        appointments = appointments.order(scheduled_at: :asc)

        render_success(appointments.map { |a| appointment_response(a) })
      end

      ##
      # GET /api/v1/appointments/:id
      #
      # Returns a specific appointment
      #
      def show
        authorize @appointment
        render_success(appointment_response(@appointment))
      end

      ##
      # POST /api/v1/appointments
      #
      # Books a new appointment
      #
      # @param clinician_id [String] Clinician UUID
      # @param scheduled_at [String] ISO8601 datetime
      # @param session_type [String] Type of session
      #
      def create
        clinician = Clinician.kept.find(params[:clinician_id])

        service = Scheduling::BookAppointmentService.new(
          user: current_user,
          clinician: clinician,
          scheduled_at: parse_scheduled_at,
          session_type: params[:session_type] || 'initial'
        )

        result = service.book

        if result[:success]
          render_success(
            appointment_response(result[:appointment]),
            status: :created
          )
        else
          render_error('Unable to book appointment', errors: result[:errors])
        end
      end

      ##
      # PATCH /api/v1/appointments/:id
      #
      # Updates an appointment (reschedule)
      #
      def update
        authorize @appointment

        # Only allow rescheduling if appointment is upcoming
        return render_error('This appointment cannot be rescheduled') unless @appointment.can_reschedule?

        if @appointment.update(update_params)
          render_success(appointment_response(@appointment))
        else
          render_error(
            'Failed to update appointment',
            errors: @appointment.errors.full_messages
          )
        end
      end

      ##
      # POST /api/v1/appointments/:id/cancel
      #
      # Cancels an appointment
      #
      def cancel
        authorize @appointment

        return render_error('This appointment cannot be cancelled') unless @appointment.can_cancel?

        @appointment.update!(status: 'cancelled', cancelled_at: Time.current)

        render_success(appointment_response(@appointment))
      end

      private

      ##
      # Sets appointment from params
      #
      def set_appointment
        @appointment = Appointment.kept.find(params[:id])
      end

      ##
      # Parses scheduled_at from params
      #
      # @return [DateTime]
      #
      def parse_scheduled_at
        DateTime.parse(params[:scheduled_at])
      rescue ArgumentError
        raise ActionController::BadRequest, 'Invalid scheduled_at format'
      end

      ##
      # Permitted params for update
      #
      def update_params
        params.expect(appointment: [:scheduled_at, :notes])
      end

      ##
      # Formats appointment for API response
      #
      # @param appointment [Appointment] The appointment to format
      # @return [Hash] Formatted appointment data
      #
      def appointment_response(appointment)
        {
          id: appointment.id,
          status: appointment.status,
          scheduled_at: appointment.scheduled_at&.iso8601,
          duration_minutes: appointment.duration_minutes,
          session_type: appointment.session_type,
          session_type_label: session_type_label(appointment.session_type),
          telehealth_url: appointment.telehealth_url,
          notes: appointment.notes,
          can_reschedule: appointment.can_reschedule?,
          can_cancel: appointment.can_cancel?,
          clinician: {
            id: appointment.clinician.id,
            full_name: appointment.clinician.full_name,
            display_name: appointment.clinician.display_name,
            credentials: appointment.clinician.credentials,
            photo_url: appointment.clinician.photo_url
          },
          created_at: appointment.created_at.iso8601,
          updated_at: appointment.updated_at.iso8601
        }
      end

      ##
      # Gets human-readable session type label
      #
      # @param session_type [String] The session type
      # @return [String] Label
      #
      def session_type_label(session_type)
        Scheduling::BookAppointmentService::SESSION_TYPES
          .dig(session_type, :label) || session_type.titleize
      end
    end
  end
end
