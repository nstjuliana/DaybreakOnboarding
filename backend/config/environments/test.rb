# frozen_string_literal: true

##
# Test Environment Configuration
#
# Settings optimized for fast, isolated test execution.
#

require 'active_support/core_ext/integer/time'

Rails.application.configure do
  # Do not eager load for tests (speeds up boot)
  config.enable_reloading = false
  config.eager_load = ENV['CI'].present?

  # Static file server for tests
  config.public_file_server.enabled = true
  config.public_file_server.headers = {
    'Cache-Control' => "public, max-age=#{1.hour.to_i}"
  }

  # Show full error reports
  config.consider_all_requests_local = true

  # Disable caching
  config.action_controller.perform_caching = false
  config.cache_store = :null_store

  # Exceptions should be raised instead of rendered
  config.action_dispatch.show_exceptions = :rescuable

  # Disable request forgery protection
  config.action_controller.allow_forgery_protection = false

  # Active Storage (only if enabled)
  # config.active_storage.service = :test

  # Action Mailer - disable delivery
  config.action_mailer.perform_caching = false
  config.action_mailer.delivery_method = :test
  config.action_mailer.default_url_options = { host: 'www.example.com' }

  # Deprecation handling
  config.active_support.deprecation = :stderr
  config.active_support.disallowed_deprecation = :raise
  config.active_support.disallowed_deprecation_warnings = []

  # Raise exceptions for missing translations
  # config.i18n.raise_on_missing_translations = true

  # Annotate rendered view with file names
  config.action_view.annotate_rendered_view_with_filenames = true

  # Throttle - disable in tests
  config.action_controller.raise_on_missing_callback_actions = true
end
