# frozen_string_literal: true

module Api
  module V1
    class ContactTypesController < ApplicationController
      # GET /api/v1/contact_types
      # Returns all active contact types in order for use in select dropdowns
      def index
        contact_types = ContactType.for_select
        render json: contact_types
      end
    end
  end
end
