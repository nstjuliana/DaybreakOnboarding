# frozen_string_literal: true

##
# Scheduling::MatchClinicianService
#
# Matches users with appropriate clinicians based on assessment results,
# specialties, availability, and preferences using weighted scoring.
#
# Scoring weights (medium complexity):
# - Specialty match: 40%
# - Availability: 35%
# - Random factor: 25% (for load balancing)
#
# @see Clinician model
# @see Assessment model
# @see _docs/phases/phase-3-insurance-matching.md
#
# @example Basic matching
#   service = Scheduling::MatchClinicianService.new(user, assessment)
#   matches = service.match
#   # => [{ clinician: #<Clinician>, score: 0.85, reasons: [...] }, ...]
#
module Scheduling
  class MatchClinicianService
    # Scoring weights
    SPECIALTY_WEIGHT = 0.40
    AVAILABILITY_WEIGHT = 0.35
    RANDOM_WEIGHT = 0.25

    # Number of matches to return
    TOP_MATCHES = 3

    ##
    # Initializes the matching service
    #
    # @param user [User] The user to match
    # @param assessment [Assessment, nil] Optional completed assessment
    # @param preferences [Hash] Optional user preferences
    #
    def initialize(user, assessment = nil, preferences = {})
      @user = user
      @assessment = assessment || user.latest_assessment
      @preferences = preferences
    end

    ##
    # Performs the matching and returns top clinicians
    #
    # @return [Array<Hash>] Array of match results with clinician, score, and reasons
    #
    def match
      candidates = eligible_clinicians
      return [] if candidates.empty?

      scored = candidates.map { |clinician| score_clinician(clinician) }
      sorted = scored.sort_by { |result| -result[:score] }

      sorted.first(TOP_MATCHES)
    end

    ##
    # Returns the top match or nil
    #
    # @return [Clinician, nil]
    #
    def top_match
      matches = match
      matches.first&.dig(:clinician)
    end

    private

    ##
    # Gets list of eligible clinicians
    #
    # @return [Array<Clinician>]
    #
    def eligible_clinicians
      Clinician.active.kept.to_a
    end

    ##
    # Scores a single clinician
    #
    # @param clinician [Clinician] The clinician to score
    # @return [Hash] Score result with clinician, score, and reasons
    #
    def score_clinician(clinician)
      specialty_score = calculate_specialty_score(clinician)
      availability_score = calculate_availability_score(clinician)
      random_score = rand

      total_score = (specialty_score * SPECIALTY_WEIGHT) +
                    (availability_score * AVAILABILITY_WEIGHT) +
                    (random_score * RANDOM_WEIGHT)

      reasons = build_match_reasons(clinician, specialty_score, availability_score)

      {
        clinician: clinician,
        score: total_score.round(3),
        specialty_score: specialty_score.round(3),
        availability_score: availability_score.round(3),
        reasons: reasons
      }
    end

    ##
    # Calculates specialty match score
    #
    # @param clinician [Clinician] The clinician
    # @return [Float] Score from 0.0 to 1.0
    #
    def calculate_specialty_score(clinician)
      return 0.5 unless @assessment # Default if no assessment

      # Get concern areas from assessment
      concerns = extract_concerns_from_assessment

      return 0.5 if concerns.empty?

      # Calculate overlap between concerns and specialties
      matches = (concerns & clinician.specialties.map(&:downcase)).length
      total = [concerns.length, 1].max

      # Base score from overlap plus bonus for having any match
      base_score = matches.to_f / total
      has_match_bonus = matches.positive? ? 0.2 : 0

      [base_score + has_match_bonus, 1.0].min
    end

    ##
    # Calculates availability score
    #
    # @param clinician [Clinician] The clinician
    # @return [Float] Score from 0.0 to 1.0
    #
    def calculate_availability_score(clinician)
      # Check if clinician has any availability in next 2 weeks
      availability = clinician.availability || {}
      return 0.3 if availability.empty?

      # Count available slots
      slot_count = count_available_slots(availability)

      # Normalize to 0-1 (assuming 20+ slots is ideal)
      [slot_count / 20.0, 1.0].min
    end

    ##
    # Counts available slots from availability data
    #
    # @param availability [Hash] Availability configuration
    # @return [Integer] Number of available slots
    #
    def count_available_slots(availability)
      # Availability is stored as { day_of_week: [{ start: '09:00', end: '17:00' }] }
      total_slots = 0

      availability.each_value do |slots|
        next unless slots.is_a?(Array)

        slots.each do |slot|
          next unless slot['start'] && slot['end']

          start_time = Time.zone.parse(slot['start'])
          end_time = Time.zone.parse(slot['end'])
          hours = (end_time - start_time) / 3600
          # Assume 1-hour appointments
          total_slots += hours.to_i
        rescue ArgumentError
          next
        end
      end

      total_slots
    end

    ##
    # Extracts concern areas from assessment results
    #
    # @return [Array<String>] List of concern keywords
    #
    def extract_concerns_from_assessment
      return [] unless @assessment

      concerns = concerns_from_screener_type
      concerns += concerns_from_severity
      concerns += concerns_from_result_flags

      concerns.uniq.map(&:downcase)
    end

    ##
    # Maps screener type to concern keywords
    #
    # @return [Array<String>] Concerns based on screener type
    #
    def concerns_from_screener_type
      screener_concerns = {
        'phq9a' => ['depression', 'mood'],
        'scared' => ['anxiety', 'worry', 'fear'],
        'psc17' => ['behavioral', 'emotional', 'attention']
      }

      screener_concerns[@assessment.screener_type] || []
    end

    ##
    # Extracts concerns from assessment severity
    #
    # @return [Array<String>] Concerns based on severity
    #
    def concerns_from_severity
      high_severities = ['moderate', 'moderately_severe', 'severe']
      return [@assessment.screener_type] if high_severities.include?(@assessment.severity)

      []
    end

    ##
    # Extracts concerns from assessment result flags
    #
    # @return [Array<String>] Concerns based on result flags
    #
    def concerns_from_result_flags
      results = @assessment.results || {}
      concerns = []

      concerns << 'anxiety' if results['anxiety_flag']
      concerns << 'depression' if results['depression_flag']
      concerns << 'behavioral' if results['behavioral_flag']

      concerns
    end

    ##
    # Builds human-readable match reasons
    #
    # @param clinician [Clinician] The clinician
    # @param specialty_score [Float] Specialty match score
    # @param availability_score [Float] Availability score
    # @return [Array<String>] List of reasons
    #
    def build_match_reasons(clinician, specialty_score, availability_score)
      reasons = []

      if specialty_score > 0.6
        matching_specialties = extract_concerns_from_assessment & clinician.specialties.map(&:downcase)
        reasons << "Specializes in #{matching_specialties.join(', ')}" if matching_specialties.any?
      end

      if availability_score > 0.5
        reasons << 'Good availability in the next two weeks'
      elsif availability_score.positive?
        reasons << 'Some availability'
      end

      reasons << "#{clinician.credentials} credentials" if clinician.credentials.present?

      reasons
    end
  end
end
