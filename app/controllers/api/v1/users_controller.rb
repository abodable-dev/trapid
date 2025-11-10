module Api
  module V1
    class UsersController < ApplicationController
      # GET /api/v1/users
      def index
        users = User.all.order(:name)

        render json: {
          success: true,
          users: users.map { |u| user_json(u) }
        }
      end

      private

      def user_json(user)
        {
          id: user.id,
          name: user.name,
          email: user.email
        }
      end
    end
  end
end
