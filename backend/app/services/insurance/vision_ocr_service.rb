# frozen_string_literal: true

##
# Insurance::VisionOcrService
#
# Extracts insurance card information using OpenAI GPT-4 Vision.
# Sends card images to the API and parses structured extraction results.
#
# @see InsuranceCard model
# @see ExtractInsuranceJob
# @see _docs/phases/phase-3-insurance-matching.md
#
# @example Extracting from an insurance card
#   service = Insurance::VisionOcrService.new(insurance_card)
#   result = service.extract
#   # => { provider: 'Blue Cross', member_id: 'ABC123', ... }
#
module Insurance
  class VisionOcrService
    # OpenAI model to use for vision tasks
    VISION_MODEL = 'gpt-4o'

    # Maximum tokens for response
    MAX_TOKENS = 1000

    # Extraction prompt template
    EXTRACTION_PROMPT = <<~PROMPT
      You are an expert at extracting information from insurance cards.
      Analyze this insurance card image and extract the following information.
      Return ONLY a valid JSON object with these fields (use null for missing values):

      {
        "provider": "Insurance company name (e.g., Blue Cross Blue Shield, Aetna, UnitedHealthcare)",
        "plan_name": "Plan name if visible (e.g., PPO, HMO, Gold Plan)",
        "member_id": "Member ID / Subscriber ID number",
        "group_number": "Group number",
        "policyholder_name": "Name of the policyholder / subscriber",
        "bin_number": "BIN number if visible (pharmacy cards)",
        "pcn": "PCN if visible (pharmacy cards)",
        "customer_service_phone": "Customer service phone number if visible",
        "confidence": "Your confidence level from 0.0 to 1.0 that the extraction is accurate"
      }

      Important:
      - Extract EXACTLY what you see, do not infer or guess
      - Member ID and Group Number are the most critical fields
      - If text is unclear or partially visible, include what you can read with [unclear] marker
      - Return valid JSON only, no markdown formatting or explanations
    PROMPT

    ##
    # Initializes the OCR service
    #
    # @param insurance_card [InsuranceCard] The card to extract from
    #
    def initialize(insurance_card)
      @insurance_card = insurance_card
      @client = OpenAI::Client.new
    end

    ##
    # Performs OCR extraction on the insurance card images
    #
    # @return [Hash] Extracted insurance information
    # @raise [ExtractionError] If extraction fails
    #
    def extract
      validate_images!

      # Build messages with images
      messages = build_messages

      # Call OpenAI Vision API
      response = @client.chat(
        parameters: {
          model: VISION_MODEL,
          messages: messages,
          max_tokens: MAX_TOKENS,
          temperature: 0.1 # Low temperature for consistent extraction
        }
      )

      # Parse and return the extraction result
      parse_response(response)
    rescue OpenAI::Error => e
      Rails.logger.error("[VisionOcrService] OpenAI API error: #{e.message}")
      raise ExtractionError, "Failed to process image: #{e.message}"
    rescue JSON::ParserError => e
      Rails.logger.error("[VisionOcrService] JSON parse error: #{e.message}")
      raise ExtractionError, 'Failed to parse extraction results'
    end

    ##
    # Custom error class for extraction failures
    #
    class ExtractionError < StandardError; end

    private

    ##
    # Validates that required images are attached
    #
    # @raise [ExtractionError] If no images attached
    #
    def validate_images!
      return if @insurance_card.front_image.attached?

      raise ExtractionError, 'No insurance card image attached'
    end

    ##
    # Builds the messages array for the Vision API
    #
    # @return [Array<Hash>] Messages with image content
    #
    def build_messages
      content = [
        { type: 'text', text: EXTRACTION_PROMPT }
      ]

      # Add front image
      if @insurance_card.front_image.attached?
        content << build_image_content(@insurance_card.front_image, 'Front of card')
      end

      # Add back image if present
      content << build_image_content(@insurance_card.back_image, 'Back of card') if @insurance_card.back_image.attached?

      [
        {
          role: 'user',
          content: content
        }
      ]
    end

    ##
    # Builds image content block for API
    #
    # @param attachment [ActiveStorage::Attached] The image attachment
    # @param label [String] Description of the image
    # @return [Hash] Image content block
    #
    def build_image_content(attachment, _label)
      # Get base64 encoded image
      base64_image = encode_image(attachment)
      content_type = attachment.content_type

      {
        type: 'image_url',
        image_url: {
          url: "data:#{content_type};base64,#{base64_image}",
          detail: 'high' # Use high detail for text extraction
        }
      }
    end

    ##
    # Encodes an image attachment to base64
    #
    # @param attachment [ActiveStorage::Attached] The image to encode
    # @return [String] Base64 encoded image
    #
    def encode_image(attachment)
      Base64.strict_encode64(attachment.download)
    end

    ##
    # Parses the API response into structured data
    #
    # @param response [Hash] OpenAI API response
    # @return [Hash] Parsed extraction data
    #
    def parse_response(response)
      content = response.dig('choices', 0, 'message', 'content')

      return empty_extraction if content.blank?

      # Clean up the response (remove markdown code blocks if present)
      json_content = content.gsub(/```json\n?/, '').gsub(/```\n?/, '').strip

      # Parse JSON response
      parsed = JSON.parse(json_content, symbolize_names: true)

      # Normalize and validate the extraction
      normalize_extraction(parsed)
    end

    ##
    # Normalizes extracted data to consistent format
    #
    # @param data [Hash] Raw extraction data
    # @return [Hash] Normalized extraction
    #
    def normalize_extraction(data)
      {
        provider: clean_string(data[:provider]),
        plan_name: clean_string(data[:plan_name]),
        member_id: clean_string(data[:member_id]),
        group_number: clean_string(data[:group_number]),
        policyholder_name: clean_string(data[:policyholder_name]),
        bin_number: clean_string(data[:bin_number]),
        pcn: clean_string(data[:pcn]),
        customer_service_phone: clean_string(data[:customer_service_phone]),
        confidence: data[:confidence].to_f,
        extracted_at: Time.current.iso8601
      }
    end

    ##
    # Cleans a string value from extraction
    #
    # @param value [String, nil] Value to clean
    # @return [String, nil] Cleaned value
    #
    def clean_string(value)
      return nil if value.blank? || value == 'null'

      value.to_s.strip.presence
    end

    ##
    # Returns empty extraction result
    #
    # @return [Hash] Empty extraction with null values
    #
    def empty_extraction
      {
        provider: nil,
        plan_name: nil,
        member_id: nil,
        group_number: nil,
        policyholder_name: nil,
        confidence: 0.0,
        extracted_at: Time.current.iso8601,
        error: 'No content extracted'
      }
    end
  end
end
