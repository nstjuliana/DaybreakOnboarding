# frozen_string_literal: true

##
# Production Environment Configuration
#
# HIPAA-compliant settings for Aptible deployment.
# See _docs/tech-stack.md for security requirements.
#

require 'active_support/core_ext/integer/time'

Rails.application.configure do
  # Eager load all code on boot
  config.enable_reloading = false
  config.eager_load = true

  # Error handling - don't expose details
  config.consider_all_requests_local = false

  # Caching
  config.action_controller.perform_caching = true
  config.cache_store = :solid_cache_store

  # Static files served by Nginx/reverse proxy
  config.public_file_server.enabled = ENV['RAILS_SERVE_STATIC_FILES'].present?

  # Active Storage (enable when needed)
  # config.active_storage.service = :amazon

  # Force SSL (HIPAA requirement)
  config.force_ssl = true
  config.ssl_options = { hsts: { subdomains: true, preload: true } }

  # Logging - structured JSON for log aggregation
  config.assume_ssl = true
  config.log_level = ENV.fetch('RAILS_LOG_LEVEL', 'info').to_sym
  config.log_tags = [:request_id]
  config.log_formatter = Logger::Formatter.new

  # Use default logging formatter with STDOUT for container logs
  if ENV['RAILS_LOG_TO_STDOUT'].present?
    logger = ActiveSupport::Logger.new($stdout)
    logger.formatter = config.log_formatter
    config.logger = ActiveSupport::TaggedLogging.new(logger)
  end

  # Action Mailer - use SendGrid
  config.action_mailer.perform_caching = false
  config.action_mailer.raise_delivery_errors = true
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    user_name: 'apikey',
    password: ENV.fetch('SENDGRID_API_KEY', nil),
    domain: ENV.fetch('MAILER_DOMAIN', 'daybreakhealth.com'),
    address: 'smtp.sendgrid.net',
    port: 587,
    authentication: :plain,
    enable_starttls_auto: true
  }

  # Deprecation handling - log to error reporter
  config.active_support.deprecation = :notify

  # Database migrations in production
  config.active_record.dump_schema_after_migration = false

  # Enable DNS rebinding protection (HIPAA)
  # Allow Aptible endpoints and custom domains
  # Can be disabled for testing with DISABLE_HOST_AUTHORIZATION=true
  if ENV['DISABLE_HOST_AUTHORIZATION'] != 'true'
    config.hosts = [
      ENV.fetch('APP_HOST', 'daybreakhealth.com'),
      '.on-aptible.com' # Aptible default endpoints (allows any subdomain)
    ]
    config.hosts << ENV['APTIBLE_HOSTNAME'] if ENV['APTIBLE_HOSTNAME'].present?

    # Allow health check endpoint without host validation
    config.host_authorization = { exclude: ->(request) { request.path.start_with?('/api/v1/health') } }
  end

  # Trusted proxies (Aptible load balancer)
  config.action_dispatch.trusted_proxies = [
    ActionDispatch::RemoteIp::TRUSTED_PROXIES,
    IPAddr.new('10.0.0.0/8')
  ].flatten
end
