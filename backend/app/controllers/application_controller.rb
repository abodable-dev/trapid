class ApplicationController < ActionController::API
  before_action :authorize_request

  private

  def authorize_request
    # Skip auth for now - will implement proper auth later
    @current_user = User.first || User.create!(
      name: "Default User",
      email: "user@example.com",
      password: "password123"
    )
  end

  def current_user
    @current_user
  end
end
