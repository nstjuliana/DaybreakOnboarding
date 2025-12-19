# frozen_string_literal: true

##
# RequestSpecHelper
#
# Helper methods for request specs.
# Provides JSON parsing and authentication helpers.
#
module RequestSpecHelper
  ##
  # Parses the response body as JSON
  #
  # @return [Hash] Parsed JSON response with symbolized keys
  #
  def json_response
    JSON.parse(response.body, symbolize_names: true)
  end

  ##
  # Returns authentication headers for a user
  #
  # @param user [User] The user to authenticate
  # @return [Hash] Headers with JWT token
  #
  def auth_headers(user)
    # Placeholder - will be implemented with Devise JWT
    {
      'Authorization' => "Bearer #{generate_token(user)}",
      'Content-Type' => 'application/json'
    }
  end

  ##
  # Returns standard JSON headers
  #
  # @return [Hash] JSON content type headers
  #
  def json_headers
    {
      'Content-Type' => 'application/json',
      'Accept' => 'application/json'
    }
  end

  private

  ##
  # Generates a JWT token for testing
  #
  # @param user [User] The user to generate token for
  # @return [String] JWT token (placeholder)
  #
  def generate_token(_user)
    # Placeholder - will be implemented with Devise JWT
    'test_token'
  end
end
