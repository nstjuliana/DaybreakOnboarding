# frozen_string_literal: true

##
# UserPolicy
#
# Pundit policy for the User model.
# Defines authorization rules for user-related actions.
#
class UserPolicy < ApplicationPolicy
  ##
  # Can the current user view this user record?
  # Users can only view their own profile.
  #
  # @return [Boolean]
  #
  def show?
    record == user
  end

  ##
  # Can the current user update this user record?
  # Users can only update their own profile.
  #
  # @return [Boolean]
  #
  def update?
    record == user
  end

  ##
  # Scope class for User model
  # Defines which users are visible in index actions.
  #
  class Scope < Scope
    ##
    # Users can only see their own record
    #
    # @return [ActiveRecord::Relation]
    #
    def resolve
      scope.where(id: user.id)
    end
  end
end
