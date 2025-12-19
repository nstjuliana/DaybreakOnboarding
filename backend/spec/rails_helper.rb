# frozen_string_literal: true

##
# Rails RSpec Configuration
#
# Rails-specific RSpec configuration including database transactions,
# factory_bot, and shoulda-matchers.
#

require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'

# Prevent database truncation if the environment is production
abort('The Rails environment is running in production mode!') if Rails.env.production?

require 'rspec/rails'

# Load support files
Rails.root.glob('spec/support/**/*.rb').each { |f| require f }

# Checks for pending migrations and applies them before tests are run
begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  # Use Active Record fixtures
  config.fixture_paths = [Rails.root.join('spec', 'fixtures')]

  # Use transactional fixtures
  config.use_transactional_fixtures = true

  # Filter lines from Rails gems in backtraces
  config.filter_rails_from_backtrace!

  # Infer spec type from file location
  config.infer_spec_type_from_file_location!

  # Include FactoryBot methods
  config.include FactoryBot::Syntax::Methods

  # Include request spec helpers
  config.include RequestSpecHelper, type: :request

  # Database cleaner
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
  end

  config.around do |example|
    DatabaseCleaner.cleaning do
      example.run
    end
  end
end

# Shoulda Matchers configuration
Shoulda::Matchers.configure do |config|
  config.integrate do |with|
    with.test_framework :rspec
    with.library :rails
  end
end
