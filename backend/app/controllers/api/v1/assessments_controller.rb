# frozen_string_literal: true

##
# Api::V1::AssessmentsController
#
# Handles CRUD operations for mental health assessments.
# Supports creating, viewing, and updating screener responses.
#
# @see Assessment model
# @see _docs/user-flow.md Phase 2: Holistic Intake
#
module Api
  module V1
    class AssessmentsController < BaseController
      before_action :authenticate_user!, except: [:create]
      before_action :set_assessment, only: [:show, :update]

      ##
      # Returns an assessment by ID
      #
      # GET /api/v1/assessments/:id
      #
      # @return [JSON] Assessment data
      #
      def show
        authorize @assessment
        render_success(assessment_response(@assessment))
      end

      ##
      # Creates a new assessment
      #
      # POST /api/v1/assessments
      #
      # @param [String] screener_type Type of screener (psc17, phq9a, etc.)
      # @param [Hash] responses Question responses
      #
      # @return [JSON] Created assessment data
      #
      # @example Request
      #   POST /api/v1/assessments
      #   {
      #     "assessment": {
      #       "screener_type": "psc17",
      #       "responses": { "q1": 1, "q2": 2 }
      #     }
      #   }
      #
      def create
        assessment = Assessment.new(assessment_params)
        assessment.user = current_user if current_user
        assessment.status = 'in_progress'
        assessment.started_at = Time.current

        if assessment.save
          render_success(assessment_response(assessment), status: :created)
        else
          render_error(
            'Failed to create assessment',
            errors: assessment.errors.full_messages
          )
        end
      end

      ##
      # Updates an existing assessment
      #
      # PATCH /api/v1/assessments/:id
      #
      # @param [Hash] responses Updated question responses
      # @param [String] status Assessment status
      #
      # @return [JSON] Updated assessment data
      #
      def update
        authorize @assessment

        unless @assessment.editable?
          render_error('Assessment cannot be modified', status: :forbidden)
          return
        end

        # Merge new responses with existing
        if params[:assessment][:responses].present?
          merged_responses = @assessment.responses.merge(
            params[:assessment][:responses].to_unsafe_h
          )
          params[:assessment][:responses] = merged_responses
        end

        # Handle completion
        if params[:assessment][:status] == 'completed'
          params[:assessment][:completed_at] = Time.current

          # Calculate score if responses provided
          if @assessment.responses.present? || params[:assessment][:responses].present?
            score_result = calculate_score(@assessment, params[:assessment][:responses])
            params[:assessment][:score] = score_result[:score]
            params[:assessment][:severity] = score_result[:severity]
          end
        end

        if @assessment.update(assessment_update_params)
          render_success(assessment_response(@assessment))
        else
          render_error(
            'Failed to update assessment',
            errors: @assessment.errors.full_messages
          )
        end
      end

      private

      ##
      # Sets the assessment from params
      #
      def set_assessment
        @assessment = Assessment.find(params[:id])
      end

      ##
      # Permitted parameters for creating an assessment
      #
      def assessment_params
        params.expect(
          assessment: [:screener_type,
                       { responses: {} }]
        )
      end

      ##
      # Permitted parameters for updating an assessment
      #
      def assessment_update_params
        params.expect(
          assessment: [:status,
                       :score,
                       :severity,
                       :completed_at,
                       { responses: {} }]
        )
      end

      ##
      # Calculates score for PSC-17 screener
      #
      # @param assessment [Assessment] The assessment
      # @param new_responses [Hash] New responses being added
      # @return [Hash] Score and severity
      #
      def calculate_score(assessment, new_responses)
        responses = assessment.responses.merge(new_responses&.to_unsafe_h || {})
        total_score = responses.values.compact.sum

        severity = case total_score
                   when 0..7 then 'minimal'
                   when 8..14 then 'mild'
                   when 15..22 then 'moderate'
                   else 'severe'
                   end

        { score: total_score, severity: severity }
      end

      ##
      # Formats assessment data for API response
      #
      # @param assessment [Assessment] The assessment to format
      # @return [Hash] Formatted assessment data
      #
      def assessment_response(assessment)
        {
          id: assessment.id,
          user_id: assessment.user_id,
          screener_type: assessment.screener_type,
          screener_type_label: assessment.screener_type_label,
          status: assessment.status,
          status_label: assessment.status_label,
          responses: assessment.responses,
          results: assessment.results,
          score: assessment.score,
          severity: assessment.severity,
          started_at: assessment.started_at,
          completed_at: assessment.completed_at,
          created_at: assessment.created_at,
          updated_at: assessment.updated_at
        }
      end
    end
  end
end
