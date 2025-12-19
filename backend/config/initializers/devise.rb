# frozen_string_literal: true

##
# Devise Configuration
#
# Configures Devise authentication with JWT for stateless API authentication.
# Implements HIPAA-compliant security settings.
#
# @see https://github.com/heartcombo/devise
# @see https://github.com/waiting-for-dev/devise-jwt
# @see _docs/tech-stack.md for authentication requirements
#

# Use this hook to configure devise mailer, warden hooks and so forth.
Devise.setup do |config|
  # ==> Mailer Configuration
  config.mailer_sender = ENV.fetch('MAILER_FROM_ADDRESS', 'noreply@daybreakhealth.com')

  # ==> ORM Configuration
  require 'devise/orm/active_record'

  # ==> Security Configuration

  # Configure which authentication keys should be case-insensitive
  config.case_insensitive_keys = [:email]

  # Configure which authentication keys should have whitespace stripped
  config.strip_whitespace_keys = [:email]

  # Skip session storage for API-only mode
  config.skip_session_storage = [:http_auth, :params_auth]

  # By default Devise will store the user in session.
  # We want stateless API authentication via JWT.
  config.navigational_formats = []

  # ==> Stretches Configuration
  # Number of bcrypt stretches (higher = more secure but slower)
  config.stretches = Rails.env.test? ? 1 : 12

  # ==> Password Configuration (HIPAA Compliant)
  # Minimum password length (HIPAA recommends 8+, we use 12)
  config.password_length = 12..128

  # Email regex used to validate email addresses
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/

  # ==> Timeout Configuration (HIPAA Compliant)
  # The time the user will be asked for credentials again (15 minutes for HIPAA)
  config.timeout_in = 15.minutes

  # ==> Lockable Configuration
  # Lock strategy - lock after N failed attempts
  config.lock_strategy = :failed_attempts

  # Unlock strategy - unlock via email or time
  config.unlock_strategy = :both

  # Number of failed attempts before locking
  config.maximum_attempts = 5

  # Time interval to unlock after time-based unlock
  config.unlock_in = 1.hour

  # Warn on the last attempt before lock
  config.last_attempt_warning = true

  # ==> Recovery Configuration
  # Time interval to reset password (short for security)
  config.reset_password_within = 2.hours

  # ==> Confirmation Configuration
  # Time interval to allow confirmation
  config.allow_unconfirmed_access_for = 0.days

  # Time interval to confirm account
  config.confirm_within = 3.days

  # Reconfirm on email change
  config.reconfirmable = true

  # ==> Remember Me Configuration
  config.remember_for = 2.weeks
  config.expire_all_remember_me_on_sign_out = true

  # ==> Sign Out Configuration
  config.sign_out_via = :delete

  # ==> Paranoid Mode (prevents email enumeration)
  config.paranoid = true

  # ==> JWT Configuration
  config.jwt do |jwt|
    jwt.secret = ENV.fetch('DEVISE_JWT_SECRET_KEY') { Rails.application.credentials.secret_key_base }

    # Token expiration (short for HIPAA compliance)
    jwt.expiration_time = 1.hour.to_i

    # JWT dispatch: which requests should return a JWT
    jwt.dispatch_requests = [
      ['POST', %r{^/api/v1/auth/login$}],
      ['POST', %r{^/api/v1/auth/register$}]
    ]

    # JWT revocation: which requests should revoke the JWT
    jwt.revocation_requests = [
      ['DELETE', %r{^/api/v1/auth/logout$}]
    ]

    # Algorithm for JWT signing
    jwt.algorithm = 'HS256'
  end

  # ==> Warden Configuration
  config.warden do |manager|
    manager.failure_app = lambda { |_env|
      # Return JSON error for API requests
      [
        401,
        { 'Content-Type' => 'application/json' },
        [{ success: false, error: 'Authentication required' }.to_json]
      ]
    }
  end
end
