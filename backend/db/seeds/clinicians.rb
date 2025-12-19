# frozen_string_literal: true

##
# Clinician Seed Data
#
# Creates sample clinician profiles for development and testing.
# These are fictional clinicians with realistic credentials.
#
# @see Clinician model
#

Rails.logger.debug 'Seeding clinicians...'

clinicians_data = [
  {
    first_name: 'Sarah',
    last_name: 'Johnson',
    credentials: 'LCSW',
    bio: "I believe every young person deserves a safe space to explore their feelings and develop coping skills. With over 10 years of experience working with children and adolescents, I specialize in helping families navigate anxiety, depression, and life transitions. My approach is warm, collaborative, and tailored to each family's unique needs.",
    photo_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
    specialties: ['anxiety', 'depression', 'adolescents', 'family_therapy'],
    status: 'active'
  },
  {
    first_name: 'Michael',
    last_name: 'Chen',
    credentials: 'PhD',
    bio: "As a clinical psychologist, I'm passionate about helping teens and their families build resilience and find their strengths. I use evidence-based approaches including CBT and DBT to help young people manage difficult emotions and improve their relationships. I create a judgment-free zone where healing can happen.",
    photo_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
    specialties: ['anxiety', 'depression', 'behavioral_issues', 'teens', 'cbt', 'dbt'],
    status: 'active'
  },
  {
    first_name: 'Emily',
    last_name: 'Rodriguez',
    credentials: 'LMFT',
    bio: "I'm dedicated to supporting families through challenging times with compassion and expertise. My background in family systems therapy helps me work with the whole family unit, not just the individual. I believe in the power of connection and help families strengthen their bonds while addressing mental health concerns.",
    photo_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
    specialties: ['family_therapy', 'adolescents', 'mood_disorders', 'life_transitions'],
    status: 'active'
  },
  {
    first_name: 'David',
    last_name: 'Thompson',
    credentials: 'PsyD',
    bio: 'Working with young people is my calling. I specialize in helping children and teens who are struggling with anxiety, ADHD, and social challenges. I use play therapy, CBT, and mindfulness techniques to help kids build confidence and develop the skills they need to thrive at home and school.',
    photo_url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400',
    specialties: ['children', 'anxiety', 'adhd', 'social_skills', 'play_therapy'],
    status: 'active'
  },
  {
    first_name: 'Aisha',
    last_name: 'Patel',
    credentials: 'LPC',
    bio: "I provide culturally-sensitive care that honors each family's unique background and values. My experience working with diverse communities has taught me that healing looks different for everyone. I specialize in trauma-informed care and helping young people process difficult experiences in a safe, supportive environment.",
    photo_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400',
    specialties: ['trauma', 'anxiety', 'depression', 'teens', 'cultural_sensitivity'],
    status: 'active'
  }
]

clinicians_data.each do |data|
  clinician = Clinician.find_or_initialize_by(
    first_name: data[:first_name],
    last_name: data[:last_name]
  )

  clinician.assign_attributes(data)
  clinician.save!

  Rails.logger.debug { "  Created/Updated clinician: #{clinician.display_name}" }
end

Rails.logger.debug { "Seeded #{Clinician.count} clinicians." }
