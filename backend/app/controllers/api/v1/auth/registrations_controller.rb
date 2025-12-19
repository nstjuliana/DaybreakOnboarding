# frozen_string_literal: true

##
# Api::V1::Auth::RegistrationsController
#
# Handles user registration for the Parent Onboarding AI application.
# Creates new user accounts and returns JWT tokens for authentication.
#
# @see User model
# @see _docs/user-flow.md Phase 3A: Account Creation
#
module Api
  module V1
    module Auth
      class RegistrationsController < Api::V1::BaseController
        ##
        # Creates a new user account
        #
        # POST /api/v1/auth/register
        #
        # @param [String] email User's email address
        # @param [String] password User's password (12+ chars with complexity)
        # @param [String] password_confirmation Password confirmation
        # @param [String] user_type Type of user (parent, minor, friend)
        # @param [String] first_name User's first name (optional)
        # @param [String] last_name User's last name (optional)
        # @param [String] phone User's phone number (optional)
        #
        # @return [JSON] User data with JWT token in Authorization header
        #
        # @example Request
        #   POST /api/v1/auth/register
        #   {
        #     "user": {
        #       "email": "parent@example.com",
        #       "password": "SecurePass123!",
        #       "password_confirmation": "SecurePass123!",
        #       "user_type": "parent",
        #       "first_name": "Jane",
        #       "last_name": "Doe"
        #     }
        #   }
        #
        # @example Success Response (201 Created)
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
        def create
          user = User.new(registration_params)

          if user.save
            # Generate JWT token
            token = generate_jwt_token(user)

            render json: {
              success: true,
              data: user_response(user)
            }, status: :created, headers: { 'Authorization' => "Bearer #{token}" }
          else
            render json: {
              success: false,
              error: 'Registration failed',
              errors: user.errors.full_messages
            }, status: :unprocessable_content
          end
        end

        private

        ##
        # Permitted parameters for user registration
        #
        # @return [ActionController::Parameters]
        #
        def registration_params
          params.expect(
            user: [:email,
                   :password,
                   :password_confirmation,
                   :user_type,
                   :first_name,
                   :last_name,
                   :phone,
                   :date_of_birth]
          )
        end

        ##
        # Generates a JWT token for the user
        #
        # @param user [User] The user to generate a token for
        # @return [String] The JWT token
        #
        def generate_jwt_token(user)
          Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first
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
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            created_at: user.created_at
          }
        end
      end
    end
  end
end
