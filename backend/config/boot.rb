# frozen_string_literal: true

##
# Boot Configuration
#
# Sets up the application load path and enables bootsnap caching.
#

ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../Gemfile', __dir__)

require 'bundler/setup'
require 'bootsnap/setup'
