# frozen_string_literal: true

##
# Database Seeds
#
# Loads seed data for development and staging environments.
# Run with: rails db:seed
#
# @see db/seeds/ for individual seed files
#

puts '=' * 50
puts 'Seeding database...'
puts '=' * 50

# Load clinicians seed
load Rails.root.join('db/seeds/clinicians.rb')

puts '=' * 50
puts 'Database seeding complete!'
puts '=' * 50
