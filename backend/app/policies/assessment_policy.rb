# frozen_string_literal: true

##
# AssessmentPolicy
#
# Authorization policy for Assessment records.
# Defines who can view and modify assessments.
#
# @see Assessment model
# @see Pundit authorization
#
class AssessmentPolicy < ApplicationPolicy
  ##
  # Checks if user can view the assessment
  #
  # @return [Boolean] True if user owns the assessment
  #
  def show?
    owner?
  end

  ##
  # Checks if user can update the assessment
  #
  # @return [Boolean] True if user owns and assessment is editable
  #
  def update?
    owner? && record.editable?
  end

  ##
  # Checks if user can delete the assessment
  #
  # @return [Boolean] False - assessments should not be deleted
  #
  def destroy?
    false
  end

  ##
  # Scope for listing assessments
  #
  class Scope < Scope
    ##
    # Returns assessments the user can access
    #
    # @return [ActiveRecord::Relation] Scoped assessments
    #
    def resolve
      scope.where(user_id: user.id)
    end
  end

  private

  ##
  # Checks if user owns the assessment
  #
  # @return [Boolean]
  #
  def owner?
    record.user_id == user&.id
  end
end
