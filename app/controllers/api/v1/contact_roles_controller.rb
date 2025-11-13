class Api::V1::ContactRolesController < ApplicationController
  before_action :set_contact_role, only: [ :update, :destroy ]

  def index
    @contact_roles = ContactRole.ordered
    render json: @contact_roles
  end

  def create
    @contact_role = ContactRole.new(contact_role_params)

    if @contact_role.save
      render json: @contact_role, status: :created
    else
      render json: { errors: @contact_role.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @contact_role.update(contact_role_params)
      render json: @contact_role
    else
      render json: { errors: @contact_role.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @contact_role.destroy
    head :no_content
  end

  private

  def set_contact_role
    @contact_role = ContactRole.find(params[:id])
  end

  def contact_role_params
    params.require(:contact_role).permit(:name, :active, :contact_type)
  end
end
