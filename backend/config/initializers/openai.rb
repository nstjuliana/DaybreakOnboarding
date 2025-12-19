# frozen_string_literal: true

##
# OpenAI Client Configuration
#
# Initializes the OpenAI client for use throughout the application.
# Uses credentials from Rails encrypted credentials.
#
# @see https://github.com/alexrudall/ruby-openai
#

require 'openai'

# Configure OpenAI gem defaults
OpenAI.configure do |config|
  config.access_token = Rails.application.credentials.dig(:openai, :api_key) ||
                        ENV.fetch('OPENAI_API_KEY', nil)

  # Optional: Organization ID for API usage tracking
  config.organization_id = Rails.application.credentials.dig(:openai, :organization_id) ||
                           ENV.fetch('OPENAI_ORGANIZATION_ID', nil)

  # Request timeout in seconds
  config.request_timeout = 120

  # Log requests in development
  config.log_errors = Rails.env.development?
end

# Verify configuration in development/test
if Rails.env.local? && OpenAI.configuration.access_token.blank?
  Rails.logger.warn '[OpenAI] No API key configured. AI features will not work.'
  Rails.logger.warn '[OpenAI] Set OPENAI_API_KEY environment variable or add to credentials.'
end

##
# OpenAI Client Factory
#
# Provides a consistent way to create OpenAI clients throughout the app.
#
module OpenAIClient
  class << self
    ##
    # Returns a configured OpenAI client instance
    #
    # @return [OpenAI::Client] Configured client
    #
    def client
      @client ||= OpenAI::Client.new
    end

    ##
    # Creates a new client (useful for testing)
    #
    # @param options [Hash] Override options
    # @return [OpenAI::Client] New client instance
    #
    def new_client(options = {})
      OpenAI::Client.new(options)
    end

    ##
    # Checks if OpenAI is properly configured
    #
    # @return [Boolean] True if API key is present
    #
    def configured?
      OpenAI.configuration.access_token.present?
    end

    ##
    # Returns the default model for chat completions
    #
    # @return [String] Model name
    #
    def default_chat_model
      Rails.application.credentials.dig(:openai, :chat_model) || 'gpt-4o'
    end

    ##
    # Returns the default model for embeddings
    #
    # @return [String] Model name
    #
    def default_embedding_model
      'text-embedding-3-small'
    end
  end
end
