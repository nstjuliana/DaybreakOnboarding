# frozen_string_literal: true

##
# AppointmentMailer
#
# Handles email notifications for appointments including
# confirmations, reminders, and cancellations.
#
# @see Appointment model
# @see SendAppointmentConfirmationJob
#
# @example Sending a confirmation email
#   AppointmentMailer.confirmation(appointment).deliver_later
#
class AppointmentMailer < ApplicationMailer
  ##
  # Sends appointment confirmation email to user
  #
  # @param appointment [Appointment] The booked appointment
  #
  def confirmation(appointment)
    @appointment = appointment
    @user = appointment.user
    @clinician = appointment.clinician

    mail(
      to: @user.email,
      subject: 'Your Daybreak Health Appointment is Confirmed'
    )
  end

  ##
  # Sends 24-hour reminder email
  #
  # @param appointment [Appointment] The upcoming appointment
  #
  def reminder_24hr(appointment)
    @appointment = appointment
    @user = appointment.user
    @clinician = appointment.clinician

    mail(
      to: @user.email,
      subject: "Reminder: Your appointment with #{@clinician.display_name} is tomorrow"
    )
  end

  ##
  # Sends cancellation confirmation email
  #
  # @param appointment [Appointment] The cancelled appointment
  #
  def cancellation(appointment)
    @appointment = appointment
    @user = appointment.user
    @clinician = appointment.clinician

    mail(
      to: @user.email,
      subject: 'Your Daybreak Health Appointment Has Been Cancelled'
    )
  end

  ##
  # Sends reschedule confirmation email
  #
  # @param appointment [Appointment] The rescheduled appointment
  # @param old_time [DateTime] The original appointment time
  #
  def rescheduled(appointment, old_time)
    @appointment = appointment
    @user = appointment.user
    @clinician = appointment.clinician
    @old_time = old_time

    mail(
      to: @user.email,
      subject: 'Your Daybreak Health Appointment Has Been Rescheduled'
    )
  end
end

