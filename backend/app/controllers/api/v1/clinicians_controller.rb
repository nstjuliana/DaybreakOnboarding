# frozen_string_literal: true

##
# Api::V1::CliniciansController
#
# Handles clinician listing and matching for the onboarding flow.
# Provides endpoints to browse and retrieve clinician profiles.
#
# @see Clinician model
# @see _docs/user-flow.md Phase 3D: Clinician Matching
#
module Api
  module V1
    class CliniciansController < BaseController
      ##
      # Lists all active clinicians
      #
      # GET /api/v1/clinicians
      #
      # @param [String] specialty Filter by specialty (optional)
      # @param [String] insurance Filter by insurance provider (optional)
      # @param [Boolean] self_pay Filter to self-pay friendly clinicians (optional)
      # @param [Boolean] sliding_scale Filter to sliding scale clinicians (optional)
      #
      # @return [JSON] Array of clinician data
      #
      def index
        clinicians = Clinician.active.kept

        # Optional filters
        clinicians = clinicians.with_specialty(params[:specialty]) if params[:specialty].present?
        clinicians = clinicians.accepts_insurance(params[:insurance]) if params[:insurance].present?
        clinicians = clinicians.self_pay_friendly if params[:self_pay] == 'true'
        clinicians = clinicians.sliding_scale if params[:sliding_scale] == 'true'
        clinicians = clinicians.uninsured_friendly if params[:uninsured_friendly] == 'true'

        clinicians = paginate(clinicians.order(:last_name))

        render_success(
          clinicians.map { |c| clinician_response(c) },
          meta: pagination_meta(Clinician.active.kept)
        )
      end

      ##
      # Returns a single clinician by ID
      #
      # GET /api/v1/clinicians/:id
      #
      # @return [JSON] Clinician data
      #
      def show
        clinician = Clinician.kept.find(params[:id])
        render_success(clinician_response(clinician))
      end

      ##
      # Returns a random active clinician for matching
      # Considers insurance status for better matching.
      #
      # GET /api/v1/clinicians/random
      #
      # @param [String] insurance_status User's insurance status (optional)
      # @param [String] insurance_provider Specific insurance provider (optional)
      #
      # @return [JSON] Random clinician data
      #
      def random
        clinician = if params[:insurance_status].present?
                      Clinician.random_for_insurance(
                        params[:insurance_status],
                        params[:insurance_provider]
                      )
                    else
                      Clinician.random_active
                    end

        if clinician
          render_success(clinician_response(clinician))
        else
          render_error('No clinicians available', status: :not_found)
        end
      end

      ##
      # Matches clinicians to user based on assessment and preferences
      #
      # POST /api/v1/clinicians/match
      #
      # @return [JSON] Array of matched clinicians with scores
      #
      def match
        authenticate_user!

        service = Scheduling::MatchClinicianService.new(
          current_user,
          current_user.latest_assessment,
          match_preferences
        )

        matches = service.match

        if matches.any?
          render_success(
            matches.map do |match|
              {
                clinician: clinician_response(match[:clinician]),
                score: match[:score],
                reasons: match[:reasons]
              }
            end
          )
        else
          render_error('No matching clinicians found', status: :not_found)
        end
      end

      ##
      # Returns availability for a specific clinician
      #
      # GET /api/v1/clinicians/:id/availability
      #
      # @param start_date [String] Start date (default: today)
      # @param end_date [String] End date (default: 2 weeks from start)
      #
      # @return [JSON] Available time slots
      #
      def availability
        clinician = Clinician.kept.find(params[:id])

        start_date = params[:start_date]&.to_date || Date.current
        end_date = params[:end_date]&.to_date || (start_date + 14.days)

        service = Scheduling::AvailabilityService.new(clinician, start_date, end_date)
        slots = service.available_slots

        render_success({
                         clinician_id: clinician.id,
                         start_date: start_date,
                         end_date: end_date,
                         slots: slots
                       })
      end

      private

      ##
      # Extracts match preferences from params
      #
      # @return [Hash] User preferences for matching
      #
      def match_preferences
        {
          preferred_times: params[:preferred_times],
          gender_preference: params[:gender_preference]
        }.compact
      end

      ##
      # Formats clinician data for API response
      #
      # @param clinician [Clinician] The clinician to format
      # @return [Hash] Formatted clinician data
      #
      def clinician_response(clinician)
        {
          id: clinician.id,
          first_name: clinician.first_name,
          last_name: clinician.last_name,
          full_name: clinician.full_name,
          display_name: clinician.display_name,
          credentials: clinician.credentials,
          bio: clinician.bio,
          photo_url: clinician.photo_url,
          video_url: clinician.video_url,
          specialties: clinician.specialties,
          status: clinician.status,
          accepted_insurances: clinician.accepted_insurances,
          accepts_self_pay: clinician.accepts_self_pay,
          offers_sliding_scale: clinician.offers_sliding_scale
        }
      end
    end
  end
end
