# frozen_string_literal: true

##
# PatientPolicy
#
# Authorization policy for Patient resources.
# Users can only access their own patient records.
#
# @see Patient model
#
class PatientPolicy < ApplicationPolicy
  ##
  # Users can view their own patient
  #
  def show?
    owner?
  end

  ##
  # Users can update their own patient
  #
  def update?
    owner?
  end

  private

  ##
  # Checks if user owns the patient record
  #
  # @return [Boolean]
  #
  def owner?
    record.user_id == user.id
  end
end
