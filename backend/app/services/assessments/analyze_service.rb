# frozen_string_literal: true

##
# Assessments::AnalyzeService
#
# Analyzes completed assessment responses to determine scores,
# severity levels, and fit for the platform.
#
# @example
#   service = Assessments::AnalyzeService.new(assessment)
#   result = service.analyze
#   # => { score: 12, severity: 'moderate', subscales: {...}, fit: 'good' }
#
module Assessments
  class AnalyzeService
    attr_reader :assessment, :conversation

    ##
    # Initializes the analysis service
    #
    # @param assessment [Assessment] The assessment to analyze
    #
    def initialize(assessment)
      @assessment = assessment
      @conversation = assessment.conversation
    end

    ##
    # Performs full analysis of the assessment
    #
    # @return [Hash] Analysis results
    #
    def analyze
      responses = gather_responses

      # Calculate scores
      total_score = calculate_total_score(responses)
      subscale_scores = calculate_subscale_scores(responses)

      # Determine severity
      severity = determine_severity(total_score)

      # Check for safety concerns
      safety_flags = check_safety_flags(responses)

      # Determine fit
      fit_result = FitDeterminator.new(
        score: total_score,
        severity: severity,
        safety_flags: safety_flags,
        screener_type: assessment.screener_type
      ).determine

      # Build results
      results = {
        score: total_score,
        severity: severity,
        subscales: subscale_scores,
        safety_flags: safety_flags,
        fit: fit_result[:fit],
        fit_reason: fit_result[:reason],
        recommendations: fit_result[:recommendations],
        analyzed_at: Time.current.iso8601
      }

      # Update assessment with results
      assessment.analyze!(
        results_data: results,
        calculated_score: total_score,
        severity_level: severity
      )

      results
    end

    ##
    # Calculates just the score without full analysis
    #
    # @return [Hash] Score and severity
    #
    def calculate_score_only
      responses = gather_responses
      total_score = calculate_total_score(responses)
      severity = determine_severity(total_score)

      { score: total_score, severity: severity }
    end

    private

    ##
    # Gathers all responses for this assessment
    #
    def gather_responses
      if conversation&.screener_responses&.any?
        # Get from conversation (AI chat mode)
        conversation.screener_responses.each_with_object({}) do |sr, hash|
          hash[sr.question_id] = sr.extracted_value
        end
      else
        # Get from assessment (static form mode)
        assessment.responses || {}
      end
    end

    ##
    # Calculates total score from responses
    #
    def calculate_total_score(responses)
      responses.values.compact.sum
    end

    ##
    # Calculates subscale scores
    #
    def calculate_subscale_scores(responses)
      case assessment.screener_type
      when 'psc17'
        calculate_psc17_subscales(responses)
      when 'phq9a'
        calculate_phq9a_subscales(responses)
      when 'scared'
        calculate_scared_subscales(responses)
      else
        {}
      end
    end

    ##
    # PSC-17 subscale calculations
    #
    def calculate_psc17_subscales(responses)
      internalizing_ids = (1..5).map { |n| "psc17_#{n}" }
      attention_ids = (6..10).map { |n| "psc17_#{n}" }
      externalizing_ids = (11..17).map { |n| "psc17_#{n}" }

      {
        internalizing: {
          score: sum_scores(responses, internalizing_ids),
          cutoff: 5,
          elevated: sum_scores(responses, internalizing_ids) >= 5
        },
        attention: {
          score: sum_scores(responses, attention_ids),
          cutoff: 7,
          elevated: sum_scores(responses, attention_ids) >= 7
        },
        externalizing: {
          score: sum_scores(responses, externalizing_ids),
          cutoff: 7,
          elevated: sum_scores(responses, externalizing_ids) >= 7
        }
      }
    end

    ##
    # PHQ-9A subscale calculations
    #
    def calculate_phq9a_subscales(responses)
      {
        depression: {
          score: sum_scores(responses, (1..9).map { |n| "phq9a_#{n}" }),
          cutoff: 10,
          elevated: sum_scores(responses, (1..9).map { |n| "phq9a_#{n}" }) >= 10
        }
      }
    end

    ##
    # SCARED subscale calculations
    #
    def calculate_scared_subscales(responses)
      {
        anxiety: {
          score: sum_scores(responses, (1..5).map { |n| "scared_#{n}" }),
          cutoff: 3,
          elevated: sum_scores(responses, (1..5).map { |n| "scared_#{n}" }) >= 3
        }
      }
    end

    ##
    # Sums scores for given question IDs
    #
    def sum_scores(responses, question_ids)
      question_ids.sum { |id| responses[id].to_i }
    end

    ##
    # Determines severity based on total score
    #
    def determine_severity(score)
      case assessment.screener_type
      when 'psc17'
        psc17_severity(score)
      when 'phq9a'
        phq9a_severity(score)
      when 'scared'
        scared_severity(score)
      else
        'minimal'
      end
    end

    def psc17_severity(score)
      case score
      when 0..9 then 'minimal'
      when 10..14 then 'mild'
      when 15..24 then 'moderate'
      else 'severe'
      end
    end

    def phq9a_severity(score)
      case score
      when 0..4 then 'minimal'
      when 5..9 then 'mild'
      when 10..14 then 'moderate'
      when 15..19 then 'moderately_severe'
      else 'severe'
      end
    end

    def scared_severity(score)
      case score
      when 0..2 then 'minimal'
      when 3..4 then 'mild'
      when 5..6 then 'moderate'
      else 'severe'
      end
    end

    ##
    # Checks for safety-related flags
    #
    def check_safety_flags(responses)
      flags = {
        has_crisis_events: conversation&.crisis_events&.any? || false,
        unresolved_crisis: conversation&.has_unresolved_crisis? || false
      }

      # Check PHQ-9A Q9 (suicidal ideation)
      if assessment.screener_type == 'phq9a'
        q9_value = responses['phq9a_9'].to_i
        flags[:suicidal_ideation] = q9_value.positive?
        flags[:suicidal_ideation_severity] = q9_value
      end

      flags
    end
  end
end
