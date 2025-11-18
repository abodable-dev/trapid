module Api
  module V1
    class PermissionsController < ApplicationController
      before_action :require_admin, except: [:index]

      # GET /api/v1/permissions
      def index
        permissions = Permission.enabled.order(:category, :name)

        permissions_by_category = permissions.group_by(&:category).transform_values do |perms|
          perms.map { |p| { id: p.id, name: p.name, description: p.description } }
        end

        render json: {
          success: true,
          permissions: permissions_by_category,
          categories: Permission::CATEGORIES
        }
      end

      # GET /api/v1/permissions/user/:user_id
      def user_permissions
        user = User.find(params[:user_id])

        render json: {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          permissions: user.all_permissions,
          role_permissions: RolePermission.joins(:permission)
                                          .where(role: user.role)
                                          .pluck('permissions.name')
        }
      end

      # POST /api/v1/permissions/grant
      # Grant or revoke a specific permission for a user
      def grant
        user = User.find(params[:user_id])
        permission = Permission.find_by(name: params[:permission_name])

        unless permission
          render json: { success: false, error: 'Permission not found' }, status: :not_found
          return
        end

        user_perm = user.user_permissions.find_or_initialize_by(permission: permission)
        user_perm.granted = params[:granted]

        if user_perm.save
          render json: {
            success: true,
            message: "Permission #{params[:granted] ? 'granted' : 'revoked'}",
            permissions: user.all_permissions
          }
        else
          render json: {
            success: false,
            errors: user_perm.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/permissions/roles
      def roles
        roles_data = User::ROLES.map do |role|
          permissions = RolePermission.joins(:permission)
                                     .where(role: role)
                                     .pluck('permissions.name')

          {
            role: role,
            label: role.titleize,
            permissions: permissions,
            user_count: User.where(role: role).count
          }
        end

        render json: {
          success: true,
          roles: roles_data
        }
      end

      private

      def require_admin
        unless @current_user&.can?(:manage_permissions)
          render json: {
            success: false,
            error: 'You do not have permission to manage permissions'
          }, status: :forbidden
        end
      end
    end
  end
end
