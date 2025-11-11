module Api
  module V1
    class AuthenticationController < ApplicationController
      skip_before_action :authorize_request, only: [ :login, :signup ]

      # POST /api/v1/auth/signup
      def signup
        user = User.new(signup_params)

        # Auto-approve Tekna employees
        if user.email&.end_with?('@tekna.com.au')
          user.role ||= 'user'  # Default role for Tekna employees
          Rails.logger.info "Auto-approving Tekna employee: #{user.email}"
        else
          # Non-Tekna emails default to user role as well
          user.role ||= 'user'
        end

        if user.save
          token = JsonWebToken.encode(user_id: user.id)
          render json: {
            success: true,
            token: token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name
            }
          }, status: :created
        else
          render json: {
            success: false,
            errors: user.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/auth/login
      def login
        user = User.find_by(email: login_params[:email])

        if user&.authenticate(login_params[:password])
          token = JsonWebToken.encode(user_id: user.id)
          render json: {
            success: true,
            token: token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name
            }
          }
        else
          render json: {
            success: false,
            error: "Invalid email or password"
          }, status: :unauthorized
        end
      end

      # GET /api/v1/auth/me
      def me
        render json: {
          success: true,
          user: {
            id: @current_user.id,
            email: @current_user.email,
            name: @current_user.name
          }
        }
      end

      private

      def signup_params
        params.require(:user).permit(:email, :password, :password_confirmation, :name)
      end

      def login_params
        params.require(:user).permit(:email, :password)
      end
    end
  end
end
