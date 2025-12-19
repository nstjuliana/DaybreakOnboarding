# frozen_string_literal: true

##
# AI::ScreenerChatService
#
# Main orchestrator for AI-administered screener conversations.
# Handles message processing, response generation, and conversation flow.
#
# @example
#   service = AI::ScreenerChatService.new(conversation)
#   response = service.process_message("I feel sad most days")
#   # => { content: "...", risk_level: "low", extracted: {...} }
#
module AI
  class ScreenerChatService
    # Default model for chat
    DEFAULT_MODEL = 'gpt-4o'

    # Temperature for responses (lower = more consistent)
    DEFAULT_TEMPERATURE = 0.4

    # Maximum tokens for response
    MAX_TOKENS = 500

    attr_reader :conversation, :memory, :prompt_builder

    ##
    # Initializes the chat service
    #
    # @param conversation [Conversation] The conversation to manage
    #
    def initialize(conversation)
      @conversation = conversation
      @memory = ConversationMemory.new(conversation)
      @prompt_builder = PromptBuilder.new(
        screener_type: conversation.screener_type,
        user_type: conversation.assessment&.user&.user_type || 'parent'
      )
    end

    ##
    # Processes a user message and generates AI response
    #
    # @param content [String] User message content
    # @param stream [Boolean] Whether to stream response (default: false)
    # @yield [String] Yields chunks if streaming
    # @return [Hash] Response data including content, risk_level, extracted
    #
    def process_message(content, stream: false, &)
      # Add user message to memory
      user_message = memory.add_user_message(content)

      # Check for crisis indicators
      crisis_result = detect_crisis(content)

      # If critical crisis, return safety response immediately
      return handle_critical_crisis(user_message, crisis_result) if crisis_result[:risk_level] == 'critical'

      # Generate AI response
      ai_content = if stream && block_given?
                     generate_streaming_response(&)
                   else
                     generate_response
                   end

      # Extract structured response from user message
      extracted = extract_response(content)

      # Save extracted response if valid
      save_extracted_response(user_message, extracted) if extracted[:extracted_value].present?

      # Save AI message
      ai_message = memory.add_ai_message(
        ai_content,
        crisis_flags: crisis_result[:flags],
        risk_level: crisis_result[:risk_level]
      )

      # Log crisis event if detected
      log_crisis_event(user_message, crisis_result) if crisis_result[:risk_level] != 'none'

      # Update conversation progress
      update_progress

      {
        content: ai_content,
        message_id: ai_message.id,
        risk_level: crisis_result[:risk_level],
        crisis_flags: crisis_result[:flags],
        extracted: extracted,
        questions_completed: conversation.questions_completed,
        is_complete: conversation.all_questions_answered?
      }
    end

    ##
    # Generates the initial greeting message
    #
    # @return [Hash] Initial message data
    #
    def generate_greeting
      greeting = build_greeting_message

      ai_message = memory.add_ai_message(greeting)

      {
        content: greeting,
        message_id: ai_message.id,
        risk_level: 'none'
      }
    end

    ##
    # Generates the next question in the screener
    #
    # @return [Hash, nil] Question data or nil if complete
    #
    def next_question
      unanswered = memory.unanswered_questions(all_question_ids)
      return nil if unanswered.empty?

      question_id = unanswered.first
      question_data = get_question_data(question_id)

      {
        question_id: question_id,
        text: question_data[:text],
        order: question_data[:order],
        questions_remaining: unanswered.length
      }
    end

    ##
    # Checks if the screener is complete
    #
    # @return [Boolean] True if all questions answered
    #
    def complete?
      conversation.all_questions_answered?
    end

    private

    ##
    # Generates AI response using OpenAI
    #
    # @return [String] Generated response content
    #
    def generate_response
      return fallback_response unless OpenAIClient.configured?

      messages = memory.to_openai_messages(
        include_system: true,
        system_prompt: prompt_builder.build_system_prompt
      )

      # Add question context if we're asking a question
      next_q = next_question
      if next_q
        question_prompt = prompt_builder.build_question_prompt(
          question: next_q,
          questions_remaining: next_q[:questions_remaining]
        )
        messages << { role: 'system', content: question_prompt }
      end

      response = OpenAIClient.client.chat(
        parameters: {
          model: DEFAULT_MODEL,
          messages: messages,
          temperature: DEFAULT_TEMPERATURE,
          max_tokens: MAX_TOKENS
        }
      )

      response.dig('choices', 0, 'message', 'content') || fallback_response
    rescue StandardError => e
      Rails.logger.error "[ScreenerChatService] OpenAI error: #{e.message}"
      fallback_response
    end

    ##
    # Generates streaming AI response
    #
    # @yield [String] Yields content chunks
    # @return [String] Complete response content
    #
    def generate_streaming_response
      return fallback_response unless OpenAIClient.configured?

      messages = memory.to_openai_messages(
        include_system: true,
        system_prompt: prompt_builder.build_system_prompt
      )

      full_response = ''

      OpenAIClient.client.chat(
        parameters: {
          model: DEFAULT_MODEL,
          messages: messages,
          temperature: DEFAULT_TEMPERATURE,
          max_tokens: MAX_TOKENS,
          stream: proc do |chunk, _bytesize|
            content = chunk.dig('choices', 0, 'delta', 'content')
            if content
              full_response += content
              yield(content)
            end
          end
        }
      )

      full_response.presence || fallback_response
    rescue StandardError => e
      Rails.logger.error "[ScreenerChatService] Streaming error: #{e.message}"
      fallback_response
    end

    ##
    # Detects crisis indicators in user message
    #
    # @param content [String] Message content to analyze
    # @return [Hash] Crisis detection result
    #
    def detect_crisis(content)
      # Delegate to CrisisDetector service
      AI::CrisisDetector.new.analyze(content)
    rescue StandardError => e
      Rails.logger.error "[ScreenerChatService] Crisis detection error: #{e.message}"
      { risk_level: 'none', flags: {}, matched_keywords: [] }
    end

    ##
    # Handles critical crisis detection
    #
    # @param user_message [Message] The user's message
    # @param crisis_result [Hash] Crisis detection result
    # @return [Hash] Safety response
    #
    def handle_critical_crisis(user_message, crisis_result)
      # Pause conversation for safety
      conversation.pause_for_crisis!

      # Log crisis event
      log_crisis_event(user_message, crisis_result)

      # Generate safety response
      safety_content = build_safety_response

      ai_message = memory.add_ai_message(
        safety_content,
        crisis_flags: crisis_result[:flags],
        risk_level: 'critical'
      )

      {
        content: safety_content,
        message_id: ai_message.id,
        risk_level: 'critical',
        crisis_flags: crisis_result[:flags],
        extracted: {},
        questions_completed: conversation.questions_completed,
        is_complete: false,
        show_safety_pivot: true
      }
    end

    ##
    # Extracts structured response from user content
    #
    # @param content [String] User response content
    # @return [Hash] Extracted response data
    #
    def extract_response(content)
      AI::ResponseExtractor.new(
        screener_type: conversation.screener_type
      ).extract(content, current_question: next_question)
    rescue StandardError => e
      Rails.logger.error "[ScreenerChatService] Extraction error: #{e.message}"
      { extracted_value: nil, confidence: 0.0 }
    end

    ##
    # Saves extracted response to database
    #
    # @param user_message [Message] The user's message
    # @param extracted [Hash] Extracted response data
    #
    def save_extracted_response(user_message, extracted)
      return if extracted[:question_id].blank?

      conversation.screener_responses.create!(
        message: user_message,
        question_id: extracted[:question_id],
        response_text: user_message.content,
        extracted_value: extracted[:extracted_value],
        confidence: extracted[:confidence] || 0.0,
        extraction_metadata: extracted[:metadata] || {}
      )

      # Update message with extracted data
      user_message.update!(extracted_response: extracted)
    end

    ##
    # Logs a crisis event to the database
    #
    # @param message [Message] The triggering message
    # @param crisis_result [Hash] Crisis detection result
    #
    def log_crisis_event(message, crisis_result)
      conversation.crisis_events.create!(
        message: message,
        user: conversation.user,
        risk_level: crisis_result[:risk_level],
        trigger_content: message.content,
        matched_keywords: crisis_result[:matched_keywords] || [],
        context: {
          screener_type: conversation.screener_type,
          questions_completed: conversation.questions_completed
        },
        detection_method: 'keyword'
      )
    end

    ##
    # Updates conversation progress
    #
    def update_progress
      completed_count = conversation.screener_responses.count
      conversation.update!(questions_completed: completed_count)

      # Mark complete if all questions answered
      conversation.complete! if conversation.all_questions_answered?
    end

    ##
    # Builds greeting message based on screener type
    #
    # @return [String] Greeting message
    #
    def build_greeting_message
      screener_name = case conversation.screener_type
                      when 'psc17' then 'brief wellness check'
                      when 'phq9a' then 'mood and feelings check-in'
                      when 'scared' then 'worry and anxiety check-in'
                      else 'wellness check'
                      end

      <<~GREETING.strip
        Hi there! 👋 I'm here to guide you through a #{screener_name}. This will help us understand how to best support you.

        I'll ask you some questions, and you can answer however feels most natural. There are no right or wrong answers.

        Ready to begin? Just let me know, and we'll get started.
      GREETING
    end

    ##
    # Builds safety response for critical crisis
    #
    # @return [String] Safety response message
    #
    def build_safety_response
      <<~SAFETY.strip
        I hear you, and I want you to know that what you're feeling matters. Thank you for sharing that with me.

        Right now, I want to make sure you're safe. If you're having thoughts of hurting yourself, please reach out to someone who can help:

        📞 **988 Suicide & Crisis Lifeline** - Call or text 988
        💬 **Crisis Text Line** - Text HOME to 741741
        🚨 **Emergency** - Call 911

        You don't have to go through this alone. Would you like to continue our conversation, or would you prefer to take a break?
      SAFETY
    end

    ##
    # Returns fallback response when AI is unavailable
    #
    # @return [String] Fallback response
    #
    def fallback_response
      'Thank you for sharing that. Let me think about how to respond... ' \
        "I'm having some technical difficulties right now. Could you try again in a moment?"
    end

    ##
    # Gets all question IDs for current screener
    #
    # @return [Array<String>] Question IDs
    #
    def all_question_ids
      case conversation.screener_type
      when 'psc17'
        (1..17).map { |n| "psc17_#{n}" }
      when 'phq9a'
        (1..9).map { |n| "phq9a_#{n}" }
      when 'scared'
        (1..5).map { |n| "scared_#{n}" }
      else
        []
      end
    end

    ##
    # Gets question data for a specific question ID
    #
    # @param question_id [String] Question ID
    # @return [Hash] Question data
    #
    def get_question_data(question_id)
      # This would typically load from a config or database
      # For now, return basic structure
      order = question_id.match(/(\d+)$/)[1].to_i

      {
        id: question_id,
        text: question_text_for(question_id),
        order: order
      }
    end

    ##
    # Gets question text for a specific question ID
    # Simplified version - in production, load from screener configs
    #
    # @param question_id [String] Question ID
    # @return [String] Question text
    #
    def question_text_for(question_id)
      # This is a simplified version
      # In production, load from YAML or database
      "Please answer question #{question_id}"
    end
  end
end
