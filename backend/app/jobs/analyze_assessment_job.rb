# frozen_string_literal: true

##
# AnalyzeAssessmentJob
#
# Background job for analyzing completed assessments.
# Calculates scores, determines severity, and evaluates fit.
#
# @example
#   AnalyzeAssessmentJob.perform_later(assessment_id: assessment.id)
#
class AnalyzeAssessmentJob < ApplicationJob
  queue_as :default

  # Retry configuration
  retry_on StandardError, wait: :exponentially_longer, attempts: 3
  discard_on ActiveRecord::RecordNotFound

  ##
  # Performs the assessment analysis
  #
  # @param assessment_id [String] UUID of the assessment
  # @param options [Hash] Additional options
  #   - force: Boolean - reanalyze even if already analyzed
  #   - notify: Boolean - send notification on completion
  #
  def perform(assessment_id:, options: {})
    assessment = Assessment.find(assessment_id)

    # Skip if already analyzed (unless forced)
    if assessment.status == 'analyzed' && !options[:force]
      Rails.logger.info "[AnalyzeAssessmentJob] Assessment #{assessment_id} already analyzed"
      return
    end

    # Perform analysis
    analyze_service = Assessments::AnalyzeService.new(assessment)
    result = analyze_service.analyze

    Rails.logger.info "[AnalyzeAssessmentJob] Analysis complete for #{assessment_id}: " \
                      "score=#{result[:score]}, severity=#{result[:severity]}, fit=#{result[:fit]}"

    # Handle fit determination outcomes
    case result[:fit]
    when 'good_fit', 'conditional_fit'
      handle_good_fit(assessment, result)
    when 'not_a_fit'
      handle_not_a_fit(assessment, result)
    end

    # Send notification if requested
    notify_completion(assessment, result) if options[:notify]

    result
  end

  private

  ##
  # Handles good/conditional fit outcome
  #
  def handle_good_fit(assessment, result)
    Rails.logger.info "[AnalyzeAssessmentJob] Assessment #{assessment.id} is a #{result[:fit]}"

    # Update assessment metadata
    assessment.update!(
      results: assessment.results.merge(
        ready_for_matching: true,
        fit_determination_at: Time.current.iso8601
      )
    )
  end

  ##
  # Handles not-a-fit outcome
  #
  def handle_not_a_fit(assessment, result)
    Rails.logger.info "[AnalyzeAssessmentJob] Assessment #{assessment.id} is not a fit"

    # Update assessment metadata
    assessment.update!(
      results: assessment.results.merge(
        ready_for_matching: false,
        off_ramp_reason: result[:reason],
        fit_determination_at: Time.current.iso8601
      )
    )

    # Send off-ramp notification/email if configured
    send_off_ramp_notification(assessment, result)
  end

  ##
  # Sends completion notification
  #
  def notify_completion(assessment, _result)
    # Implementation depends on notification system
    # Could trigger email, push notification, etc.
    Rails.logger.info "[AnalyzeAssessmentJob] Completion notification for #{assessment.id}"
  end

  ##
  # Sends off-ramp notification
  #
  def send_off_ramp_notification(assessment, _result)
    # Could send email with resources
    # Could notify clinical staff for review
    Rails.logger.info "[AnalyzeAssessmentJob] Off-ramp notification for #{assessment.id}"
  end
end
