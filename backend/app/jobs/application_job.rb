# frozen_string_literal: true

##
# ApplicationJob
#
# Base class for all background jobs.
# Provides common job configuration and error handling.
#
# All job classes should inherit from this class.
#
# @see https://edgeguides.rubyonrails.org/active_job_basics.html
#
class ApplicationJob < ActiveJob::Base
  # Automatically retry jobs that encountered a deadlock
  retry_on ActiveRecord::Deadlocked

  # Most jobs are safe to ignore if the underlying records are no longer available
  discard_on ActiveJob::DeserializationError
end

