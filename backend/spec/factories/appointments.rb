# frozen_string_literal: true

##
# Appointment Factory
#
# Factory definitions for creating Appointment instances in tests.
#
# @example Create a scheduled appointment
#   create(:appointment)
#
# @example Create a confirmed appointment
#   create(:appointment, :confirmed)
#
# @example Create an appointment for a specific date
#   create(:appointment, scheduled_at: 3.days.from_now)
#
FactoryBot.define do
  factory :appointment do
    association :user, factory: [:user, :confirmed]
    association :clinician, factory: [:clinician, :active]
    association :assessment, factory: [:assessment, :analyzed]

    scheduled_at { 3.days.from_now }
    duration_minutes { 50 }
    session_type { 'initial' }
    status { 'scheduled' }

    trait :scheduled do
      status { 'scheduled' }
      confirmed_at { nil }
    end

    trait :confirmed do
      status { 'confirmed' }
      confirmed_at { Time.current }
    end

    trait :in_progress do
      status { 'in_progress' }
      confirmed_at { 1.day.ago }
      scheduled_at { Time.current }
    end

    trait :completed do
      status { 'completed' }
      confirmed_at { 2.days.ago }
      scheduled_at { 1.day.ago }
    end

    trait :cancelled do
      status { 'cancelled' }
      cancelled_at { Time.current }
      cancellation_reason { 'Patient requested cancellation' }
    end

    trait :no_show do
      status { 'no_show' }
      scheduled_at { 1.day.ago }
    end

    trait :initial_consultation do
      session_type { 'initial' }
      duration_minutes { 30 }
    end

    trait :diagnostic do
      session_type { 'diagnostic' }
      duration_minutes { 50 }
    end

    trait :therapy do
      session_type { 'therapy' }
      duration_minutes { 50 }
    end

    trait :follow_up do
      session_type { 'follow_up' }
      duration_minutes { 30 }
    end

    trait :with_telehealth do
      telehealth_url { "https://telehealth.daybreakhealth.com/#{SecureRandom.uuid}" }
    end

    trait :tomorrow do
      scheduled_at { 1.day.from_now.change(hour: 10) }
    end

    trait :next_week do
      scheduled_at { 1.week.from_now.change(hour: 14) }
    end

    trait :past do
      scheduled_at { 2.days.ago }
      status { 'completed' }
    end

    trait :discarded do
      discarded_at { Time.current }
    end
  end
end
