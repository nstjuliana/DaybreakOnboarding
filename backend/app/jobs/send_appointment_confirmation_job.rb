# frozen_string_literal: true

##
# SendAppointmentConfirmationJob
#
# Sends appointment confirmation email after booking.
#
# @see AppointmentMailer
# @see Scheduling::BookAppointmentService
#
# @example Enqueue confirmation
#   SendAppointmentConfirmationJob.perform_later(appointment.id)
#
class SendAppointmentConfirmationJob < ApplicationJob
  queue_as :default

  # Don't retry if appointment not found
  discard_on ActiveRecord::RecordNotFound

  ##
  # Sends the confirmation email
  #
  # @param appointment_id [String] UUID of the Appointment
  #
  def perform(appointment_id)
    appointment = Appointment.find(appointment_id)

    # Skip if appointment was cancelled before email sent
    return if appointment.status == 'cancelled'

    # Send confirmation email
    AppointmentMailer.confirmation(appointment).deliver_now

    Rails.logger.info(
      "[SendAppointmentConfirmationJob] Sent confirmation for appointment #{appointment_id}"
    )
  end
end
