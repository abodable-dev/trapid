# frozen_string_literal: true

module Api
  module V1
    class AgentsController < ApplicationController
      def status
        file_path = Rails.root.join('..', '.claude', 'agents', 'run-history.json')

        if File.exist?(file_path)
          file_content = File.read(file_path)
          agent_data = JSON.parse(file_content)
          render json: agent_data
        else
          render json: {
            agents: {
              'backend-developer': default_agent_stats,
              'frontend-developer': default_agent_stats,
              'production-bug-hunter': default_agent_stats,
              'deploy-manager': default_agent_stats,
              'planning-collaborator': default_agent_stats,
              'gantt-bug-hunter': default_agent_stats
            },
            metadata: {
              created: Time.current.iso8601,
              last_updated: Time.current.iso8601,
              version: '1.0'
            }
          }
        end
      end

      private

      def default_agent_stats
        {
          total_runs: 0,
          successful_runs: 0,
          failed_runs: 0,
          last_run: nil,
          last_status: nil,
          last_message: nil,
          runs: []
        }
      end
    end
  end
end
