module Api
  module V1
    class UnrealVariablesController < ApplicationController
      skip_before_action :authorize_request
      before_action :set_unreal_variable, only: [:show, :update, :destroy]

      # GET /api/v1/unreal_variables
      def index
        @variables = UnrealVariable.active

        # Apply search if provided
        @variables = @variables.search(params[:search]) if params[:search].present?

        # Sort by claude_value descending (nulls last)
        @variables = @variables.order(Arel.sql('claude_value DESC NULLS LAST'))

        # Pagination
        page = [params[:page]&.to_i || 1, 1].max
        limit = (params[:limit] || params[:per_page])&.to_i || 100
        limit = [[limit, 1].max, 1000].min

        offset = (page - 1) * limit
        total_count = @variables.count

        # Apply pagination
        @variables = @variables.limit(limit).offset(offset)

        render json: {
          variables: @variables.map { |variable|
            {
              id: variable.id,
              variable_name: variable.variable_name,
              claude_value: variable.claude_value
            }
          },
          pagination: {
            page: page,
            limit: limit,
            total_count: total_count,
            total_pages: (total_count.to_f / limit).ceil
          }
        }
      end

      # GET /api/v1/unreal_variables/:id
      def show
        render json: {
          id: @variable.id,
          variable_name: @variable.variable_name,
          claude_value: @variable.claude_value
        }
      end

      # POST /api/v1/unreal_variables
      def create
        @variable = UnrealVariable.new(unreal_variable_params)

        if @variable.save
          render json: @variable, status: :created
        else
          render json: { errors: @variable.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/unreal_variables/:id
      def update
        if @variable.update(unreal_variable_params)
          render json: @variable
        else
          render json: { errors: @variable.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/unreal_variables/:id
      def destroy
        @variable.update(is_active: false)
        head :no_content
      end

      private

      def set_unreal_variable
        @variable = UnrealVariable.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Unreal variable not found" }, status: :not_found
      end

      def unreal_variable_params
        params.require(:unreal_variable).permit(
          :variable_name,
          :claude_value,
          :is_active
        )
      end
    end
  end
end
