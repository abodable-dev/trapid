class GrokService
  BASE_URL = "https://api.x.ai/v1"

  def initialize
    @api_key = ENV["XAI_API_KEY"]
    raise "XAI_API_KEY environment variable not set" unless @api_key
  end

  # Send a message to Grok with context
  def chat(message, context = {})
    # Build the full prompt with context
    system_message = build_system_message(context)

    response = send_request("/chat/completions", {
      model: "grok-beta",
      messages: [
        { role: "system", content: system_message },
        { role: "user", content: message }
      ],
      stream: false,
      temperature: 0.7
    })

    parse_response(response)
  end

  # Stream responses for real-time chat
  def chat_stream(message, context = {}, &block)
    system_message = build_system_message(context)

    # TODO: Implement streaming
    # For now, use regular chat
    chat(message, context)
  end

  private

  def build_system_message(context)
    prompt = "You are Grok, an AI assistant helping a development team build Trapid, a database management application."

    if context[:current_page]
      prompt += "\n\nThe user is currently on: #{context[:current_page]}"
    end

    if context[:current_table]
      prompt += "\n\nThey are working on table: #{context[:current_table][:name]}"
      prompt += " with #{context[:current_table][:columns]&.count || 0} columns"
    end

    if context[:recent_actions]
      prompt += "\n\nRecent actions: #{context[:recent_actions].join(', ')}"
    end

    if context[:team_context]
      prompt += "\n\nTeam context: #{context[:team_context]}"
    end

    prompt += "\n\nHelp the team plan features, debug issues, and build efficiently. Be concise and actionable."

    prompt
  end

  def send_request(endpoint, payload)
    uri = URI("#{BASE_URL}#{endpoint}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(uri.path)
    request["Authorization"] = "Bearer #{@api_key}"
    request["Content-Type"] = "application/json"
    request.body = payload.to_json

    response = http.request(request)

    unless response.is_a?(Net::HTTPSuccess)
      raise "Grok API error: #{response.code} - #{response.body}"
    end

    JSON.parse(response.body)
  end

  def parse_response(response)
    {
      message: response.dig("choices", 0, "message", "content"),
      model: response["model"],
      usage: response["usage"]
    }
  end
end
