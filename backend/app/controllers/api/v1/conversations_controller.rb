# frozen_string_literal: true

##
# API::V1::ConversationsController
#
# Handles conversation lifecycle for AI-administered screeners.
# Creates and manages chat conversations linked to assessments.
#
# @see Conversation model
#
module Api
  module V1
    class ConversationsController < ApplicationController
      before_action :authenticate_user!, except: [:create]
      before_action :set_conversation, only: [:show]

      ##
      # GET /api/v1/conversations/:id
      #
      # Returns conversation details with message history.
      #
      # @return [JSON] Conversation with messages
      #
      def show
        authorize @conversation, policy_class: ConversationPolicy

        render json: {
          success: true,
          data: serialize_conversation(@conversation)
        }
      end

      ##
      # POST /api/v1/conversations
      #
      # Creates a new conversation for an assessment.
      #
      # @param assessment_id [UUID] Required - assessment to link conversation to
      # @param screener_type [String] Optional - screener type (defaults to assessment's type)
      #
      # @return [JSON] Created conversation
      #
      def create
        assessment = Assessment.find(params[:assessment_id])
        user = current_user || assessment.user

        @conversation = Conversation.new(
          assessment: assessment,
          user: user,
          screener_type: params[:screener_type] || assessment.screener_type,
          status: 'active',
          metadata: {
            user_type: user&.user_type,
            started_at: Time.current.iso8601
          }
        )

        if @conversation.save
          # Generate initial greeting
          chat_service = AI::ScreenerChatService.new(@conversation)
          greeting = chat_service.generate_greeting

          render json: {
            success: true,
            data: serialize_conversation(@conversation),
            initial_message: greeting
          }, status: :created
        else
          render json: {
            success: false,
            errors: @conversation.errors.full_messages
          }, status: :unprocessable_content
        end
      end

      private

      def set_conversation
        @conversation = Conversation.find(params[:id])
      end

      def serialize_conversation(conversation)
        {
          id: conversation.id,
          assessment_id: conversation.assessment_id,
          screener_type: conversation.screener_type,
          status: conversation.status,
          questions_completed: conversation.questions_completed,
          total_questions: conversation.total_questions,
          completion_percentage: conversation.completion_percentage,
          created_at: conversation.created_at,
          updated_at: conversation.updated_at,
          messages: conversation.messages.kept.by_sequence.map do |msg|
            {
              id: msg.id,
              sender: msg.sender,
              content: msg.content,
              risk_level: msg.risk_level,
              created_at: msg.created_at
            }
          end
        }
      end

      def conversation_params
        params.permit(:assessment_id, :screener_type)
      end
    end
  end
end
