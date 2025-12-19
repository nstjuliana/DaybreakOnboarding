# frozen_string_literal: true

##
# Application Configuration
#
# Main Rails application configuration for Parent Onboarding AI.
# This file defines the API-only mode and core middleware settings.
#

require_relative 'boot'

require 'rails'
require 'active_model/railtie'
require 'active_job/railtie'
require 'active_record/railtie'
require 'action_controller/railtie'
require 'action_mailer/railtie'
require 'action_view/railtie'
require 'action_cable/engine'
require 'rails/test_unit/railtie'

Bundler.require(*Rails.groups)

module DaybreakOnboarding
  class Application < Rails::Application
    # Initialize configuration defaults for Rails 8
    config.load_defaults 8.0

    # API-only mode - no views, cookies, or session middleware
    config.api_only = true

    # Autoload paths
    config.autoload_lib(ignore: %w[assets tasks])

    # Time zone
    config.time_zone = 'Eastern Time (US & Canada)'

    # Active Record
    config.active_record.default_timezone = :utc

    # Use UUIDs as primary keys by default
    config.generators do |g|
      g.orm :active_record, primary_key_type: :uuid
    end

    # Background jobs
    config.active_job.queue_adapter = :good_job

    # Action Cable
    config.action_cable.mount_path = '/cable'

    # Allowed hosts (configure in environment files)
    # config.hosts << "example.com"

    # Content types
    config.middleware.use Rack::ContentType
  end
end

