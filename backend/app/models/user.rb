# frozen_string_literal: true

##
# User Model
#
# Represents a user in the Parent Onboarding AI system.
# Supports three user types: parent, minor, and friend.
#
# @see _docs/user-flow.md for user type definitions
#
# @example Creating a parent user
#   User.create!(
#     email: 'parent@example.com',
#     password: 'SecurePass123!',
#     user_type: 'parent',
#     first_name: 'Jane',
#     last_name: 'Doe'
#   )
#
class User < ApplicationRecord
  include Discard::Model

  # Devise modules
  # Note: :confirmable disabled for MVP (email confirmation not required)
  # Re-enable when email service is configured
  devise :database_authenticatable, :registerable, :recoverable,
         :rememberable, :validatable, :lockable,
         :timeoutable, :trackable, :jwt_authenticatable,
         jwt_revocation_strategy: JwtDenylist

  # Associations
  has_many :assessments, dependent: :destroy
  has_many :appointments, dependent: :destroy

  # User type definitions
  USER_TYPES = {
    'parent' => 'Parent/Guardian',
    'minor' => 'Self-Seeking Minor',
    'friend' => 'Concerned Friend'
  }.freeze

  # Validations
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :user_type, presence: true, inclusion: { in: USER_TYPES.keys }
  validates :phone, format: { with: /\A\+?[\d\s\-().]+\z/, allow_blank: true }

  # HIPAA-compliant password requirements (12+ chars with complexity)
  validates :password,
            length: { minimum: 12 },
            format: {
              with: /\A(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_]).+\z/,
              message: 'must include uppercase, lowercase, number, and special character'
            },
            if: :password_required?

  ##
  # Returns the user's full display name
  #
  # @return [String] Full name or email if no name set
  #
  def display_name
    if first_name.present? || last_name.present?
      [first_name, last_name].compact.join(' ')
    else
      email
    end
  end

  ##
  # Returns the human-readable user type label
  #
  # @return [String] User type display name
  #
  def user_type_label
    USER_TYPES[user_type] || user_type
  end

  ##
  # Checks if user is a parent/guardian
  #
  # @return [Boolean]
  #
  def parent?
    user_type == 'parent'
  end

  ##
  # Checks if user is a self-seeking minor
  #
  # @return [Boolean]
  #
  def minor?
    user_type == 'minor'
  end

  ##
  # Checks if user is a concerned friend
  #
  # @return [Boolean]
  #
  def friend?
    user_type == 'friend'
  end

  ##
  # Returns the most recent assessment
  #
  # @return [Assessment, nil]
  #
  def latest_assessment
    assessments.order(created_at: :desc).first
  end

  private

  ##
  # Determines if password validation should run
  # Required for new records or when password is being changed
  #
  # @return [Boolean]
  #
  def password_required?
    !persisted? || password.present? || password_confirmation.present?
  end
end

