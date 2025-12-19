# frozen_string_literal: true

##
# Api::V1::InsuranceController
#
# Handles insurance card creation, OCR extraction, and verification.
# Supports both image upload with GPT-4V OCR and manual entry.
#
# @see InsuranceCard model
# @see Insurance::VisionOcrService
# @see _docs/phases/phase-3-insurance-matching.md
#
module Api
  module V1
    class InsuranceController < BaseController
      before_action :authenticate_user!
      before_action :set_insurance_card, only: [:show, :update, :extract]

      ##
      # GET /api/v1/insurance
      #
      # Returns the current user's insurance card if it exists.
      #
      def index
        @insurance_card = current_user.insurance_card

        if @insurance_card
          render_success(serialize_card(@insurance_card))
        else
          render_success(nil)
        end
      end

      ##
      # GET /api/v1/insurance/:id
      #
      # Returns a specific insurance card.
      #
      def show
        authorize @insurance_card
        render_success(serialize_card(@insurance_card))
      end

      ##
      # POST /api/v1/insurance
      #
      # Creates a new insurance card record.
      # Can include images for OCR or manual entry data.
      #
      # @param payment_method [String] 'insurance', 'self_pay', or 'no_insurance'
      # @param front_image [File] Optional front card image
      # @param back_image [File] Optional back card image
      # @param provider [String] Optional insurance provider
      # @param member_id [String] Optional member ID
      # @param group_number [String] Optional group number
      #
      def create
        @insurance_card = current_user.build_insurance_card(insurance_params)

        # Attach images if provided
        attach_images

        if @insurance_card.save
          # Trigger OCR if images attached and using insurance
          trigger_ocr_if_needed

          render_success(serialize_card(@insurance_card), status: :created)
        else
          render_error(
            'Failed to save insurance information',
            errors: @insurance_card.errors.full_messages
          )
        end
      end

      ##
      # PATCH /api/v1/insurance/:id
      #
      # Updates insurance card with manual corrections or verification.
      #
      def update
        authorize @insurance_card

        if @insurance_card.update(insurance_params)
          render_success(serialize_card(@insurance_card))
        else
          render_error(
            'Failed to update insurance information',
            errors: @insurance_card.errors.full_messages
          )
        end
      end

      ##
      # POST /api/v1/insurance/:id/extract
      #
      # Triggers OCR extraction on the insurance card images.
      # Returns the extracted data for user verification.
      #
      def extract
        authorize @insurance_card

        unless @insurance_card.has_images?
          return render_error('No images attached for extraction', status: :unprocessable_entity)
        end

        # Perform extraction synchronously for immediate feedback
        service = Insurance::VisionOcrService.new(@insurance_card)
        result = service.extract

        @insurance_card.apply_extraction(result, confidence: result[:confidence])

        render_success({
                         insurance_card: serialize_card(@insurance_card),
                         extraction: result
                       })
      rescue Insurance::VisionOcrService::ExtractionError => e
        @insurance_card.mark_failed!(e.message)
        render_error("Extraction failed: #{e.message}", status: :unprocessable_entity)
      end

      ##
      # POST /api/v1/insurance/:id/verify
      #
      # Marks the insurance card as verified by the user.
      #
      def verify
        @insurance_card = current_user.insurance_card
        authorize @insurance_card

        @insurance_card.verify!
        render_success(serialize_card(@insurance_card))
      end

      private

      ##
      # Sets the insurance card from params or current user
      #
      def set_insurance_card
        @insurance_card = if params[:id]
                            InsuranceCard.find(params[:id])
                          else
                            current_user.insurance_card
                          end
      end

      ##
      # Permitted parameters for insurance card
      #
      def insurance_params
        params.expect(
          insurance: [:payment_method,
                      :provider,
                      :member_id,
                      :group_number,
                      :plan_name,
                      :policyholder_name,
                      :policyholder_dob,
                      :relationship_to_patient,
                      :status]
        )
      end

      ##
      # Attaches uploaded images to the insurance card
      #
      def attach_images
        if params.dig(:insurance, :front_image).present?
          @insurance_card.front_image.attach(params[:insurance][:front_image])
        end

        return if params.dig(:insurance, :back_image).blank?

        @insurance_card.back_image.attach(params[:insurance][:back_image])
      end

      ##
      # Triggers OCR job if images are attached and payment method is insurance
      #
      def trigger_ocr_if_needed
        return unless @insurance_card.has_insurance? && @insurance_card.has_images?

        ExtractInsuranceJob.perform_later(@insurance_card.id)
      end

      ##
      # Serializes insurance card to JSON
      #
      # @param card [InsuranceCard] The card to serialize
      # @return [Hash] Serialized card data
      #
      def serialize_card(card)
        InsuranceCardSerializer.new(card).serializable_hash[:data][:attributes]
      end
    end
  end
end

