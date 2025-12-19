# frozen_string_literal: true

##
# ProcessChatJob
#
# Background job for processing chat messages asynchronously.
# Used for non-streaming message processing and batch operations.
#
# @example
#   ProcessChatJob.perform_later(conversation_id: conv.id, content: "Hello")
#
class ProcessChatJob < ApplicationJob
  queue_as :chat

  # Retry configuration
  retry_on StandardError, wait: :exponentially_longer, attempts: 3
  discard_on ActiveRecord::RecordNotFound

  ##
  # Performs the chat processing
  #
  # @param conversation_id [String] UUID of the conversation
  # @param content [String] User message content
  # @param options [Hash] Additional options
  #
  def perform(conversation_id:, content:, options: {})
    conversation = Conversation.find(conversation_id)

    # Skip if conversation is not active
    unless conversation.active? || conversation.crisis_paused?
      Rails.logger.info "[ProcessChatJob] Skipping - conversation #{conversation_id} not active"
      return
    end

    chat_service = AI::ScreenerChatService.new(conversation)
    result = chat_service.process_message(content)

    # Handle crisis detection
    handle_crisis_detected(conversation, result) if result[:show_safety_pivot]

    # Broadcast result if ActionCable is configured
    broadcast_result(conversation, result) if defined?(ActionCable)

    # Schedule analysis if complete
    AnalyzeAssessmentJob.perform_later(assessment_id: conversation.assessment_id) if result[:is_complete]

    result
  rescue AI::CrisisDetector::CriticalRiskError => e
    # Critical crisis - ensure safety pivot is shown
    handle_critical_crisis(conversation, e.message)
  end

  private

  ##
  # Handles crisis detection result
  #
  def handle_crisis_detected(conversation, result)
    Rails.logger.warn "[ProcessChatJob] Crisis detected in conversation #{conversation.id}"

    # Notify staff if configured
    notify_staff(conversation) if should_notify_staff?(result)
  end

  ##
  # Handles critical crisis situation
  #
  def handle_critical_crisis(conversation, message)
    Rails.logger.error "[ProcessChatJob] CRITICAL crisis in conversation #{conversation.id}: #{message}"

    # Ensure conversation is paused
    conversation.pause_for_crisis! unless conversation.crisis_paused?

    # Log critical event
    conversation.crisis_events.create!(
      user: conversation.user,
      risk_level: 'critical',
      trigger_content: message,
      detection_method: 'job',
      context: { job_triggered: true }
    )
  end

  ##
  # Broadcasts result via ActionCable
  #
  def broadcast_result(conversation, result)
    # ActionCable broadcast if configured
    # ConversationChannel.broadcast_to(conversation, result)
  end

  ##
  # Determines if staff should be notified
  #
  def should_notify_staff?(result)
    result[:risk_level] == 'critical' ||
      (result[:crisis_flags] && result[:crisis_flags][:has_suicide_ideation])
  end

  ##
  # Notifies staff of crisis
  #
  def notify_staff(conversation)
    # Implementation depends on notification system
    # Could send email, Slack notification, etc.
    Rails.logger.info "[ProcessChatJob] Staff notification triggered for conversation #{conversation.id}"
  end
end
