# frozen_string_literal: true

##
# ConversationPolicy
#
# Authorization policy for Conversation model.
# Controls access to chat conversations.
#
class ConversationPolicy < ApplicationPolicy
  ##
  # Can user view this conversation?
  #
  def show?
    # Users can view their own conversations
    record.user_id == user&.id
  end

  ##
  # Can user create conversations?
  #
  def create?
    true # Anyone can create a conversation
  end

  ##
  # Can user update this conversation?
  #
  def update?
    record.user_id == user&.id
  end

  ##
  # Can user destroy this conversation?
  #
  def destroy?
    record.user_id == user&.id
  end

  ##
  # Scope for listing conversations
  #
  class Scope < Scope
    def resolve
      if user
        scope.where(user_id: user.id)
      else
        scope.none
      end
    end
  end
end
