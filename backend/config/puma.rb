# frozen_string_literal: true

##
# Puma Web Server Configuration
#
# Configures Puma for both development and production environments.
# Worker/thread counts are optimized for container deployments.
#

# Thread pool configuration
max_threads_count = ENV.fetch('RAILS_MAX_THREADS', 5)
min_threads_count = ENV.fetch('RAILS_MIN_THREADS') { max_threads_count }
threads min_threads_count, max_threads_count

# Worker timeout (production)
worker_timeout 60 if ENV.fetch('RAILS_ENV', 'development') == 'production'

# Bind to port
port ENV.fetch('PORT', 3000)

# Environment
environment ENV.fetch('RAILS_ENV', 'development')

# PID file location
pidfile ENV.fetch('PIDFILE', 'tmp/pids/server.pid')

# Workers (production only - use multiple processes)
if ENV.fetch('RAILS_ENV', 'development') == 'production'
  workers ENV.fetch('WEB_CONCURRENCY', 2)

  # Preload the application for Copy-on-Write memory savings
  preload_app!

  # Worker boot callback
  on_worker_boot do
    ActiveRecord::Base.establish_connection if defined?(ActiveRecord)
  end
end

# Allow puma to be restarted by `rails restart` command
plugin :tmp_restart

