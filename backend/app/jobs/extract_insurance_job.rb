# frozen_string_literal: true

##
# ExtractInsuranceJob
#
# Background job that processes insurance card images using GPT-4 Vision OCR.
# Updates the InsuranceCard record with extracted data.
#
# @see Insurance::VisionOcrService
# @see InsuranceCard
#
# @example Enqueue extraction
#   ExtractInsuranceJob.perform_later(insurance_card.id)
#
class ExtractInsuranceJob < ApplicationJob
  queue_as :default

  # Retry on transient failures with exponential backoff
  retry_on Insurance::VisionOcrService::ExtractionError,
           wait: :polynomially_longer,
           attempts: 3

  # Don't retry if the card is not found
  discard_on ActiveRecord::RecordNotFound

  ##
  # Performs the insurance card extraction
  #
  # @param insurance_card_id [String] UUID of the InsuranceCard
  #
  def perform(insurance_card_id)
    insurance_card = InsuranceCard.find(insurance_card_id)

    # Skip if already processed or not pending
    return unless insurance_card.status.in?(['pending', 'extracting'])

    # Mark as extracting
    insurance_card.update!(status: 'extracting')

    # Perform extraction
    service = Insurance::VisionOcrService.new(insurance_card)
    result = service.extract

    # Apply extracted data
    insurance_card.apply_extraction(result, confidence: result[:confidence])

    Rails.logger.info(
      "[ExtractInsuranceJob] Successfully extracted card #{insurance_card_id} " \
      "with confidence #{result[:confidence]}"
    )
  rescue Insurance::VisionOcrService::ExtractionError => e
    Rails.logger.error("[ExtractInsuranceJob] Extraction failed: #{e.message}")
    insurance_card&.mark_failed!(e.message)
    raise # Re-raise for retry logic
  rescue StandardError => e
    Rails.logger.error("[ExtractInsuranceJob] Unexpected error: #{e.message}")
    insurance_card&.mark_failed!(e.message)
    raise
  end
end
