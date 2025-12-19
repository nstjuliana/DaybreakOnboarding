# frozen_string_literal: true

##
# AI::ConversationMemory Service
#
# Manages conversation history for AI chat sessions.
# Provides formatted message history for OpenAI API calls.
#
# @example
#   memory = AI::ConversationMemory.new(conversation)
#   messages = memory.to_openai_messages
#
module AI
  class ConversationMemory
    # Maximum messages to include in context (to manage token limits)
    MAX_CONTEXT_MESSAGES = 20

    # Maximum tokens estimate per message (rough heuristic)
    TOKENS_PER_MESSAGE_ESTIMATE = 100

    attr_reader :conversation

    ##
    # Initializes conversation memory
    #
    # @param conversation [Conversation] The conversation to manage
    #
    def initialize(conversation)
      @conversation = conversation
    end

    ##
    # Converts conversation history to OpenAI message format
    #
    # @param include_system [Boolean] Whether to include system message
    # @param system_prompt [String] System prompt to use (if include_system)
    # @return [Array<Hash>] Messages in OpenAI format
    #
    def to_openai_messages(include_system: false, system_prompt: nil)
      messages = []

      # Add system message if requested
      messages << { role: 'system', content: system_prompt } if include_system && system_prompt.present?

      # Add conversation history
      recent_messages.each do |message|
        messages << message.to_openai_format
      end

      messages
    end

    ##
    # Gets recent messages for context window
    #
    # @return [Array<Message>] Recent messages
    #
    def recent_messages
      conversation.messages
        .kept
        .by_sequence
        .limit(MAX_CONTEXT_MESSAGES)
    end

    ##
    # Adds a user message to the conversation
    #
    # @param content [String] Message content
    # @return [Message] Created message
    #
    def add_user_message(content)
      conversation.messages.create!(
        sender: 'user',
        content: content,
        role: 'user',
        sequence_number: conversation.next_sequence_number
      )
    end

    ##
    # Adds an AI message to the conversation
    #
    # @param content [String] Message content
    # @param extracted_response [Hash] Optional extracted response data
    # @param crisis_flags [Hash] Optional crisis flags
    # @param risk_level [String] Optional risk level
    # @return [Message] Created message
    #
    def add_ai_message(content, extracted_response: {}, crisis_flags: {}, risk_level: 'none')
      conversation.messages.create!(
        sender: 'ai',
        content: content,
        role: 'assistant',
        sequence_number: conversation.next_sequence_number,
        extracted_response: extracted_response,
        crisis_flags: crisis_flags,
        risk_level: risk_level
      )
    end

    ##
    # Adds a system message to the conversation
    #
    # @param content [String] Message content
    # @return [Message] Created message
    #
    def add_system_message(content)
      conversation.messages.create!(
        sender: 'system',
        content: content,
        role: 'system',
        sequence_number: conversation.next_sequence_number
      )
    end

    ##
    # Gets the last user message
    #
    # @return [Message, nil] Last user message
    #
    def last_user_message
      conversation.messages.from_user.by_sequence.last
    end

    ##
    # Gets the last AI message
    #
    # @return [Message, nil] Last AI message
    #
    def last_ai_message
      conversation.messages.from_ai.by_sequence.last
    end

    ##
    # Counts total messages in conversation
    #
    # @return [Integer] Message count
    #
    def message_count
      conversation.messages.count
    end

    ##
    # Estimates token count for current context
    # This is a rough estimate - actual token count varies
    #
    # @return [Integer] Estimated token count
    #
    def estimated_token_count
      recent_messages.sum { |m| estimate_tokens(m.content) }
    end

    ##
    # Gets a summary of the conversation for context
    #
    # @return [Hash] Conversation summary
    #
    def summary
      {
        conversation_id: conversation.id,
        screener_type: conversation.screener_type,
        message_count: message_count,
        questions_completed: conversation.questions_completed,
        has_crisis_events: conversation.crisis_events.any?,
        last_activity: conversation.updated_at
      }
    end

    ##
    # Gets extracted responses so far
    #
    # @return [Hash] Question ID => extracted value
    #
    def extracted_responses
      conversation.screener_responses.each_with_object({}) do |response, hash|
        hash[response.question_id] = response.extracted_value
      end
    end

    ##
    # Checks if a question has been answered
    #
    # @param question_id [String] Question ID to check
    # @return [Boolean] True if answered
    #
    def question_answered?(question_id)
      conversation.screener_responses.exists?(question_id: question_id)
    end

    ##
    # Gets unanswered questions
    #
    # @param all_question_ids [Array<String>] All question IDs for screener
    # @return [Array<String>] Unanswered question IDs
    #
    def unanswered_questions(all_question_ids)
      answered = conversation.screener_responses.pluck(:question_id)
      all_question_ids - answered
    end

    private

    ##
    # Estimates token count for text
    # Rough estimate: ~4 characters per token
    #
    # @param text [String] Text to estimate
    # @return [Integer] Estimated tokens
    #
    def estimate_tokens(text)
      return 0 if text.blank?

      (text.length / 4.0).ceil
    end
  end
end
