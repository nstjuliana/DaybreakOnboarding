# frozen_string_literal: true

##
# ApplicationController
#
# Base controller for the entire application.
# Provides common functionality and error handling.
#
class ApplicationController < ActionController::API
  # Include Pundit for authorization
  # include Pundit::Authorization

  # Rescue from common errors
  rescue_from StandardError, with: :internal_server_error
  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity
  rescue_from ActionController::ParameterMissing, with: :bad_request

  private

  ##
  # Renders a standardized success response
  #
  # @param data [Object] The data to render
  # @param status [Symbol] HTTP status code
  # @param meta [Hash] Additional metadata
  #
  def render_success(data, status: :ok, meta: {})
    response_body = {
      success: true,
      data: data
    }
    response_body[:meta] = meta if meta.present?

    render json: response_body, status: status
  end

  ##
  # Renders a standardized error response
  #
  # @param message [String] Error message
  # @param errors [Array] List of specific errors
  # @param status [Symbol] HTTP status code
  #
  def render_error(message, errors: [], status: :unprocessable_entity)
    render json: {
      success: false,
      error: message,
      errors: errors
    }, status: status
  end

  ##
  # Handles 404 Not Found errors
  #
  def not_found(exception = nil)
    message = exception&.message || 'Resource not found'
    render_error(message, status: :not_found)
  end

  ##
  # Handles 422 Unprocessable Entity errors
  #
  def unprocessable_entity(exception)
    render_error(
      'Validation failed',
      errors: exception.record.errors.full_messages,
      status: :unprocessable_entity
    )
  end

  ##
  # Handles 400 Bad Request errors
  #
  def bad_request(exception)
    render_error(exception.message, status: :bad_request)
  end

  ##
  # Handles 500 Internal Server Error
  #
  def internal_server_error(exception)
    # Log the full error for debugging
    Rails.logger.error("Internal Server Error: #{exception.message}")
    Rails.logger.error(exception.backtrace&.first(10)&.join("\n"))

    # Don't expose details in production
    message = Rails.env.production? ? 'An unexpected error occurred' : exception.message

    render_error(message, status: :internal_server_error)
  end
end

