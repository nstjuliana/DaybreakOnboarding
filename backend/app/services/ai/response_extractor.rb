# frozen_string_literal: true

##
# Ai::ResponseExtractor Service
#
# Extracts structured screener responses from conversational text.
# Uses OpenAI function calling for reliable extraction.
#
# @example
#   extractor = Ai::ResponseExtractor.new(screener_type: 'phq9a')
#   result = extractor.extract("I feel that way almost every day", current_question: {...})
#   # => { question_id: 'phq9a_1', extracted_value: 3, confidence: 0.95 }
#
module Ai
  class ResponseExtractor
    # Model for extraction (faster, cheaper than chat model)
    EXTRACTION_MODEL = 'gpt-4o-mini'

    # Temperature for extraction (very low for consistency)
    EXTRACTION_TEMPERATURE = 0.1

    attr_reader :screener_type

    ##
    # Initializes the extractor
    #
    # @param screener_type [String] Type of screener (psc17, phq9a, scared)
    #
    def initialize(screener_type:)
      @screener_type = screener_type
    end

    ##
    # Extracts structured response from user text
    #
    # @param text [String] User's response text
    # @param current_question [Hash] Question being answered (id, text, order)
    # @return [Hash] Extraction result
    #
    def extract(text, current_question: nil)
      return empty_result if text.blank?
      return rule_based_extract(text, current_question) unless OpenAIClient.configured?

      question_id = current_question&.dig(:question_id) || current_question&.dig(:id)

      # Try function calling extraction
      result = function_calling_extract(text, current_question)

      # Fallback to rule-based if function calling fails
      result = rule_based_extract(text, current_question) if result[:extracted_value].nil?

      # Add question_id if present
      result[:question_id] = question_id if question_id

      result
    rescue StandardError => e
      Rails.logger.error "[ResponseExtractor] Error: #{e.message}"
      rule_based_extract(text, current_question)
    end

    ##
    # Batch extracts responses from multiple texts
    #
    # @param texts [Array<Hash>] Array of { text:, question: } hashes
    # @return [Array<Hash>] Extraction results
    #
    def batch_extract(texts)
      texts.map do |item|
        extract(item[:text], current_question: item[:question])
      end
    end

    private

    ##
    # Extracts using OpenAI function calling
    #
    def function_calling_extract(text, question)
      response = OpenAIClient.client.chat(
        parameters: {
          model: EXTRACTION_MODEL,
          temperature: EXTRACTION_TEMPERATURE,
          messages: [
            { role: 'system', content: extraction_system_prompt },
            { role: 'user', content: build_extraction_prompt(text, question) }
          ],
          tools: [extraction_function],
          tool_choice: { type: 'function', function: { name: 'extract_response' } }
        }
      )

      parse_function_response(response)
    rescue StandardError => e
      Rails.logger.error "[ResponseExtractor] Function calling error: #{e.message}"
      { extracted_value: nil, confidence: 0.0, metadata: { error: e.message } }
    end

    ##
    # Parses the function calling response
    #
    def parse_function_response(response)
      tool_call = response.dig('choices', 0, 'message', 'tool_calls', 0)
      return empty_result unless tool_call

      arguments = JSON.parse(tool_call.dig('function', 'arguments'))

      {
        extracted_value: arguments['value'],
        confidence: arguments['confidence'] || 0.8,
        reasoning: arguments['reasoning'],
        metadata: {
          raw_response: arguments,
          model: EXTRACTION_MODEL
        }
      }
    rescue JSON::ParserError => e
      Rails.logger.error "[ResponseExtractor] JSON parse error: #{e.message}"
      empty_result
    end

    ##
    # Rule-based extraction fallback
    #
    def rule_based_extract(text, _question)
      normalized = text.downcase.strip

      # Get response options for this screener
      options = response_options

      # Try exact matches first
      options.each do |value, patterns|
        return match_result(value, 0.9) if patterns.any? { |p| normalized.include?(p) }

        # Try fuzzy matching
        patterns.each do |pattern|
          return match_result(value, 0.7) if fuzzy_match?(normalized, pattern)
        end
      end

      # Try numeric extraction
      if (match = normalized.match(/(\d)/))
        value = match[1].to_i
        return match_result(value, 0.6) if value <= max_value
      end

      # No match found
      {
        extracted_value: nil,
        confidence: 0.0,
        metadata: { method: 'rule_based', no_match: true }
      }
    end

    ##
    # Response options mapping for each screener
    #
    def response_options
      case screener_type
      when 'psc17'
        {
          0 => ['never', 'not', 'at', 'all', 'no', 'rarely', 'hardly'],
          1 => ['sometimes', 'occasionally', 'some', 'days', 'a', 'little', 'bit'],
          2 => ['often', 'frequently', 'a', 'lot', 'always', 'usually', 'every', 'day', 'most', 'days']
        }
      when 'phq9a'
        {
          0 => ['not', 'at', 'all', 'never', 'no', 'not', 'really'],
          1 => ['several days', 'a few days', 'sometimes', 'occasionally'],
          2 => ['more than half', 'most days', 'often', 'frequently', 'a lot'],
          3 => ['nearly every day', 'every day', 'always', 'constantly', 'all the time']
        }
      when 'scared'
        {
          0 => ['not true', 'hardly ever', 'never', 'no', 'not really'],
          1 => ['somewhat true', 'sometimes', 'a little', 'occasionally'],
          2 => ['very true', 'often', 'a lot', 'yes', 'definitely', 'always']
        }
      else
        { 0 => ['never', 'no'], 1 => ['sometimes'], 2 => ['often', 'yes'] }
      end
    end

    ##
    # Maximum value for this screener
    #
    def max_value
      screener_type == 'phq9a' ? 3 : 2
    end

    ##
    # Checks for fuzzy match
    #
    def fuzzy_match?(text, pattern)
      # Simple Levenshtein-like check
      words = text.split(/\s+/)
      words.any? do |word|
        word.start_with?(pattern[0..2]) || pattern.start_with?(word[0..2])
      end
    end

    ##
    # Builds match result
    #
    def match_result(value, confidence)
      {
        extracted_value: value,
        confidence: confidence,
        metadata: { method: 'rule_based' }
      }
    end

    ##
    # Empty result when no extraction possible
    #
    def empty_result
      { extracted_value: nil, confidence: 0.0, metadata: {} }
    end

    ##
    # System prompt for extraction
    #
    def extraction_system_prompt
      <<~PROMPT
        You are a response extraction system for mental health screeners.
        Your job is to extract a numeric value from a user's conversational response.

        For #{screener_type.upcase}:
        #{response_scale_description}

        Be conservative - only extract a value if you are confident about the match.
        If the response is ambiguous or unclear, return null for the value.
      PROMPT
    end

    ##
    # Description of response scale
    #
    def response_scale_description
      case screener_type
      when 'psc17'
        'Response scale: 0 = Never, 1 = Sometimes, 2 = Often'
      when 'phq9a'
        'Response scale: 0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day'
      when 'scared'
        'Response scale: 0 = Not true/Hardly ever, 1 = Somewhat true/Sometimes, 2 = Very true/Often'
      else
        'Response scale: 0-2'
      end
    end

    ##
    # Builds extraction prompt
    #
    def build_extraction_prompt(text, question)
      prompt = "User response: \"#{text}\""
      prompt += "\nQuestion: \"#{question[:text]}\"" if question
      prompt
    end

    ##
    # Function definition for extraction
    #
    def extraction_function
      {
        type: 'function',
        function: {
          name: 'extract_response',
          description: 'Extract a structured response from user text',
          parameters: {
            type: 'object',
            properties: {
              value: {
                type: ['integer', 'null'],
                description: "Extracted numeric value (0-#{max_value}) or null if unclear"
              },
              confidence: {
                type: 'number',
                description: 'Confidence score 0.0-1.0'
              },
              reasoning: {
                type: 'string',
                description: 'Brief explanation of extraction logic'
              }
            },
            required: ['value', 'confidence', 'reasoning']
          }
        }
      }
    end
  end
end
