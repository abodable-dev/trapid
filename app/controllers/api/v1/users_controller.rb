class Api::V1::UsersController < ApplicationController
  # GET /api/v1/users
  # Returns list of all users for chat/contact purposes
  def index
    @users = User.select(:id, :name, :email, :role).order(:name)
    render json: @users.as_json(only: [:id, :name, :email, :role])
  end

  # GET /api/v1/users/:id
  def show
    @user = User.find(params[:id])
    render json: @user.as_json(only: [:id, :name, :email, :role])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'User not found' }, status: :not_found
  end
end
