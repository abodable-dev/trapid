module Api
  module V1
    class UnrealVariablesController < ApplicationController
      def index
        page = params[:page]&.to_i || 1
        limit = params[:limit]&.to_i || 100
        limit = [limit, 1000].min # Cap at 1000

        variables = UnrealVariable.all

        # Apply search filter
        if params[:search].present?
          variables = variables.search(params[:search])
        end

        # Order by variable name
        variables = variables.order(:variable_name)

        # Paginate
        offset = (page - 1) * limit
        total_count = variables.count
        paginated_variables = variables.limit(limit).offset(offset)

        render json: {
          variables: paginated_variables.map { |v|
            {
              id: v.id,
              variable_name: v.variable_name,
              claude_value: v.claude_value
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
    end
  end
end
