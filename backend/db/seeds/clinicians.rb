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
    accepted_insurances: ['Aetna', 'Blue Cross Blue Shield', 'United Healthcare', 'Cigna'],
    accepts_self_pay: true,
    offers_sliding_scale: false,
    status: 'active'
  },
  {
    first_name: 'Michael',
    last_name: 'Chen',
    credentials: 'PhD',
    bio: "As a clinical psychologist, I'm passionate about helping teens and their families build resilience and find their strengths. I use evidence-based approaches including CBT and DBT to help young people manage difficult emotions and improve their relationships. I create a judgment-free zone where healing can happen.",
    photo_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
    specialties: ['anxiety', 'depression', 'behavioral_issues', 'teens', 'cbt', 'dbt'],
    accepted_insurances: ['Anthem', 'Kaiser Permanente', 'United Healthcare'],
    accepts_self_pay: true,
    offers_sliding_scale: true,
    status: 'active'
  },
  {
    first_name: 'Emily',
    last_name: 'Rodriguez',
    credentials: 'LMFT',
    bio: "I'm dedicated to supporting families through challenging times with compassion and expertise. My background in family systems therapy helps me work with the whole family unit, not just the individual. I believe in the power of connection and help families strengthen their bonds while addressing mental health concerns.",
    photo_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
    specialties: ['family_therapy', 'adolescents', 'mood_disorders', 'life_transitions'],
    accepted_insurances: ['Medicaid', 'Blue Cross Blue Shield', 'Molina Healthcare'],
    accepts_self_pay: true,
    offers_sliding_scale: true,
    status: 'active'
  },
  {
    first_name: 'David',
    last_name: 'Thompson',
    credentials: 'PsyD',
    bio: 'Working with young people is my calling. I specialize in helping children and teens who are struggling with anxiety, ADHD, and social challenges. I use play therapy, CBT, and mindfulness techniques to help kids build confidence and develop the skills they need to thrive at home and school.',
    photo_url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400',
    specialties: ['children', 'anxiety', 'adhd', 'social_skills', 'play_therapy'],
    accepted_insurances: ['Humana', 'Tricare', 'Cigna', 'Aetna'],
    accepts_self_pay: true,
    offers_sliding_scale: false,
    status: 'active'
  },
  {
    first_name: 'Aisha',
    last_name: 'Patel',
    credentials: 'LPC',
    bio: "I provide culturally-sensitive care that honors each family's unique background and values. My experience working with diverse communities has taught me that healing looks different for everyone. I specialize in trauma-informed care and helping young people process difficult experiences in a safe, supportive environment.",
    photo_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400',
    specialties: ['trauma', 'anxiety', 'depression', 'teens', 'cultural_sensitivity'],
    accepted_insurances: ['Oscar Health', 'Medicaid', 'Blue Cross Blue Shield'],
    accepts_self_pay: true,
    offers_sliding_scale: true,
    status: 'active'
  },
  # Test data for insurance matching - specific providers
  {
    first_name: 'Lisa',
    last_name: 'Anderson',
    credentials: 'LCSW',
    bio: "Specialized in adolescent behavioral therapy with proven success in helping teens develop healthy coping mechanisms. I've worked with families across diverse backgrounds and income levels.",
    photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    specialties: ['anxiety', 'behavioral_issues', 'teens'],
    accepted_insurances: ['Blue Cross Blue Shield', 'Aetna', 'Anthem'],
    accepts_self_pay: true,
    offers_sliding_scale: false,
    status: 'active'
  },
  {
    first_name: 'James',
    last_name: 'Williams',
    credentials: 'PhD',
    bio: 'Trauma-focused cognitive behavioral therapy specialist with 15+ years of experience. I focus on helping young people heal from difficult experiences and build resilience.',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    specialties: ['trauma', 'ptsd', 'anxiety'],
    accepted_insurances: ['Kaiser Permanente', 'Cigna', 'Humana'],
    accepts_self_pay: true,
    offers_sliding_scale: false,
    status: 'active'
  },
  {
    first_name: 'Rachel',
    last_name: 'Martinez',
    credentials: 'LMFT',
    bio: 'Family systems specialist dedicated to helping families communicate more effectively and resolve conflicts. Experience with adolescent depression and anxiety.',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    specialties: ['family_therapy', 'communication', 'depression'],
    accepted_insurances: ['Medicaid', 'Oscar Health', 'United Healthcare'],
    accepts_self_pay: true,
    offers_sliding_scale: true,
    status: 'active'
  },
  {
    first_name: 'Kevin',
    last_name: 'Lee',
    credentials: 'PsyD',
    bio: 'Play therapy and child psychology specialist. I create a safe, creative space for children to express themselves and work through emotional challenges.',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    specialties: ['children', 'play_therapy', 'anxiety'],
    accepted_insurances: ['Tricare', 'Aetna', 'Blue Cross Blue Shield', 'Medicare'],
    accepts_self_pay: false,
    offers_sliding_scale: true,
    status: 'active'
  },
  {
    first_name: 'Sophia',
    last_name: 'Okafor',
    credentials: 'LPC',
    bio: 'Culturally competent therapist specializing in helping adolescents from diverse backgrounds navigate mental health challenges. Passionate about reducing barriers to mental healthcare.',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    specialties: ['anxiety', 'depression', 'teens', 'cultural_sensitivity'],
    accepted_insurances: ['Molina Healthcare', 'Medicaid', 'Oscar Health'],
    accepts_self_pay: true,
    offers_sliding_scale: true,
    status: 'active'
  },
  {
    first_name: 'Marcus',
    last_name: 'Jackson',
    credentials: 'LCSW',
    bio: 'ADHD and neurodevelopmental specialist with expertise in helping teens manage attention challenges and develop executive functioning skills.',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    specialties: ['adhd', 'social_skills', 'executive_functioning'],
    accepted_insurances: ['United Healthcare', 'Cigna', 'Anthem'],
    accepts_self_pay: true,
    offers_sliding_scale: false,
    status: 'active'
  },
  {
    first_name: 'Elena',
    last_name: 'Rossi',
    credentials: 'PhD',
    bio: 'Eating disorders and body image specialist with training in Family-Based Treatment. I work with teens and families to build healthy relationships with food and body.',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    specialties: ['eating_disorders', 'body_image', 'anxiety'],
    accepted_insurances: ['Kaiser Permanente', 'Blue Cross Blue Shield'],
    accepts_self_pay: true,
    offers_sliding_scale: false,
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
