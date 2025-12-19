# frozen_string_literal: true

##
# Assessments::FitDeterminator
#
# Determines if a user is a good fit for the platform based on
# assessment results and safety considerations.
#
# Fit levels:
# - good_fit: Mild to moderate symptoms, no imminent risk → Phase 3
# - conditional_fit: Some concerns but may proceed with monitoring
# - not_a_fit: Severe symptoms, crisis, specialized needs → Off-ramp
#
# @example
#   determinator = Assessments::FitDeterminator.new(
#     score: 12,
#     severity: 'moderate',
#     safety_flags: { has_crisis_events: false }
#   )
#   result = determinator.determine
#   # => { fit: 'good_fit', reason: '...', recommendations: [...] }
#
module Assessments
  class FitDeterminator
    # Severity levels that are automatic disqualifiers
    SEVERE_SEVERITIES = ['severe', 'moderately_severe'].freeze

    # Score thresholds by screener type
    SCORE_THRESHOLDS = {
      'psc17' => { max_for_fit: 24, concerning: 15 },
      'phq9a' => { max_for_fit: 19, concerning: 10 },
      'scared' => { max_for_fit: 6, concerning: 3 }
    }.freeze

    attr_reader :score, :severity, :safety_flags, :screener_type

    ##
    # Initializes the determinator
    #
    # @param score [Integer] Total assessment score
    # @param severity [String] Severity level
    # @param safety_flags [Hash] Safety-related flags
    # @param screener_type [String] Type of screener used
    #
    def initialize(score:, severity:, safety_flags:, screener_type: 'psc17')
      @score = score
      @severity = severity
      @safety_flags = safety_flags || {}
      @screener_type = screener_type
    end

    ##
    # Determines fit based on all factors
    #
    # @return [Hash] Fit determination with reason and recommendations
    #
    def determine
      # Check for automatic disqualifiers first
      return not_a_fit_result(crisis_reason) if has_active_crisis?
      return not_a_fit_result(suicidal_ideation_reason) if has_suicidal_ideation?
      return not_a_fit_result(severe_symptoms_reason) if has_severe_symptoms?

      # Check score thresholds
      thresholds = SCORE_THRESHOLDS[screener_type] || SCORE_THRESHOLDS['psc17']

      return not_a_fit_result(high_score_reason) if score > thresholds[:max_for_fit]

      return conditional_fit_result if score >= thresholds[:concerning]

      # Good fit
      good_fit_result
    end

    ##
    # Quick check if user is a fit
    #
    # @return [Boolean] True if good or conditional fit
    #
    def fit?
      result = determine
      ['good_fit', 'conditional_fit'].include?(result[:fit])
    end

    private

    def has_active_crisis?
      safety_flags[:unresolved_crisis] == true
    end

    def has_suicidal_ideation?
      safety_flags[:suicidal_ideation] == true &&
        safety_flags[:suicidal_ideation_severity].to_i >= 2
    end

    def has_severe_symptoms?
      SEVERE_SEVERITIES.include?(severity)
    end

    def good_fit_result
      {
        fit: 'good_fit',
        reason: 'Your responses indicate mild to moderate concerns that we can help with.',
        recommendations: [
          'Continue to Phase 3 to create your account',
          'We will match you with a clinician suited to your needs',
          'Your first session will include a more detailed assessment'
        ],
        next_step: 'phase_3'
      }
    end

    def conditional_fit_result
      {
        fit: 'conditional_fit',
        reason: 'Your responses suggest some elevated concerns. We can still help, ' \
                'but want to make sure you get the right level of support.',
        recommendations: [
          'Continue to Phase 3 to speak with a clinician',
          'Your clinician will conduct a thorough evaluation',
          'If more intensive support is needed, we will help you find appropriate resources'
        ],
        next_step: 'phase_3',
        monitoring_required: true
      }
    end

    def not_a_fit_result(reason)
      {
        fit: 'not_a_fit',
        reason: reason,
        recommendations: off_ramp_recommendations,
        next_step: 'off_ramp',
        resources: off_ramp_resources
      }
    end

    def crisis_reason
      'You indicated you may be experiencing a crisis. ' \
        'We want to make sure you get immediate support from trained professionals.'
    end

    def suicidal_ideation_reason
      'Your responses indicate you may be having thoughts of self-harm. ' \
        'We want to connect you with specialized support right away.'
    end

    def severe_symptoms_reason
      'Your responses indicate significant symptoms that may benefit from ' \
        'a higher level of care than our platform currently provides.'
    end

    def high_score_reason
      'Based on your responses, we recommend connecting with a provider ' \
        'who can offer more comprehensive support for your current needs.'
    end

    def off_ramp_recommendations
      [
        'Consider reaching out to a crisis helpline if you need immediate support',
        'Contact your primary care provider for a referral',
        'Look into community mental health centers in your area',
        'Remember: seeking help is a sign of strength'
      ]
    end

    def off_ramp_resources
      [
        {
          name: '988 Suicide & Crisis Lifeline',
          phone: '988',
          available: '24/7'
        },
        {
          name: 'SAMHSA Treatment Locator',
          website: 'https://findtreatment.gov',
          description: 'Find local mental health services'
        },
        {
          name: 'Psychology Today Therapist Finder',
          website: 'https://www.psychologytoday.com/us/therapists',
          description: 'Search for therapists in your area'
        }
      ]
    end
  end
end
