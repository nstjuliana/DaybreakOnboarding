# frozen_string_literal: true

##
# ApplicationMailer
#
# Base mailer class for all application mailers.
# Provides common configuration and functionality.
#
class ApplicationMailer < ActionMailer::Base
  default from: 'Daybreak Health <noreply@daybreakhealth.com>'
  layout 'mailer'
end
