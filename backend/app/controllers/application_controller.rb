class ApplicationController < ActionController::API
  before_action :authorize_request

  private

  def authorize_request
    header = request.headers["Authorization"]
    token = header.split(" ").last if header

    if token
      decoded = JsonWebToken.decode(token)
      @current_user = User.find_by(id: decoded[:user_id]) if decoded
    end

    render json: { success: false, error: "Unauthorized" }, status: :unauthorized unless @current_user
  rescue ActiveRecord::RecordNotFound
    render json: { success: false, error: "Unauthorized" }, status: :unauthorized
  end

  def current_user
    @current_user
  end
end
