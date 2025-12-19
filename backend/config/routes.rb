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

      # Future routes will be added here:
      # resources :users, only: [:create, :show, :update]
      # resources :assessments, only: [:create, :show, :update]
      # resources :appointments, only: [:create, :index, :show]
      # etc.
    end
  end

  # GoodJob dashboard (development/admin only)
  if Rails.env.development?
    mount GoodJob::Engine => '/good_job'
  end

  # Letter Opener (development only)
  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: '/letter_opener'
  end
end

