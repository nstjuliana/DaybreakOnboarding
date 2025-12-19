# frozen_string_literal: true

##
# AssessmentSerializer
#
# Serializes Assessment model data for API responses.
# Uses jsonapi-serializer for consistent JSON:API compliant output.
#
class AssessmentSerializer
  include JSONAPI::Serializer

  attributes :id, :user_id, :screener_type, :score, :responses, :created_at, :updated_at

  belongs_to :user
end

