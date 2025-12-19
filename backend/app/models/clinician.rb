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
#     accepted_insurances: ['Aetna', 'Blue Cross Blue Shield', 'United Healthcare'],
#     accepts_self_pay: true,
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

  # Common insurance providers
  COMMON_INSURANCES = [
    'Aetna',
    'Anthem',
    'Blue Cross Blue Shield',
    'Cigna',
    'Humana',
    'Kaiser Permanente',
    'Medicaid',
    'Medicare',
    'Molina Healthcare',
    'Oscar Health',
    'Tricare',
    'United Healthcare'
  ].freeze

  # Validations
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :status, presence: true, inclusion: { in: STATUSES.keys }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, allow_blank: true }

  # Scopes
  scope :active, -> { where(status: 'active') }
  scope :with_specialty, ->(specialty) { where('? = ANY(specialties)', specialty) }
  scope :accepts_insurance, ->(provider) { where('? = ANY(accepted_insurances)', provider) }
  scope :self_pay_friendly, -> { where(accepts_self_pay: true) }
  scope :sliding_scale, -> { where(offers_sliding_scale: true) }
  scope :uninsured_friendly, -> { where(accepts_self_pay: true).or(where(offers_sliding_scale: true)) }

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
  # Checks if clinician accepts a specific insurance provider
  #
  # @param provider [String] The insurance provider to check
  # @return [Boolean]
  #
  def accepts_insurance?(provider)
    return false if provider.blank?

    accepted_insurances.any? do |insurance|
      insurance.downcase.include?(provider.to_s.downcase) ||
        provider.to_s.downcase.include?(insurance.downcase)
    end
  end

  ##
  # Checks if clinician is suitable for uninsured patients
  #
  # @return [Boolean]
  #
  def uninsured_friendly?
    accepts_self_pay? || offers_sliding_scale?
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

  ##
  # Returns a random active clinician matching insurance criteria
  #
  # @param insurance_status [String] User's insurance status ('insured', 'self_pay', 'uninsured')
  # @param provider [String, nil] Optional insurance provider name
  # @return [Clinician, nil]
  #
  def self.random_for_insurance(insurance_status, provider = nil)
    base = active.kept

    case insurance_status
    when 'insured'
      if provider.present?
        # Try to find in-network clinician first
        in_network = base.accepts_insurance(provider)
        return in_network.order('RANDOM()').first if in_network.exists?
      end
      # Fall back to any active clinician
      base.order('RANDOM()').first
    when 'self_pay'
      base.self_pay_friendly.order('RANDOM()').first || base.order('RANDOM()').first
    when 'uninsured'
      base.uninsured_friendly.order('RANDOM()').first || base.order('RANDOM()').first
    else
      base.order('RANDOM()').first
    end
  end
end
