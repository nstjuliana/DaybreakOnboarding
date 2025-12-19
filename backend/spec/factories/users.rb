# frozen_string_literal: true

##
# User Factory
#
# Factory definitions for creating User instances in tests.
#
# @example Create a parent user
#   create(:user)
#   create(:user, :parent)
#
# @example Create a minor user
#   create(:user, :minor)
#
# @example Create a confirmed user
#   create(:user, :confirmed)
#
FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { 'SecurePass123!' }
    password_confirmation { 'SecurePass123!' }
    user_type { 'parent' }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    phone { Faker::PhoneNumber.cell_phone }

    trait :parent do
      user_type { 'parent' }
    end

    trait :minor do
      user_type { 'minor' }
      date_of_birth { Faker::Date.birthday(min_age: 13, max_age: 17) }
    end

    trait :friend do
      user_type { 'friend' }
    end

    trait :confirmed do
      confirmed_at { Time.current }
    end

    trait :unconfirmed do
      confirmed_at { nil }
    end

    trait :locked do
      locked_at { Time.current }
      failed_attempts { 5 }
    end

    trait :with_profile do
      profile do
        {
          preferred_contact: 'email',
          timezone: 'America/Los_Angeles',
          language: 'en'
        }
      end
    end

    trait :discarded do
      discarded_at { Time.current }
    end
  end
end

