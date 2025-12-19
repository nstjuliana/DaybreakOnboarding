# frozen_string_literal: true

##
# InsuranceCard Model
#
# Stores insurance card information captured via GPT-4V OCR or manual entry.
# Supports image attachments via Active Storage for front/back card images.
#
# @see _docs/phases/phase-3-insurance-matching.md
#
# @example Creating via OCR upload
#   card = InsuranceCard.create!(
#     user: current_user,
#     payment_method: 'insurance',
#     status: 'pending'
#   )
#   card.front_image.attach(params[:front_image])
#   ExtractInsuranceJob.perform_later(card.id)
#
# @example Creating via manual entry
#   InsuranceCard.create!(
#     user: current_user,
#     payment_method: 'insurance',
#     provider: 'Blue Cross Blue Shield',
#     member_id: 'ABC123456789',
#     group_number: 'GRP001',
#     policyholder_name: 'Jane Doe',
#     status: 'verified'
#   )
#
class InsuranceCard < ApplicationRecord
  include Discard::Model

  # Associations
  belongs_to :user

  # Active Storage attachments for card images
  has_one_attached :front_image
  has_one_attached :back_image

  # Status definitions
  STATUSES = {
    'pending' => 'Awaiting processing',
    'extracting' => 'OCR in progress',
    'extracted' => 'Data extracted, needs verification',
    'verified' => 'Information verified by user',
    'failed' => 'Extraction failed'
  }.freeze

  # Payment method options
  PAYMENT_METHODS = {
    'insurance' => 'I have insurance',
    'self_pay' => 'I will self-pay',
    'no_insurance' => "I don't have insurance"
  }.freeze

  # Relationship to patient options
  RELATIONSHIPS = {
    'self' => 'Self',
    'spouse' => 'Spouse',
    'child' => 'Child',
    'parent' => 'Parent',
    'other' => 'Other'
  }.freeze

  # Validations
  validates :payment_method, presence: true, inclusion: { in: PAYMENT_METHODS.keys }
  validates :status, presence: true, inclusion: { in: STATUSES.keys }
  validates :provider, presence: true, if: :requires_insurance_info?
  validates :member_id, presence: true, if: :requires_insurance_info?

  # Content type validation for images
  validates :front_image,
            content_type: ['image/png', 'image/jpeg', 'image/webp'],
            size: { less_than: 10.megabytes },
            if: -> { front_image.attached? }

  validates :back_image,
            content_type: ['image/png', 'image/jpeg', 'image/webp'],
            size: { less_than: 10.megabytes },
            if: -> { back_image.attached? }

  # Scopes
  scope :pending, -> { where(status: 'pending') }
  scope :verified, -> { where(status: 'verified') }
  scope :with_insurance, -> { where(payment_method: 'insurance') }

  ##
  # Checks if user selected insurance payment
  #
  # @return [Boolean]
  #
  def has_insurance?
    payment_method == 'insurance'
  end

  ##
  # Checks if user selected self-pay
  #
  # @return [Boolean]
  #
  def self_pay?
    payment_method == 'self_pay'
  end

  ##
  # Checks if insurance information has been verified
  #
  # @return [Boolean]
  #
  def verified?
    status == 'verified'
  end

  ##
  # Checks if OCR extraction is in progress
  #
  # @return [Boolean]
  #
  def extracting?
    status == 'extracting'
  end

  ##
  # Checks if card has images attached for OCR
  #
  # @return [Boolean]
  #
  def has_images?
    front_image.attached?
  end

  ##
  # Returns the human-readable status label
  #
  # @return [String]
  #
  def status_label
    STATUSES[status] || status
  end

  ##
  # Returns the human-readable payment method label
  #
  # @return [String]
  #
  def payment_method_label
    PAYMENT_METHODS[payment_method] || payment_method
  end

  ##
  # Updates card with extracted OCR data
  #
  # @param extraction_data [Hash] Extracted fields from OCR
  # @param confidence [Float] Confidence score (0.0-1.0)
  #
  def apply_extraction(extraction_data, confidence: nil)
    update!(
      provider: extraction_data[:provider],
      member_id: extraction_data[:member_id],
      group_number: extraction_data[:group_number],
      plan_name: extraction_data[:plan_name],
      policyholder_name: extraction_data[:policyholder_name],
      raw_extraction: extraction_data,
      extraction_confidence: confidence,
      status: 'extracted'
    )
  end

  ##
  # Marks the card as verified by user
  #
  def verify!
    update!(status: 'verified')
  end

  ##
  # Marks extraction as failed
  #
  # @param error_message [String] Optional error details
  #
  def mark_failed!(error_message = nil)
    update!(
      status: 'failed',
      raw_extraction: raw_extraction.merge(error: error_message)
    )
  end

  private

  ##
  # Determines if insurance info fields are required
  # Required when payment method is insurance and status is verified
  #
  # @return [Boolean]
  #
  def requires_insurance_info?
    has_insurance? && verified?
  end
end
