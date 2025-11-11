class ApplicationController < ActionController::API
  before_action :authorize_request

  private

  def authorize_request
    # Skip auth for now - will implement proper auth later
    @current_user = User.first || User.create!(
      name: "Default User",
      email: "user@example.com",
      password: "password123",
      role: "admin"
    )
  end

  def current_user
    @current_user
  end

  def require_admin
    unless current_user&.admin?
      render json: { error: 'Unauthorized. Admin access required.' }, status: :forbidden
    end
  end
end
