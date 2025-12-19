# frozen_string_literal: true

##
# SendAppointmentReminderJob
#
# Sends 24-hour reminder emails for upcoming appointments.
# Should be scheduled to run daily.
#
# @see AppointmentMailer
#
# @example Schedule reminders
#   SendAppointmentReminderJob.perform_later
#
class SendAppointmentReminderJob < ApplicationJob
  queue_as :default

  ##
  # Finds appointments 24 hours out and sends reminders
  #
  def perform
    # Find appointments scheduled for tomorrow (24-26 hours from now)
    upcoming = Appointment.kept
      .where(status: ['scheduled', 'confirmed'])
      .where(scheduled_at: 24.hours.from_now..26.hours.from_now)

    upcoming.find_each do |appointment|
      send_reminder(appointment)
    end

    Rails.logger.info(
      "[SendAppointmentReminderJob] Sent #{upcoming.count} reminder emails"
    )
  end

  private

  ##
  # Sends reminder for a single appointment
  #
  # @param appointment [Appointment] The appointment
  #
  def send_reminder(appointment)
    AppointmentMailer.reminder_24hr(appointment).deliver_now
  rescue StandardError => e
    Rails.logger.error(
      "[SendAppointmentReminderJob] Failed to send reminder for #{appointment.id}: #{e.message}"
    )
  end
end

