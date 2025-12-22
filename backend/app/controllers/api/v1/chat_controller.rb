# frozen_string_literal: true

##
# API::V1::ChatController
#
# Handles chat message operations for AI-administered screeners.
# Supports both regular responses and SSE streaming.
#
# @see AI::ScreenerChatService
#
module Api
  module V1
    class ChatController < ApplicationController
      include ActionController::Live

      before_action :set_conversation
      before_action :validate_conversation_active, only: [:create, :stream]

      ##
      # POST /api/v1/conversations/:conversation_id/messages
      #
      # Sends a message and receives AI response.
      #
      # @param content [String] User message content
      #
      # @return [JSON] AI response with metadata
      #
      def create
        user_content = params[:content]

        if user_content.blank?
          return render json: {
            success: false,
            error: 'Message content is required'
          }, status: :unprocessable_content
        end

        chat_service = AI::ScreenerChatService.new(@conversation)
        result = chat_service.process_message(user_content)

        response_data = {
          success: true,
          data: {
            message: {
              id: result[:message_id],
              content: result[:content],
              sender: 'ai',
              risk_level: result[:risk_level]
            },
            conversation: {
              questions_completed: result[:questions_completed],
              is_complete: result[:is_complete]
            }
          }
        }

        # Add safety pivot flag if needed
        if result[:show_safety_pivot]
          response_data[:data][:show_safety_pivot] = true
          response_data[:data][:crisis_resources] = crisis_resources
        end

        render json: response_data
      rescue StandardError => e
        Rails.logger.error "[ChatController] Error: #{e.message}"
        render json: {
          success: false,
          error: 'Failed to process message'
        }, status: :internal_server_error
      end

      ##
      # GET /api/v1/conversations/:conversation_id/stream
      #
      # SSE endpoint for streaming AI responses.
      #
      # @param content [String] User message content (query param)
      #
      def stream
        user_content = params[:content]

        return render json: { error: 'Content required' }, status: :bad_request if user_content.blank?

        # Set SSE headers
        response.headers['Content-Type'] = 'text/event-stream'
        response.headers['Cache-Control'] = 'no-cache'
        response.headers['Connection'] = 'keep-alive'
        response.headers['X-Accel-Buffering'] = 'no'

        sse = SseRenderer.new(response.stream)

        begin
          chat_service = AI::ScreenerChatService.new(@conversation)

          # Send start event
          sse.write({ type: 'start' }, event: 'start')

          # Process with streaming
          result = chat_service.process_message(user_content, stream: true) do |chunk|
            sse.write_chunk(chunk)
          end

          # Send complete event with metadata
          sse.write_complete(
            message_id: result[:message_id],
            risk_level: result[:risk_level],
            questions_completed: result[:questions_completed],
            is_complete: result[:is_complete],
            show_safety_pivot: result[:show_safety_pivot] || false
          )
        rescue IOError, ActionController::Live::ClientDisconnected
          Rails.logger.debug '[ChatController] Client disconnected from stream'
        rescue StandardError => e
          Rails.logger.error "[ChatController] Stream error: #{e.message}"
          sse.write_error(e.message)
        ensure
          sse.close
        end
      end

      ##
      # POST /api/v1/conversations/:conversation_id/safety_response
      #
      # Records user's response to safety pivot.
      #
      # @param response [String] User response ('safe', 'need_help', 'exit')
      #
      def safety_response
        crisis_event = @conversation.crisis_events.unresolved.order(created_at: :desc).first

        unless crisis_event
          return render json: {
            success: false,
            error: 'No active crisis event'
          }, status: :not_found
        end

        pivot_service = Safety::PivotService.new(@conversation)
        result = pivot_service.record_user_response(crisis_event, params[:response])

        render json: {
          success: result[:success],
          data: result
        }
      end

      private

      def set_conversation
        @conversation = Conversation.find(params[:conversation_id])
      end

      def validate_conversation_active
        return if @conversation.active? || @conversation.crisis_paused?

        render json: {
          success: false,
          error: 'Conversation is not active'
        }, status: :unprocessable_content
      end

      def crisis_resources
        [
          {
            name: '988 Suicide & Crisis Lifeline',
            phone: '988',
            text: '988',
            available: '24/7'
          },
          {
            name: 'Crisis Text Line',
            text: 'Text HOME to 741741',
            available: '24/7'
          },
          {
            name: 'Emergency Services',
            phone: '911',
            available: '24/7'
          }
        ]
      end
    end
  end
end
