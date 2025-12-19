# frozen_string_literal: true

##
# Database Seeds
#
# This file should contain all the record creation needed to seed the database
# with its default values. Run with: rails db:seed
#
# Environment-specific seeds can be loaded from db/seeds/ directory.
#

# :nocov:
Rails.logger.info 'Seeding database...'

# Load environment-specific seeds
seed_file = Rails.root.join('db', 'seeds', "#{Rails.env}.rb")
load(seed_file) if File.exist?(seed_file)

Rails.logger.info 'Seeding complete!'
# :nocov:
