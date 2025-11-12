class Api::V1::UserGroupsController < ApplicationController
  # GET /api/v1/user_groups
  def index
    groups = User::ASSIGNABLE_ROLES.map do |group|
      {
        value: group,
        label: group.titleize
      }
    end
    render json: { groups: groups }
  end

  # POST /api/v1/user_groups
  def create
    group_name = params[:name]&.downcase&.strip

    if group_name.blank?
      render json: { error: 'Group name is required' }, status: :unprocessable_entity
      return
    end

    if User::ASSIGNABLE_ROLES.include?(group_name)
      render json: { error: 'Group already exists' }, status: :unprocessable_entity
      return
    end

    # Add group to the ASSIGNABLE_ROLES constant (this requires modifying the User model file)
    # For now, we'll store it in a database table
    # TODO: Implement dynamic group storage

    render json: { error: 'Dynamic group creation not yet implemented. Please add groups directly to the User model.' }, status: :not_implemented
  end

  # DELETE /api/v1/user_groups/:id
  def destroy
    group_name = params[:id]

    # Prevent deletion of core groups
    core_groups = %w[admin]
    if core_groups.include?(group_name)
      render json: { error: 'Cannot delete core system groups' }, status: :forbidden
      return
    end

    # TODO: Implement dynamic group deletion
    render json: { error: 'Dynamic group deletion not yet implemented. Please remove groups directly from the User model.' }, status: :not_implemented
  end
end
