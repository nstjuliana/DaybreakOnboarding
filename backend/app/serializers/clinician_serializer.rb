# frozen_string_literal: true

##
# ClinicianSerializer
#
# Serializes Clinician model data for API responses.
# Uses jsonapi-serializer for consistent JSON:API compliant output.
#
class ClinicianSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :specialty, :bio, :avatar_url, :availability, :created_at, :updated_at
end
