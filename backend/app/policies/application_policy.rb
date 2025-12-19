# frozen_string_literal: true

##
# ApplicationPolicy
#
# Base policy class for Pundit authorization.
# Provides common functionality for all policy classes.
#
# @see https://github.com/varvet/pundit
#
class ApplicationPolicy
  attr_reader :user, :record

  ##
  # Initializes the policy
  #
  # @param user [User] The current user
  # @param record [Object] The record being authorized
  #
  def initialize(user, record)
    @user = user
    @record = record
  end

  ##
  # Default index permission - deny
  #
  def index?
    false
  end

  ##
  # Default show permission - deny
  #
  def show?
    false
  end

  ##
  # Default create permission - deny
  #
  def create?
    false
  end

  ##
  # Default new permission - delegates to create
  #
  def new?
    create?
  end

  ##
  # Default update permission - deny
  #
  def update?
    false
  end

  ##
  # Default edit permission - delegates to update
  #
  def edit?
    update?
  end

  ##
  # Default destroy permission - deny
  #
  def destroy?
    false
  end

  ##
  # Base scope class for policy scopes
  #
  class Scope
    attr_reader :user, :scope

    ##
    # Initializes the scope
    #
    # @param user [User] The current user
    # @param scope [ActiveRecord::Relation] The base scope
    #
    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    ##
    # Returns the scoped records
    # Override in subclasses
    #
    # @return [ActiveRecord::Relation]
    #
    def resolve
      raise NotImplementedError, "You must define #resolve in #{self.class}"
    end
  end
end

