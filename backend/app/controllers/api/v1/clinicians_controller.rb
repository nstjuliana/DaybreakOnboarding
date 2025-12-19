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
      #
      # @return [JSON] Array of clinician data
      #
      def index
        clinicians = Clinician.active.kept

        # Optional specialty filter
        if params[:specialty].present?
          clinicians = clinicians.with_specialty(params[:specialty])
        end

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
      # In MVP, this is simple random selection.
      # Future: Will use assessment results for intelligent matching.
      #
      # GET /api/v1/clinicians/random
      #
      # @return [JSON] Random clinician data
      #
      def random
        clinician = Clinician.random_active

        if clinician
          render_success(clinician_response(clinician))
        else
          render_error('No clinicians available', status: :not_found)
        end
      end

      private

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
          status: clinician.status
        }
      end
    end
  end
end

