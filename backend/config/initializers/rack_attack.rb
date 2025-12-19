# frozen_string_literal: true

##
# Rack::Attack Configuration
#
# Rate limiting and throttling for API protection.
# Essential for preventing abuse and DDoS attacks.
#
# @see https://github.com/rack/rack-attack
#

class Rack::Attack
  ### Configure Cache ###
  # Use Rails cache for rate limiting data
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

  ### Throttle Strategies ###

  # General API rate limit: 300 requests per 5 minutes per IP
  throttle('req/ip', limit: 300, period: 5.minutes) do |req|
    req.ip if req.path.start_with?('/api/')
  end

  # Login attempts: 5 per 20 seconds per IP
  throttle('logins/ip', limit: 5, period: 20.seconds) do |req|
    if req.path == '/api/v1/auth/sign_in' && req.post?
      req.ip
    end
  end

  # Login attempts: 5 per 20 seconds per email
  throttle('logins/email', limit: 5, period: 20.seconds) do |req|
    if req.path == '/api/v1/auth/sign_in' && req.post?
      # Normalize email to prevent bypassing
      req.params['email'].to_s.downcase.gsub(/\s+/, '')
    end
  end

  # AI chat endpoint: 30 requests per minute per user
  throttle('ai/chat', limit: 30, period: 1.minute) do |req|
    if req.path.start_with?('/api/v1/chat') && req.post?
      req.env['warden']&.user&.id || req.ip
    end
  end

  # Password reset: 5 per hour per email
  throttle('password_reset/email', limit: 5, period: 1.hour) do |req|
    if req.path == '/api/v1/auth/password' && req.post?
      req.params['email'].to_s.downcase.gsub(/\s+/, '')
    end
  end

  ### Blocklists ###

  # Block bad actors by IP (loaded from database or config)
  blocklist('block bad IPs') do |req|
    Rack::Attack::Allow2Ban.filter(req.ip, maxretry: 10, findtime: 1.minute, bantime: 1.hour) do
      # After 10 failed login attempts in 1 minute, block for 1 hour
      req.path == '/api/v1/auth/sign_in' && req.post? && req.env['warden.options']&.dig(:action) == :unauthenticated
    end
  end

  ### Safelists ###

  # Allow health checks without throttling
  safelist('health checks') do |req|
    req.path == '/api/v1/health' || req.path == '/up'
  end

  # Allow localhost in development
  safelist('localhost') do |req|
    Rails.env.development? && %w[127.0.0.1 ::1].include?(req.ip)
  end

  ### Custom Responses ###

  # Throttle response
  self.throttled_responder = lambda do |req|
    match_data = req.env['rack.attack.match_data']
    now = match_data[:epoch_time]

    headers = {
      'Content-Type' => 'application/json',
      'Retry-After' => (match_data[:period] - (now % match_data[:period])).to_s,
      'X-RateLimit-Limit' => match_data[:limit].to_s,
      'X-RateLimit-Remaining' => '0',
      'X-RateLimit-Reset' => (now + (match_data[:period] - (now % match_data[:period]))).to_s
    }

    [429, headers, [{ error: 'Rate limit exceeded. Please try again later.' }.to_json]]
  end

  # Blocklist response
  self.blocklisted_responder = lambda do |_req|
    [403, { 'Content-Type' => 'application/json' }, [{ error: 'Forbidden' }.to_json]]
  end
end

# Log throttle events in production
ActiveSupport::Notifications.subscribe('throttle.rack_attack') do |_name, _start, _finish, _request_id, payload|
  Rails.logger.warn(
    "[Rack::Attack] Throttled #{payload[:request].ip} - #{payload[:request].request_method} #{payload[:request].fullpath}"
  )
end

