# frozen_string_literal: true

##
# Parameter Filtering Configuration
#
# HIPAA-compliant parameter filtering to prevent PII/PHI from appearing in logs.
# This is critical for healthcare applications.
#
# @see _docs/tech-stack.md for HIPAA compliance requirements
#

Rails.application.config.filter_parameters += [
  # Authentication
  :password,
  :password_confirmation,
  :current_password,
  :token,
  :secret,
  :api_key,
  :reset_password_token,

  # Personal Identifiable Information (PII)
  :ssn,
  :social_security_number,
  :date_of_birth,
  :dob,
  :birth_date,
  :email,
  :phone,
  :phone_number,
  :address,
  :street,
  :city,
  :state,
  :zip,
  :zipcode,

  # Protected Health Information (PHI) - HIPAA
  :health_information,
  :diagnosis,
  :screener_responses,
  :assessment_results,
  :clinical_notes,
  :medical_history,
  :mental_health,
  :symptoms,
  :medications,
  :treatment,

  # Insurance Information
  :insurance_number,
  :member_id,
  :group_number,
  :policyholder,
  :subscriber_id,
  :insurance_card,

  # Financial Information
  :credit_card,
  :card_number,
  :cvv,
  :expiration,
  :bank_account,
  :routing_number,

  # Child Information (extra protection)
  :child_name,
  :minor_name,
  :student_id,
  :school,

  # Generic patterns
  :passw,
  :secret,
  :_key,
  :crypt,
  :salt,
  :certificate,
  :otp,
  :pin
]

# Filter redirect URLs that might contain tokens
Rails.application.config.filter_redirect += [
  :token,
  :reset_password_token,
  :confirmation_token
]
