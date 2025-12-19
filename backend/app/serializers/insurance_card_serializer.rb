# frozen_string_literal: true

##
# InsuranceCardSerializer
#
# Serializes InsuranceCard records to JSON for API responses.
# Includes computed fields and formatted data.
#
# @see InsuranceCard model
#
class InsuranceCardSerializer
  include JSONAPI::Serializer

  attributes :id,
             :provider,
             :member_id,
             :group_number,
             :plan_name,
             :policyholder_name,
             :policyholder_dob,
             :relationship_to_patient,
             :payment_method,
             :status,
             :extraction_confidence,
             :created_at,
             :updated_at

  # Computed attributes
  attribute :status_label, &:status_label

  attribute :payment_method_label, &:payment_method_label

  attribute :has_front_image do |card|
    card.front_image.attached?
  end

  attribute :has_back_image do |card|
    card.back_image.attached?
  end

  attribute :verified, &:verified?

  # Include image URLs only when requested
  attribute :front_image_url do |card|
    if card.front_image.attached?
      Rails.application.routes.url_helpers.rails_blob_url(
        card.front_image,
        only_path: true
      )
    end
  end

  attribute :back_image_url do |card|
    if card.back_image.attached?
      Rails.application.routes.url_helpers.rails_blob_url(
        card.back_image,
        only_path: true
      )
    end
  end
end

