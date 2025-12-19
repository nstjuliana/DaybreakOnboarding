# frozen_string_literal: true

##
# GoodJob Configuration
#
# PostgreSQL-backed background job processing.
# Eliminates Redis dependency for simpler HIPAA compliance.
#
# @see https://github.com/bensheldon/good_job
#

Rails.application.configure do
  config.good_job.preserve_job_records = true
  config.good_job.retry_on_unhandled_error = false
  config.good_job.on_thread_error = ->(exception) { Rails.logger.error(exception) }

  # Execution mode
  # :inline - execute jobs immediately (testing)
  # :external - separate process (production)
  # :async - execute in web process threads (development)
  config.good_job.execution_mode = case Rails.env
                                   when 'development'
                                     :async
                                   when 'test'
                                     :inline
                                   else
                                     :external
                                   end

  # Queue configuration
  # Format: "queue_name:max_threads;queue_name2:max_threads2"
  config.good_job.queues = ENV.fetch('GOOD_JOB_QUEUES', 'critical:5;default:3;low:1')

  # Maximum threads for async mode
  config.good_job.max_threads = ENV.fetch('GOOD_JOB_MAX_THREADS', 5).to_i

  # Poll interval for checking new jobs
  config.good_job.poll_interval = ENV.fetch('GOOD_JOB_POLL_INTERVAL', 5).to_i

  # Shutdown timeout (seconds)
  config.good_job.shutdown_timeout = 25

  # Enable cron-like scheduled jobs
  config.good_job.enable_cron = Rails.env.production?

  # Dashboard authentication (production)
  # config.good_job.dashboard_default_locale = :en
end

# Queue priorities
# Lower number = higher priority
QUEUE_PRIORITIES = {
  critical: 0,    # Safety pivots, crisis detection
  default: 5,     # Standard processing
  ai: 10,         # LLM API calls
  mailers: 15,    # Email delivery
  low: 20         # Analytics, cleanup
}.freeze
