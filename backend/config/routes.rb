# frozen_string_literal: true

##
# Routes Configuration
#
# Defines API routes for the Parent Onboarding AI application.
# All routes are namespaced under /api/v1 for versioning.
#
# @see _docs/tech-stack.md for API conventions
#

Rails.application.routes.draw do
  # Health check endpoint (outside API namespace for load balancer access)
  get 'up', to: 'rails/health#show', as: :rails_health_check

  # API routes
  namespace :api do
    namespace :v1 do
      # Health check with detailed status
      get 'health', to: 'health#show'

      # Authentication routes (Devise)
      namespace :auth do
        post 'register', to: 'registrations#create'
        post 'login', to: 'sessions#create'
        delete 'logout', to: 'sessions#destroy'
      end

      # Current user routes
      resource :user, only: %i[show update], controller: 'users', path: 'users/me'

      # Assessments
      resources :assessments, only: %i[create show update]

      # Clinicians
      resources :clinicians, only: %i[index show] do
        get 'random', on: :collection
      end

      # Appointments (stub for MVP)
      resources :appointments, only: %i[create show index]
    end
  end

  # Devise routes (mounted but not directly used - we use custom controllers)
  devise_for :users, skip: :all

  # GoodJob dashboard (development/admin only)
  mount GoodJob::Engine => '/good_job' if Rails.env.development?

  # Letter Opener (development only)
  mount LetterOpenerWeb::Engine, at: '/letter_opener' if Rails.env.development?
end
