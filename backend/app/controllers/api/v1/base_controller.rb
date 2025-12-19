# frozen_string_literal: true

##
# Api::V1::BaseController
#
# Base controller for all V1 API endpoints.
# Provides common API functionality including authentication, authorization,
# and standardized response formatting.
#
# All API controllers should inherit from this class.
#
# @see _docs/tech-stack.md for API conventions
#
module Api
  module V1
    class BaseController < ApplicationController
      include Pundit::Authorization

      # Skip CSRF for API requests (using JWT instead)
      skip_before_action :verify_authenticity_token, raise: false

      # Rescue from common errors
      rescue_from ActiveRecord::RecordNotFound, with: :not_found
      rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity
      rescue_from ActionController::ParameterMissing, with: :bad_request
      rescue_from Pundit::NotAuthorizedError, with: :forbidden

      protected

      ##
      # Authenticates user from JWT token
      # Override Devise's authenticate_user! for API-friendly response
      #
      def authenticate_user!
        return if current_user

        render json: {
          success: false,
          error: 'Authentication required',
          code: 'unauthorized'
        }, status: :unauthorized
      end

      ##
      # Returns the current authenticated user
      # Decodes the JWT from the Authorization header
      #
      # @return [User, nil] The authenticated user or nil
      #
      def current_user
        @current_user ||= begin
          token = extract_token_from_header
          return nil unless token

          decode_jwt_token(token)
        rescue JWT::DecodeError, JWT::ExpiredSignature
          nil
        end
      end

      private

      ##
      # Extracts JWT token from Authorization header
      #
      # @return [String, nil] The JWT token or nil
      #
      def extract_token_from_header
        auth_header = request.headers['Authorization']
        return nil unless auth_header&.start_with?('Bearer ')

        auth_header.split(' ').last
      end

      ##
      # Decodes JWT token and returns the user
      #
      # @param token [String] The JWT token
      # @return [User, nil] The user or nil
      #
      def decode_jwt_token(token)
        decoded = Warden::JWTAuth::UserDecoder.new.call(token, :user, nil)
        decoded
      rescue StandardError
        nil
      end

      ##
      # Returns the current API version
      #
      # @return [String] API version string
      #
      def api_version
        'v1'
      end

      ##
      # Renders a success response
      #
      # @param data [Object] The data to include in the response
      # @param status [Symbol] HTTP status code (default: :ok)
      # @param meta [Hash] Optional metadata
      #
      def render_success(data, status: :ok, meta: nil)
        response = { success: true, data: data }
        response[:meta] = meta if meta
        render json: response, status: status
      end

      ##
      # Renders an error response
      #
      # @param message [String] Error message
      # @param errors [Array<String>] Detailed error messages
      # @param status [Symbol] HTTP status code
      # @param code [String] Error code for client handling
      #
      def render_error(message, errors: [], status: :unprocessable_entity, code: nil)
        response = { success: false, error: message }
        response[:errors] = errors if errors.any?
        response[:code] = code if code
        render json: response, status: status
      end

      ##
      # Handles ActiveRecord::RecordNotFound errors
      #
      def not_found
        render_error('Resource not found', status: :not_found, code: 'not_found')
      end

      ##
      # Handles ActiveRecord::RecordInvalid errors
      #
      # @param exception [ActiveRecord::RecordInvalid]
      #
      def unprocessable_entity(exception)
        render_error(
          'Validation failed',
          errors: exception.record.errors.full_messages,
          status: :unprocessable_entity,
          code: 'validation_error'
        )
      end

      ##
      # Handles ActionController::ParameterMissing errors
      #
      # @param exception [ActionController::ParameterMissing]
      #
      def bad_request(exception)
        render_error(
          "Missing required parameter: #{exception.param}",
          status: :bad_request,
          code: 'missing_parameter'
        )
      end

      ##
      # Handles Pundit::NotAuthorizedError errors
      #
      def forbidden
        render_error(
          'You are not authorized to perform this action',
          status: :forbidden,
          code: 'forbidden'
        )
      end

      ##
      # Pagination helper for index actions
      #
      # @param collection [ActiveRecord::Relation] The collection to paginate
      # @param per_page [Integer] Items per page (default: 25)
      # @return [ActiveRecord::Relation] Paginated collection
      #
      def paginate(collection, per_page: 25)
        page = params[:page]&.to_i || 1
        page = 1 if page < 1

        collection.limit(per_page).offset((page - 1) * per_page)
      end

      ##
      # Returns pagination metadata
      #
      # @param collection [ActiveRecord::Relation] The full collection
      # @param per_page [Integer] Items per page
      # @return [Hash] Pagination metadata
      #
      def pagination_meta(collection, per_page: 25)
        total_count = collection.count
        total_pages = (total_count.to_f / per_page).ceil
        current_page = params[:page]&.to_i || 1

        {
          pagination: {
            current_page: current_page,
            per_page: per_page,
            total_pages: total_pages,
            total_count: total_count
          }
        }
      end
    end
  end
end
