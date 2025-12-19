# frozen_string_literal: true

##
# AppointmentPolicy
#
# Authorization policy for Appointment resources.
# Users can manage their own appointments.
#
# @see Appointment model
#
class AppointmentPolicy < ApplicationPolicy
  ##
  # Users can view their own appointments
  #
  def show?
    owner? || clinician_of_record?
  end

  ##
  # Users can update their own upcoming appointments
  #
  def update?
    owner? && record.can_reschedule?
  end

  ##
  # Users can cancel their own appointments
  #
  def cancel?
    owner? && record.can_cancel?
  end

  ##
  # Scope for listing appointments
  #
  class Scope < Scope
    def resolve
      if user.clinician?
        scope.where(clinician_id: user.id)
      else
        scope.where(user_id: user.id)
      end
    end
  end

  private

  ##
  # Checks if user owns the appointment
  #
  # @return [Boolean]
  #
  def owner?
    record.user_id == user.id
  end

  ##
  # Checks if user is the clinician for this appointment
  #
  # @return [Boolean]
  #
  def clinician_of_record?
    user.respond_to?(:clinician?) && user.clinician? && record.clinician_id == user.id
  end
end
