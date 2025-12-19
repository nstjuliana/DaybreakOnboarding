# frozen_string_literal: true

##
# Clinician Factory
#
# Factory definitions for creating Clinician instances in tests.
#
# @example Create an active clinician
#   create(:clinician)
#
# @example Create a clinician with specific specialties
#   create(:clinician, specialties: ['anxiety', 'depression'])
#
FactoryBot.define do
  factory :clinician do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    credentials { ['LCSW', 'PhD', 'PsyD', 'LMFT', 'LPC'].sample }
    bio { Faker::Lorem.paragraph(sentence_count: 3) }
    email { Faker::Internet.email }
    phone { Faker::PhoneNumber.cell_phone }
    status { 'active' }
    specialties { ['anxiety', 'depression', 'adolescents'].sample(2) }

    trait :active do
      status { 'active' }
    end

    trait :inactive do
      status { 'inactive' }
    end

    trait :on_leave do
      status { 'on_leave' }
    end

    trait :with_photo do
      photo_url { Faker::Avatar.image }
    end

    trait :with_video do
      video_url { 'https://example.com/videos/intro.mp4' }
    end

    trait :with_availability do
      availability do
        {
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '12:00' }]
        }
      end
    end

    trait :anxiety_specialist do
      specialties { ['anxiety', 'panic_disorder', 'phobias'] }
    end

    trait :depression_specialist do
      specialties { ['depression', 'mood_disorders', 'grief'] }
    end

    trait :adolescent_specialist do
      specialties { ['adolescents', 'teens', 'youth'] }
    end

    trait :discarded do
      discarded_at { Time.current }
    end
  end
end
