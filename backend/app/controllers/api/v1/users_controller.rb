class Api::V1::UsersController < ApplicationController
  # GET /api/v1/users
  # Returns list of all users for chat/contact purposes
  def index
    @users = User.select(:id, :name, :email, :role, :assigned_role, :last_login_at).order(:name)
    render json: @users.as_json(only: [:id, :name, :email, :role, :assigned_role, :last_login_at])
  end

  # GET /api/v1/users/:id
  def show
    @user = User.find(params[:id])
    render json: @user.as_json(only: [:id, :name, :email, :role, :assigned_role, :last_login_at])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'User not found' }, status: :not_found
  end

  # PATCH /api/v1/users/:id
  def update
    @user = User.find(params[:id])

    if @user.update(user_params)
      render json: {
        success: true,
        user: @user.as_json(only: [:id, :name, :email, :role, :assigned_role, :last_login_at])
      }
    else
      render json: {
        success: false,
        errors: @user.errors.full_messages
      }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'User not found' }, status: :not_found
  end

  # DELETE /api/v1/users/:id
  def destroy
    @user = User.find(params[:id])

    if @user.destroy
      render json: { success: true, message: 'User removed successfully' }
    else
      render json: { success: false, error: 'Failed to remove user' }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'User not found' }, status: :not_found
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :role, :assigned_role)
  end
end
