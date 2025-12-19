# frozen_string_literal: true

##
# Api::V1::HealthController
#
# Provides health check endpoints for monitoring and load balancer checks.
# Returns application status and basic diagnostics.
#
# @example Request
#   GET /api/v1/health
#
# @example Response
#   {
#     "status": "ok",
#     "timestamp": "2024-01-15T10:30:00Z",
#     "version": "1.0.0",
#     "services": {
#       "database": "ok",
#       "cache": "ok"
#     }
#   }
#
module Api
  module V1
    class HealthController < BaseController
      # Skip authentication for health checks
      # skip_before_action :authenticate_user!

      ##
      # GET /api/v1/health
      #
      # Returns the health status of the application.
      # Used by load balancers and monitoring systems.
      #
      def show
        health_status = {
          status: 'ok',
          timestamp: Time.current.iso8601,
          version: app_version,
          environment: Rails.env,
          services: check_services
        }

        # Return 503 if any critical service is down
        if health_status[:services].values.any?('error')
          render json: health_status, status: :service_unavailable
        else
          render json: health_status, status: :ok
        end
      end

      private

      ##
      # Returns the application version
      #
      # @return [String] Application version from environment or default
      #
      def app_version
        ENV.fetch('APP_VERSION', '0.1.0')
      end

      ##
      # Checks the status of critical services
      #
      # @return [Hash] Service status map
      #
      def check_services
        {
          database: check_database,
          cache: check_cache
        }
      end

      ##
      # Checks database connectivity
      #
      # @return [String] 'ok' or 'error'
      #
      def check_database
        ActiveRecord::Base.connection.execute('SELECT 1')
        'ok'
      rescue StandardError => e
        Rails.logger.error("Health check - Database error: #{e.message}")
        'error'
      end

      ##
      # Checks cache connectivity
      #
      # @return [String] 'ok' or 'error'
      #
      def check_cache
        Rails.cache.write('health_check', 'ok', expires_in: 1.minute)
        Rails.cache.read('health_check') == 'ok' ? 'ok' : 'error'
      rescue StandardError => e
        Rails.logger.error("Health check - Cache error: #{e.message}")
        'error'
      end
    end
  end
end
