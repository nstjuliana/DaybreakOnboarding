# frozen_string_literal: true

##
# Assessment Factory
#
# Factory definitions for creating Assessment instances in tests.
#
# @example Create a pending assessment
#   create(:assessment)
#
# @example Create a completed assessment
#   create(:assessment, :completed)
#
# @example Create an assessment with a user
#   create(:assessment, :with_user)
#
FactoryBot.define do
  factory :assessment do
    association :user, factory: [:user, :confirmed]
    screener_type { 'psc17' }
    status { 'pending' }
    responses { {} }
    results { {} }

    trait :pending do
      status { 'pending' }
      started_at { nil }
      completed_at { nil }
    end

    trait :in_progress do
      status { 'in_progress' }
      started_at { 5.minutes.ago }
      responses do
        {
          q1: rand(0..2),
          q2: rand(0..2),
          q3: rand(0..2)
        }
      end
    end

    trait :completed do
      status { 'completed' }
      started_at { 30.minutes.ago }
      completed_at { Time.current }
      score { rand(0..34) }
      responses do
        (1..17).to_h { |i| [:"q#{i}", rand(0..2)] }
      end
    end

    trait :analyzed do
      status { 'analyzed' }
      started_at { 30.minutes.ago }
      completed_at { 15.minutes.ago }
      score { 12 }
      severity { 'moderate' }
      responses do
        (1..17).to_h { |i| [:"q#{i}", rand(0..2)] }
      end
      results do
        {
          fit_for_daybreak: true,
          recommended_care_level: 'outpatient',
          priority_concerns: ['anxiety', 'mood'],
          summary: 'Moderate symptoms consistent with anxiety and depression.'
        }
      end
    end

    trait :psc17 do
      screener_type { 'psc17' }
    end

    trait :phq9a do
      screener_type { 'phq9a' }
    end

    trait :gad7 do
      screener_type { 'gad7' }
    end

    trait :high_severity do
      status { 'analyzed' }
      score { 28 }
      severity { 'severe' }
      results do
        {
          fit_for_daybreak: true,
          recommended_care_level: 'intensive_outpatient',
          priority_concerns: ['depression', 'suicide_risk'],
          requires_safety_planning: true
        }
      end
    end

    trait :low_severity do
      status { 'analyzed' }
      score { 4 }
      severity { 'minimal' }
      results do
        {
          fit_for_daybreak: true,
          recommended_care_level: 'prevention',
          priority_concerns: [],
          summary: 'Minimal symptoms. Preventive care recommended.'
        }
      end
    end

    trait :without_user do
      user { nil }
    end

    trait :discarded do
      discarded_at { Time.current }
    end
  end
end
