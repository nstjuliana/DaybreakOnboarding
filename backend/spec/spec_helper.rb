# frozen_string_literal: true

##
# RSpec Configuration
#
# Core RSpec configuration for the test suite.
# See https://rspec.info/documentation/ for configuration options.
#

# Code coverage (load before application)
require 'simplecov'
SimpleCov.start 'rails' do
  add_filter '/spec/'
  add_filter '/config/'
  add_filter '/vendor/'

  add_group 'Controllers', 'app/controllers'
  add_group 'Models', 'app/models'
  add_group 'Services', 'app/services'
  add_group 'Jobs', 'app/jobs'
  add_group 'Policies', 'app/policies'
  add_group 'Mailers', 'app/mailers'
end

RSpec.configure do |config|
  # Enable flags like --only-failures and --next-failure
  config.example_status_persistence_file_path = '.rspec_status'

  # Disable RSpec exposing methods globally on `Module` and `main`
  config.disable_monkey_patching!

  # Use expect syntax
  config.expect_with :rspec do |c|
    c.syntax = :expect
  end

  # Run specs in random order
  config.order = :random
  Kernel.srand config.seed

  # Focused specs
  config.filter_run_when_matching :focus

  # Profile slow specs
  config.profile_examples = 10
end

