# frozen_string_literal: true

##
# Patient Model
#
# Represents the patient (child/adolescent) receiving mental health services.
# For parent flow: stores child information entered by parent.
# For minor flow: stores the minor's own information.
#
# @see _docs/phases/phase-3-insurance-matching.md
#
# @example Creating a patient for parent flow
#   Patient.create!(
#     user: parent_user,
#     first_name: 'Alex',
#     last_name: 'Doe',
#     date_of_birth: Date.new(2010, 5, 15),
#     gender: 'non_binary',
#     pronouns: 'they/them'
#   )
#
class Patient < ApplicationRecord
  include Discard::Model

  # Associations
  belongs_to :user
  belongs_to :parent_user, class_name: 'User', optional: true

  # Gender options
  GENDERS = {
    'male' => 'Male',
    'female' => 'Female',
    'non_binary' => 'Non-binary',
    'other' => 'Other',
    'prefer_not_to_say' => 'Prefer not to say'
  }.freeze

  # Common pronouns
  PRONOUNS = {
    'he/him' => 'He/Him',
    'she/her' => 'She/Her',
    'they/them' => 'They/Them',
    'other' => 'Other'
  }.freeze

  # Validations
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :date_of_birth, presence: true, if: :requires_dob?
  validates :gender, inclusion: { in: GENDERS.keys }, allow_blank: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :phone, format: { with: /\A\+?[\d\s\-().]+\z/ }, allow_blank: true
  validates :zip_code, format: { with: /\A\d{5}(-\d{4})?\z/ }, allow_blank: true

  validate :date_of_birth_reasonable

  # Scopes
  scope :for_user, ->(user) { where(user: user) }

  ##
  # Returns the patient's full name
  #
  # @return [String]
  #
  def full_name
    [first_name, last_name].compact.join(' ')
  end

  ##
  # Returns the display name (preferred name if set, otherwise first name)
  #
  # @return [String]
  #
  def display_name
    preferred_name.presence || first_name
  end

  ##
  # Calculates the patient's age
  #
  # @return [Integer, nil] Age in years
  #
  def age
    return nil unless date_of_birth

    today = Date.current
    age = today.year - date_of_birth.year
    age -= 1 if today < date_of_birth + age.years
    age
  end

  ##
  # Checks if patient is a minor (under 18)
  #
  # @return [Boolean]
  #
  def minor?
    return true unless age

    age < 18
  end

  ##
  # Returns formatted address
  #
  # @return [String, nil]
  #
  def formatted_address
    return nil unless address_line1

    parts = [address_line1]
    parts << address_line2 if address_line2.present?
    parts << [city, state, zip_code].compact.join(', ')
    parts.join("\n")
  end

  ##
  # Checks if emergency contact is provided
  #
  # @return [Boolean]
  #
  def has_emergency_contact?
    emergency_contact_name.present? && emergency_contact_phone.present?
  end

  ##
  # Returns gender label
  #
  # @return [String]
  #
  def gender_label
    GENDERS[gender] || gender
  end

  private

  ##
  # Determines if date of birth is required
  # Required for all patients in final submission
  #
  # @return [Boolean]
  #
  def requires_dob?
    # DOB is always required for patients
    true
  end

  ##
  # Validates date of birth is reasonable
  #
  def date_of_birth_reasonable
    return unless date_of_birth

    if date_of_birth > Date.current
      errors.add(:date_of_birth, 'cannot be in the future')
    elsif date_of_birth < 100.years.ago
      errors.add(:date_of_birth, 'is not a valid date')
    end
  end
end

