# frozen_string_literal: true

##
# Database Seeds
#
# Loads seed data for development and staging environments.
# Run with: rails db:seed
#
# @see db/seeds/ for individual seed files
#

Rails.logger.debug '=' * 50
Rails.logger.debug 'Seeding database...'
Rails.logger.debug '=' * 50

# Load clinicians seed
load Rails.root.join('db', 'seeds', 'clinicians.rb')

Rails.logger.debug '=' * 50
Rails.logger.debug 'Database seeding complete!'
Rails.logger.debug '=' * 50
