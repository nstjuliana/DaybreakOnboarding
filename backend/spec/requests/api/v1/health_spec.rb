# frozen_string_literal: true

##
# Health Controller Specs
#
# Tests for the health check endpoint.
# Verifies the endpoint returns correct status information.
#

require 'rails_helper'

RSpec.describe 'Api::V1::Health' do
  describe 'GET /api/v1/health' do
    it 'returns success status' do
      get '/api/v1/health', headers: json_headers

      expect(response).to have_http_status(:ok)
    end

    it 'returns JSON content type' do
      get '/api/v1/health', headers: json_headers

      expect(response.content_type).to include('application/json')
    end

    it 'returns status ok' do
      get '/api/v1/health', headers: json_headers

      expect(json_response[:status]).to eq('ok')
    end

    it 'returns timestamp in ISO8601 format' do
      get '/api/v1/health', headers: json_headers

      expect(json_response[:timestamp]).to match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    end

    it 'returns version information' do
      get '/api/v1/health', headers: json_headers

      expect(json_response[:version]).to be_present
    end

    it 'returns environment information' do
      get '/api/v1/health', headers: json_headers

      expect(json_response[:environment]).to eq('test')
    end

    it 'returns services status' do
      get '/api/v1/health', headers: json_headers

      expect(json_response[:services]).to include(:database, :cache)
    end

    context 'when database is healthy' do
      it 'reports database status as ok' do
        get '/api/v1/health', headers: json_headers

        expect(json_response[:services][:database]).to eq('ok')
      end
    end

    context 'when database is down' do
      before do
        allow(ActiveRecord::Base.connection).to receive(:execute).and_raise(StandardError, 'Connection failed')
      end

      it 'reports database status as error' do
        get '/api/v1/health', headers: json_headers

        expect(json_response[:services][:database]).to eq('error')
      end

      it 'returns service unavailable status' do
        get '/api/v1/health', headers: json_headers

        expect(response).to have_http_status(:service_unavailable)
      end
    end
  end
end

