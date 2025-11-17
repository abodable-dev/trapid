# frozen_string_literal: true

module Api
  module V1
    class RolesController < ApplicationController
      # GET /api/v1/roles
      # Returns all active roles in order for use in select dropdowns
      def index
        roles = Role.for_select
        render json: roles
      end
    end
  end
end
