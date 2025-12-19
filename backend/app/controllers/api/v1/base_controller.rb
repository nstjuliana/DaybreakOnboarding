# frozen_string_literal: true

##
# Api::V1::BaseController
#
# Base controller for all V1 API endpoints.
# Provides common API functionality including authentication hooks.
#
# All API controllers should inherit from this class.
#
module Api
  module V1
    class BaseController < ApplicationController
      # Authentication will be added here once Devise is configured
      # before_action :authenticate_user!

      # Verify authorization was performed (Pundit)
      # after_action :verify_authorized, except: :index
      # after_action :verify_policy_scoped, only: :index

      private

      ##
      # Returns the current API version
      #
      # @return [String] API version string
      #
      def api_version
        'v1'
      end

      ##
      # Pagination helper for index actions
      #
      # @param collection [ActiveRecord::Relation] The collection to paginate
      # @param per_page [Integer] Items per page (default: 25)
      # @return [ActiveRecord::Relation] Paginated collection
      #
      def paginate(collection, per_page: 25)
        page = params[:page]&.to_i || 1
        page = 1 if page < 1

        collection.limit(per_page).offset((page - 1) * per_page)
      end

      ##
      # Returns pagination metadata
      #
      # @param collection [ActiveRecord::Relation] The full collection
      # @param per_page [Integer] Items per page
      # @return [Hash] Pagination metadata
      #
      def pagination_meta(collection, per_page: 25)
        total_count = collection.count
        total_pages = (total_count.to_f / per_page).ceil
        current_page = params[:page]&.to_i || 1

        {
          pagination: {
            current_page: current_page,
            per_page: per_page,
            total_pages: total_pages,
            total_count: total_count
          }
        }
      end
    end
  end
end
