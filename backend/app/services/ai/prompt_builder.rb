# frozen_string_literal: true

##
# Ai::PromptBuilder Service
#
# Builds context-aware prompts for the AI screener chat.
# Loads prompt templates and customizes them based on screener type and context.
#
# @example
#   builder = Ai::PromptBuilder.new(screener_type: 'phq9a', user_type: 'minor')
#   system_prompt = builder.build_system_prompt
#
module Ai
  class PromptBuilder
    # Screener-specific context files
    SCREENER_CONTEXTS = {
      'psc17' => 'psc17_context.txt',
      'phq9a' => 'phq9a_context.txt',
      'scared' => 'scared_context.txt'
    }.freeze

    # Available user types
    USER_TYPES = ['minor', 'parent', 'friend'].freeze

    attr_reader :screener_type, :user_type, :current_question, :conversation_context

    ##
    # Initializes the prompt builder
    #
    # @param screener_type [String] Type of screener (psc17, phq9a, scared)
    # @param user_type [String] Type of user (minor, parent, friend)
    # @param current_question [Hash] Current question being asked (optional)
    # @param conversation_context [Hash] Additional context (optional)
    #
    def initialize(screener_type:, user_type: 'parent', current_question: nil, conversation_context: {})
      @screener_type = screener_type
      @user_type = user_type
      @current_question = current_question
      @conversation_context = conversation_context
    end

    ##
    # Builds the complete system prompt
    #
    # @return [String] Full system prompt
    #
    def build_system_prompt
      [
        base_system_prompt,
        screener_context_prompt,
        user_type_instructions,
        response_format_instructions,
        safety_instructions
      ].compact.join("\n\n")
    end

    ##
    # Builds the question prompt for a specific question
    #
    # @param question [Hash] Question data with :id, :text, :order
    # @param questions_remaining [Integer] Number of questions left
    # @return [String] Question-specific prompt
    #
    def build_question_prompt(question:, questions_remaining:)
      <<~PROMPT
        ## Current Question
        Question #{question[:order]} of #{total_questions}: "#{question[:text]}"

        Ask this question in a conversational, empathetic way. Adapt your phrasing based on the user type (#{user_type}).
        #{'We are nearing the end of the assessment.' if questions_remaining <= 3}
      PROMPT
    end

    ##
    # Builds extraction prompt for parsing user response
    #
    # @param user_response [String] The user's response text
    # @param question [Hash] The question being answered
    # @return [String] Extraction prompt
    #
    def build_extraction_prompt(user_response:, question:)
      <<~PROMPT
        Extract a structured response from this user input.

        Question: "#{question[:text]}"
        User Response: "#{user_response}"

        Response Options:
        #{response_options_for_screener}

        Determine which response option best matches the user's answer. If unclear, return null for extracted_value.
      PROMPT
    end

    private

    ##
    # Loads and returns the base system prompt
    #
    def base_system_prompt
      load_prompt_file('screener_system.txt')
    end

    ##
    # Loads screener-specific context
    #
    def screener_context_prompt
      context_file = SCREENER_CONTEXTS[screener_type]
      return nil unless context_file

      load_prompt_file(context_file)
    end

    ##
    # Generates user-type specific instructions
    #
    def user_type_instructions
      case user_type
      when 'minor'
        <<~INSTRUCTIONS
          ## User Type: Minor (Teen)
          - Speak directly to the teen using "you" language
          - Use age-appropriate language but avoid being condescending
          - Acknowledge that talking about feelings can be hard
          - Validate their experiences without minimizing
        INSTRUCTIONS
      when 'parent'
        <<~INSTRUCTIONS
          ## User Type: Parent
          - Ask about the child using "your child" language
          - Acknowledge the parent's concern and care
          - Help them reflect on their child's behavior objectively
          - Be supportive of their parenting journey
        INSTRUCTIONS
      when 'friend'
        <<~INSTRUCTIONS
          ## User Type: Friend
          - Ask about their friend's experiences
          - Acknowledge their care and concern for their friend
          - Help them think about observable behaviors
          - Encourage them while setting appropriate boundaries
        INSTRUCTIONS
      else
        ''
      end
    end

    ##
    # Instructions for response format
    #
    def response_format_instructions
      <<~INSTRUCTIONS
        ## Response Guidelines
        - Keep responses concise (1-3 sentences typically)
        - Ask ONE question at a time
        - Use warm, supportive language
        - Avoid clinical jargon unless explaining
        - Acknowledge emotions before asking next question
        - Don't repeat the exact question text - rephrase conversationally
      INSTRUCTIONS
    end

    ##
    # Safety-related instructions
    #
    def safety_instructions
      <<~INSTRUCTIONS
        ## Safety Protocol
        - Monitor responses for crisis indicators (self-harm, suicide, abuse)
        - If crisis language is detected, respond with empathy first
        - Never ignore safety concerns - acknowledge and provide resources
        - For critical risk, transition conversation to safety mode
      INSTRUCTIONS
    end

    ##
    # Returns response options based on screener type
    #
    def response_options_for_screener
      case screener_type
      when 'psc17'
        '0 = Never, 1 = Sometimes, 2 = Often'
      when 'phq9a'
        '0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day'
      when 'scared'
        '0 = Not true/hardly ever, 1 = Somewhat/sometimes true, 2 = Very/often true'
      else
        '0 = Never, 1 = Sometimes, 2 = Often'
      end
    end

    ##
    # Returns total questions for current screener
    #
    def total_questions
      case screener_type
      when 'psc17' then 17
      when 'phq9a' then 9
      when 'scared' then 5
      else 17
      end
    end

    ##
    # Loads a prompt file from the prompts directory
    #
    # @param filename [String] Name of the file to load
    # @return [String, nil] File contents or nil if not found
    #
    def load_prompt_file(filename)
      path = Rails.root.join('lib', 'prompts', filename)
      return nil unless File.exist?(path)

      File.read(path)
    rescue StandardError => e
      Rails.logger.error "[PromptBuilder] Failed to load #{filename}: #{e.message}"
      nil
    end
  end
end
