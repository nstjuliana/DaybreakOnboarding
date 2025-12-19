# frozen_string_literal: true

##
# ClinicianPolicy
#
# Pundit policy for the Clinician model.
# Defines authorization rules for clinician-related actions.
# Clinicians are publicly viewable for the matching flow.
#
class ClinicianPolicy < ApplicationPolicy
  ##
  # Can a user view a clinician?
  # All users (including unauthenticated) can view clinicians.
  #
  # @return [Boolean]
  #
  def show?
    true
  end

  ##
  # Can a user list clinicians?
  # All users (including unauthenticated) can list clinicians.
  #
  # @return [Boolean]
  #
  def index?
    true
  end

  ##
  # Scope class for Clinician model
  # Defines which clinicians are visible in index actions.
  #
  class Scope < Scope
    ##
    # All clinicians are visible to everyone
    #
    # @return [ActiveRecord::Relation]
    #
    def resolve
      scope.all
    end
  end
end

