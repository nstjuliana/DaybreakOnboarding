# frozen_string_literal: true

##
# Api::V1::UsersController
#
# Handles current user profile operations.
# Provides read and update access to the authenticated user's data.
#
# @see User model
#
module Api
  module V1
    class UsersController < BaseController
      before_action :authenticate_user!

      ##
      # Returns the current user's profile
      #
      # GET /api/v1/users/me
      #
      # @return [JSON] Current user data
      #
      # @example Success Response (200 OK)
      #   {
      #     "success": true,
      #     "data": {
      #       "id": "uuid",
      #       "email": "parent@example.com",
      #       "user_type": "parent",
      #       "first_name": "Jane",
      #       "last_name": "Doe"
      #     }
      #   }
      #
      def show
        render_success(user_response(current_user))
      end

      ##
      # Updates the current user's profile
      #
      # PATCH /api/v1/users/me
      #
      # @param [String] first_name User's first name
      # @param [String] last_name User's last name
      # @param [String] phone User's phone number
      # @param [Hash] profile Additional profile data
      #
      # @return [JSON] Updated user data
      #
      # @example Request
      #   PATCH /api/v1/users/me
      #   {
      #     "user": {
      #       "first_name": "Jane",
      #       "last_name": "Smith",
      #       "phone": "+1234567890"
      #     }
      #   }
      #
      def update
        if current_user.update(user_params)
          render_success(user_response(current_user))
        else
          render_error(
            'Profile update failed',
            errors: current_user.errors.full_messages
          )
        end
      end

      private

      ##
      # Permitted parameters for user update
      #
      # @return [ActionController::Parameters]
      #
      def user_params
        params.expect(
          user: [:first_name,
                 :last_name,
                 :phone,
                 :date_of_birth,
                 { profile: {} }]
        )
      end

      ##
      # Formats user data for API response
      #
      # @param user [User] The user to format
      # @return [Hash] Formatted user data
      #
      def user_response(user)
        {
          id: user.id,
          email: user.email,
          user_type: user.user_type,
          user_type_label: user.user_type_label,
          first_name: user.first_name,
          last_name: user.last_name,
          display_name: user.display_name,
          phone: user.phone,
          date_of_birth: user.date_of_birth,
          profile: user.profile,
          confirmed: user.confirmed?,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      end
    end
  end
end
