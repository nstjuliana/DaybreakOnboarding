# frozen_string_literal: true

##
# ApplicationRecord Base Class
#
# Base class for all Active Record models in the application.
# Provides shared functionality across all models.
#
class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
end

