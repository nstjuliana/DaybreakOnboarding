# frozen_string_literal: true

##
# InsuranceCardPolicy
#
# Authorization policy for InsuranceCard resources.
# Users can only access their own insurance cards.
#
# @see InsuranceCard model
#
class InsuranceCardPolicy < ApplicationPolicy
  ##
  # Users can view their own insurance card
  #
  def show?
    owner?
  end

  ##
  # Users can update their own insurance card
  #
  def update?
    owner?
  end

  ##
  # Users can trigger extraction on their own card
  #
  def extract?
    owner?
  end

  ##
  # Users can verify their own card
  #
  def verify?
    owner?
  end

  private

  ##
  # Checks if user owns the insurance card
  #
  # @return [Boolean]
  #
  def owner?
    record.user_id == user.id
  end
end

