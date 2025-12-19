# frozen_string_literal: true

##
# Api::V1::Auth::SessionsController
#
# Handles user authentication (login/logout) for the Parent Onboarding AI.
# Issues and revokes JWT tokens for stateless API authentication.
#
# @see User model
# @see JwtDenylist for token revocation
#
module Api
  module V1
    module Auth
      class SessionsController < Api::V1::BaseController
        before_action :authenticate_user!, only: [:destroy]

        ##
        # Authenticates a user and returns a JWT token
        #
        # POST /api/v1/auth/login
        #
        # @param [String] email User's email address
        # @param [String] password User's password
        #
        # @return [JSON] User data with JWT token in Authorization header
        #
        # @example Request
        #   POST /api/v1/auth/login
        #   {
        #     "user": {
        #       "email": "parent@example.com",
        #       "password": "SecurePass123!"
        #     }
        #   }
        #
        # @example Success Response (200 OK)
        #   {
        #     "success": true,
        #     "data": {
        #       "id": "uuid",
        #       "email": "parent@example.com",
        #       "user_type": "parent"
        #     }
        #   }
        #
        def create
          user = User.find_by(email: login_params[:email]&.downcase)

          if user&.valid_password?(login_params[:password])
            if user.locked_at.present?
              render json: {
                success: false,
                error: 'Account is locked. Please try again later or reset your password.'
              }, status: :unauthorized
              return
            end

            # Generate JWT token
            token = generate_jwt_token(user)

            # Update sign in tracking
            user.update_tracked_fields!(request)

            # Return token in both header AND body for CORS compatibility
            render json: {
              success: true,
              data: user_response(user),
              token: token
            }, status: :ok, headers: { 'Authorization' => "Bearer #{token}" }
          else
            # Increment failed attempts if user exists
            user&.increment_failed_attempts if user.respond_to?(:increment_failed_attempts)

            render json: {
              success: false,
              error: 'Invalid email or password'
            }, status: :unauthorized
          end
        end

        ##
        # Logs out the current user by revoking their JWT token
        #
        # DELETE /api/v1/auth/logout
        #
        # @return [JSON] Success message
        #
        # @example Success Response (200 OK)
        #   {
        #     "success": true,
        #     "message": "Logged out successfully"
        #   }
        #
        def destroy
          # The JWT is automatically added to the denylist by devise-jwt
          # when this endpoint is hit with a valid token

          render json: {
            success: true,
            message: 'Logged out successfully'
          }, status: :ok
        end

        private

        ##
        # Permitted parameters for login
        #
        # @return [ActionController::Parameters]
        #
        def login_params
          params.expect(user: [:email, :password])
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
            user_type_label: user.user_type_label,
            first_name: user.first_name,
            last_name: user.last_name,
            display_name: user.display_name,
            phone: user.phone,
            confirmed: user.confirmed?,
            created_at: user.created_at
          }
        end
      end
    end
  end
end
