# frozen_string_literal: true

##
# AI::CrisisDetector Service
#
# Detects crisis indicators in user messages using keyword matching.
# Designed for future upgrade to LLM-based analysis.
#
# Risk Levels:
# - critical: Immediate danger, requires safety pivot
# - high: Serious concern, show safety resources
# - medium: Elevated concern, monitor and respond empathetically
# - low: Minor concern, continue with empathy
# - none: No crisis indicators detected
#
# @example
#   detector = AI::CrisisDetector.new
#   result = detector.analyze("I feel like giving up")
#   # => { risk_level: 'medium', flags: {...}, matched_keywords: [...] }
#
module AI
  class CrisisDetector
    # Risk level constants
    RISK_LEVELS = ['none', 'low', 'medium', 'high', 'critical'].freeze

    # Keyword categories with associated risk levels
    CRISIS_KEYWORDS = {
      critical: {
        suicide: [
          'suicide', 'suicidal', 'kill myself', 'end my life', 'end it all',
          'want to die', 'better off dead', 'take my own life', 'overdose',
          'slit my wrists', 'jump off', 'hang myself', 'shoot myself'
        ],
        self_harm_active: [
          'cutting myself', 'hurting myself', 'harm myself', 'hurt myself right now',
          'going to hurt', 'burning myself', 'punching walls'
        ],
        immediate_danger: [
          'have a plan', 'going to do it', 'tonight', 'right now', 'goodbye',
          'final goodbye', 'last message', 'note to my family'
        ]
      },
      high: {
        self_harm_ideation: [
          'want to hurt myself', 'feel like cutting', 'think about hurting',
          'self harm', 'self-harm', 'scratch myself', 'hit myself'
        ],
        abuse: [
          'being abused', 'someone hurts me', 'hitting me', 'touches me',
          'makes me do things', 'scared of them', 'threatens me', 'molested'
        ],
        severe_distress: [
          'can\'t take it anymore', 'can\'t go on', 'no way out', 'trapped',
          'no reason to live', 'nothing matters', 'no point', 'unbearable'
        ]
      },
      medium: {
        hopelessness: [
          'hopeless', 'no hope', 'never get better', 'always be this way',
          'giving up', 'what\'s the point', 'why bother', 'don\'t care anymore'
        ],
        worthlessness: [
          'worthless', 'useless', 'burden', 'everyone hates me', 'no one cares',
          'better without me', 'don\'t deserve', 'failure', 'hate myself'
        ],
        isolation: [
          'all alone', 'no one understands', 'nobody to talk to', 'completely alone',
          'no friends', 'no one to help', 'abandoned'
        ]
      },
      low: {
        general_distress: [
          'so sad', 'really sad', 'very depressed', 'extremely anxious',
          'can\'t cope', 'overwhelmed', 'breaking down', 'falling apart'
        ],
        sleep_issues: [
          'can\'t sleep at all', 'nightmares every night', 'afraid to sleep',
          'haven\'t slept in days'
        ]
      }
    }.freeze

    # Response modifiers that increase severity
    SEVERITY_MODIFIERS = {
      intensifiers: ['always', 'never', 'every day', 'constantly', 'all the time', 'worst'],
      temporal: ['right now', 'today', 'tonight', 'this week', 'lately'],
      certainty: ['definitely', 'for sure', 'i know', 'i will', 'going to']
    }.freeze

    attr_reader :content, :normalized_content

    ##
    # Analyzes content for crisis indicators
    #
    # @param content [String] User message content
    # @return [Hash] Analysis result with risk_level, flags, matched_keywords
    #
    def analyze(content)
      @content = content
      @normalized_content = normalize(content)

      matches = find_keyword_matches
      risk_level = determine_risk_level(matches)
      flags = build_flags(matches)

      {
        risk_level: risk_level,
        flags: flags,
        matched_keywords: matches.values.flatten,
        categories: matches.keys,
        requires_safety_pivot: risk_level == 'critical',
        show_resources: ['critical', 'high'].include?(risk_level)
      }
    end

    ##
    # Quick check if content has any crisis indicators
    #
    # @param content [String] Content to check
    # @return [Boolean] True if any crisis keywords found
    #
    def has_crisis_indicators?(content)
      result = analyze(content)
      result[:risk_level] != 'none'
    end

    ##
    # Gets appropriate response guidance based on risk level
    #
    # @param risk_level [String] Detected risk level
    # @return [Hash] Response guidance
    #
    def response_guidance(risk_level)
      case risk_level
      when 'critical'
        {
          action: 'safety_pivot',
          message: 'Pause conversation, show safety resources immediately',
          log_event: true,
          alert_staff: true
        }
      when 'high'
        {
          action: 'show_resources',
          message: 'Acknowledge with empathy, provide crisis resources',
          log_event: true,
          alert_staff: false
        }
      when 'medium'
        {
          action: 'empathetic_response',
          message: 'Respond with increased empathy, monitor closely',
          log_event: true,
          alert_staff: false
        }
      when 'low'
        {
          action: 'acknowledge',
          message: 'Acknowledge feelings, continue with warmth',
          log_event: false,
          alert_staff: false
        }
      else
        {
          action: 'continue',
          message: 'Continue normal conversation flow',
          log_event: false,
          alert_staff: false
        }
      end
    end

    private

    ##
    # Normalizes content for matching
    #
    # @param text [String] Text to normalize
    # @return [String] Normalized text
    #
    def normalize(text)
      text.to_s.downcase.gsub(/[^\w\s']/, ' ').squeeze(' ')
    end

    ##
    # Finds all keyword matches in content
    #
    # @return [Hash] Category => matched keywords
    #
    def find_keyword_matches
      matches = {}

      CRISIS_KEYWORDS.each do |risk_level, categories|
        categories.each do |category, keywords|
          found = keywords.select { |kw| normalized_content.include?(kw.downcase) }
          next if found.empty?

          matches["#{risk_level}_#{category}"] = found
        end
      end

      matches
    end

    ##
    # Determines overall risk level from matches
    #
    # @param matches [Hash] Keyword matches by category
    # @return [String] Risk level
    #
    def determine_risk_level(matches)
      return 'none' if matches.empty?

      # Check for critical keywords first
      return 'critical' if matches.keys.any? { |k| k.start_with?('critical_') }

      # Check for high risk
      return 'high' if matches.keys.any? { |k| k.start_with?('high_') }

      # Check for modifiers that might increase severity
      if matches.keys.any? { |k| k.start_with?('medium_') }
        return has_severity_modifiers? ? 'high' : 'medium'
      end

      # Low risk
      'low'
    end

    ##
    # Checks for severity-increasing modifiers
    #
    # @return [Boolean] True if modifiers found
    #
    def has_severity_modifiers?
      SEVERITY_MODIFIERS.values.flatten.any? do |modifier|
        normalized_content.include?(modifier.downcase)
      end
    end

    ##
    # Builds structured flags from matches
    #
    # @param matches [Hash] Keyword matches
    # @return [Hash] Structured flags
    #
    def build_flags(matches)
      {
        has_suicide_ideation: matches.keys.any? { |k| k.include?('suicide') },
        has_self_harm: matches.keys.any? { |k| k.include?('self_harm') },
        has_abuse_indicators: matches.keys.any? { |k| k.include?('abuse') },
        has_hopelessness: matches.keys.any? { |k| k.include?('hopelessness') },
        has_worthlessness: matches.keys.any? { |k| k.include?('worthlessness') },
        match_count: matches.values.flatten.length,
        category_count: matches.keys.length
      }
    end
  end
end
