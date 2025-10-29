class Api::V1::GrokController < ApplicationController
  # POST /api/v1/grok/chat
  def chat
    message = params[:message]
    context = params[:context] || {}

    if message.blank?
      return render json: { success: false, error: "Message is required" }, status: :bad_request
    end

    begin
      grok = GrokService.new
      response = grok.chat(message, context.to_h.symbolize_keys)

      render json: {
        success: true,
        response: response[:message],
        model: response[:model],
        usage: response[:usage]
      }
    rescue StandardError => e
      Rails.logger.error "Grok API error: #{e.message}"
      render json: {
        success: false,
        error: "Failed to get response from Grok: #{e.message}"
      }, status: :internal_server_error
    end
  end

  # GET /api/v1/grok/suggest-features
  def suggest_features
    table_id = params[:table_id]

    context = {
      current_page: "Feature Planning",
      team_context: "Team is planning next features for the application"
    }

    if table_id
      table = Table.find_by(id: table_id)
      context[:current_table] = {
        name: table&.name,
        columns: table&.columns&.count
      }
    end

    message = "Based on the current application structure, suggest 5 practical features we should build next. Be specific and consider database design, user experience, and development complexity."

    begin
      grok = GrokService.new
      response = grok.chat(message, context)

      render json: {
        success: true,
        suggestions: response[:message]
      }
    rescue StandardError => e
      Rails.logger.error "Grok API error: #{e.message}"
      render json: {
        success: false,
        error: "Failed to get feature suggestions: #{e.message}"
      }, status: :internal_server_error
    end
  end
end
