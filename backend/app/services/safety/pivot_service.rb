# frozen_string_literal: true

##
# Safety::PivotService
#
# Handles safety pivot operations when crisis is detected.
# Manages crisis event logging, conversation pausing, and safety responses.
#
# @example
#   service = Safety::PivotService.new(conversation)
#   result = service.initiate_pivot(crisis_event)
#
module Safety
  class PivotService
    attr_reader :conversation, :user

    ##
    # Initializes the pivot service
    #
    # @param conversation [Conversation] The current conversation
    #
    def initialize(conversation)
      @conversation = conversation
      @user = conversation.user
    end

    ##
    # Initiates a safety pivot
    #
    # @param crisis_event [CrisisEvent] The crisis event that triggered the pivot
    # @return [Hash] Pivot result with resources and actions
    #
    def initiate_pivot(crisis_event)
      # Pause the conversation
      conversation.pause_for_crisis!

      # Mark that safety pivot was shown
      crisis_event.record_safety_pivot_shown!

      # Build response with resources
      {
        success: true,
        pivot_type: determine_pivot_type(crisis_event),
        resources: primary_resources,
        secondary_resources: secondary_resources,
        message: build_safety_message(crisis_event),
        conversation_status: 'crisis_paused',
        crisis_event_id: crisis_event.id
      }
    end

    ##
    # Records user response to safety pivot
    #
    # @param crisis_event [CrisisEvent] The crisis event
    # @param response [String] User's response ('safe', 'need_help', 'exit')
    # @return [Hash] Result of recording response
    #
    def record_user_response(crisis_event, response)
      crisis_event.update!(user_response: response)

      case response
      when 'safe'
        handle_safe_response(crisis_event)
      when 'need_help'
        handle_need_help_response(crisis_event)
      when 'exit'
        handle_exit_response(crisis_event)
      else
        { success: false, error: 'Unknown response type' }
      end
    end

    ##
    # Resumes conversation after safety check
    #
    # @return [Hash] Result of resuming
    #
    def resume_conversation
      return { success: false, error: 'No unresolved crisis' } unless conversation.crisis_paused?

      conversation.resume!

      {
        success: true,
        message: 'Conversation resumed',
        conversation_status: 'active'
      }
    end

    ##
    # Gets primary crisis resources
    #
    # @return [Array<Hash>] Primary resources
    #
    def primary_resources
      [
        {
          id: '988-lifeline',
          name: '988 Suicide & Crisis Lifeline',
          description: 'Free, confidential support for people in distress',
          phone: '988',
          text: '988',
          available: '24/7',
          type: 'hotline'
        },
        {
          id: 'crisis-text',
          name: 'Crisis Text Line',
          description: 'Text with a trained crisis counselor',
          text: 'Text HOME to 741741',
          available: '24/7',
          type: 'text'
        },
        {
          id: '911',
          name: 'Emergency Services',
          description: 'For immediate danger or medical emergency',
          phone: '911',
          available: '24/7',
          type: 'emergency'
        }
      ]
    end

    ##
    # Gets secondary crisis resources
    #
    # @return [Array<Hash>] Secondary resources
    #
    def secondary_resources
      [
        {
          id: 'trevor-project',
          name: 'The Trevor Project',
          description: 'For LGBTQ+ young people',
          phone: '1-866-488-7386',
          text: 'Text START to 678-678',
          available: '24/7',
          type: 'hotline'
        },
        {
          id: 'childhelp',
          name: 'Childhelp National Child Abuse Hotline',
          description: 'Help for child abuse situations',
          phone: '1-800-422-4453',
          available: '24/7',
          type: 'hotline'
        }
      ]
    end

    private

    ##
    # Determines pivot type based on crisis severity
    #
    def determine_pivot_type(crisis_event)
      case crisis_event.risk_level
      when 'critical'
        'full_screen'
      when 'high'
        'overlay'
      else
        'inline'
      end
    end

    ##
    # Builds safety message based on crisis event
    #
    def build_safety_message(crisis_event)
      case crisis_event.risk_level
      when 'critical'
        "I hear you, and I want you to know that what you're feeling matters. " \
        "Right now, I want to make sure you're safe."
      when 'high'
        'Thank you for sharing that with me. Your feelings are valid, and ' \
        'there are people who want to help.'
      else
        'I noticed you might be going through a difficult time. ' \
        'Remember, support is always available.'
      end
    end

    ##
    # Handles user indicating they are safe
    #
    def handle_safe_response(_crisis_event)
      # Resume conversation
      conversation.resume!

      {
        success: true,
        action: 'continue',
        message: 'Thank you for letting us know. We can continue when you\'re ready.',
        conversation_status: 'active'
      }
    end

    ##
    # Handles user indicating they need help
    #
    def handle_need_help_response(crisis_event)
      # Keep conversation paused, log for clinical review
      crisis_event.update!(context: crisis_event.context.merge(needs_follow_up: true))

      {
        success: true,
        action: 'show_resources',
        message: 'We encourage you to reach out to one of these resources. ' \
                 'You don\'t have to go through this alone.',
        resources: primary_resources,
        conversation_status: 'crisis_paused'
      }
    end

    ##
    # Handles user choosing to exit
    #
    def handle_exit_response(_crisis_event)
      conversation.update!(status: 'abandoned')

      {
        success: true,
        action: 'exit',
        message: 'Your progress has been saved. You can return anytime. ' \
                 'Take care of yourself.',
        conversation_status: 'abandoned'
      }
    end
  end
end
