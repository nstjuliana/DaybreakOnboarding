# frozen_string_literal: true

##
# CORS Configuration
#
# Configures Cross-Origin Resource Sharing for the API.
# Allows the Next.js frontend to communicate with the Rails backend.
#
# @see https://github.com/cyu/rack-cors
#

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Development origins - include full URLs with protocol
    origins(
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'localhost:3001',
      '127.0.0.1:3001',
      ENV.fetch('FRONTEND_URL', 'http://localhost:3001')
    )

    resource '*',
             headers: :any,
             methods: [:get, :post, :put, :patch, :delete, :options, :head],
             credentials: true,
             expose: ['Authorization', 'X-Request-Id'],
             max_age: 600
  end

  # Production origin (configured via environment variable)
  if Rails.env.production?
    # Parse FRONTEND_URL which may contain multiple comma-separated origins
    frontend_urls = ENV.fetch('FRONTEND_URL', 'https://onboarding.daybreakhealth.com')
                       .split(',')
                       .map(&:strip)

    # Also allow Aptible default endpoints
    aptible_pattern = /\Ahttps?:\/\/app-\d+\.on-aptible\.com\z/

    allow do
      origins(*frontend_urls, aptible_pattern)

      resource '*',
               headers: :any,
               methods: [:get, :post, :put, :patch, :delete, :options, :head],
               credentials: true,
               expose: ['Authorization', 'X-Request-Id'],
               max_age: 3600
    end
  end
end
