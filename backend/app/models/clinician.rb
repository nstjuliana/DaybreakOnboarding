# frozen_string_literal: true

##
# Clinician Model
#
# Represents a mental health provider (therapist, counselor, etc.)
# available for matching with users during the onboarding process.
#
# @see _docs/user-flow.md Phase 3D: Clinician Matching
#
# @example Creating a clinician
#   Clinician.create!(
#     first_name: 'Sarah',
#     last_name: 'Johnson',
#     credentials: 'LCSW',
#     specialties: ['anxiety', 'depression', 'adolescents'],
#     bio: 'I specialize in helping teens navigate anxiety...'
#   )
#
class Clinician < ApplicationRecord
  include Discard::Model

  # Associations
  has_many :appointments, dependent: :destroy

  # Status definitions
  STATUSES = {
    'active' => 'Available for new patients',
    'inactive' => 'Not currently accepting patients',
    'on_leave' => 'Temporarily unavailable'
  }.freeze

  # Validations
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :status, presence: true, inclusion: { in: STATUSES.keys }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, allow_blank: true }

  # Scopes
  scope :active, -> { where(status: 'active') }
  scope :with_specialty, ->(specialty) { where('? = ANY(specialties)', specialty) }

  ##
  # Returns the clinician's full display name with credentials
  #
  # @return [String] Full name with credentials (e.g., "Sarah Johnson, LCSW")
  #
  def display_name
    name = [first_name, last_name].compact.join(' ')
    credentials.present? ? "#{name}, #{credentials}" : name
  end

  ##
  # Returns just the full name without credentials
  #
  # @return [String] Full name
  #
  def full_name
    [first_name, last_name].compact.join(' ')
  end

  ##
  # Checks if clinician is currently active
  #
  # @return [Boolean]
  #
  def active?
    status == 'active'
  end

  ##
  # Checks if clinician has a specific specialty
  #
  # @param specialty [String] The specialty to check
  # @return [Boolean]
  #
  def has_specialty?(specialty)
    specialties.include?(specialty.to_s.downcase)
  end

  ##
  # Returns a random active clinician
  # Used for MVP matching before real matching logic is implemented
  #
  # @return [Clinician, nil]
  #
  def self.random_active
    active.kept.order('RANDOM()').first
  end
end

