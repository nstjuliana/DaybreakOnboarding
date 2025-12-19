# frozen_string_literal: true

##
# UserSerializer
#
# Serializes User model data for API responses.
# Uses jsonapi-serializer for consistent JSON:API compliant output.
#
class UserSerializer
  include JSONAPI::Serializer

  attributes :id, :email, :user_type, :created_at, :updated_at
end
