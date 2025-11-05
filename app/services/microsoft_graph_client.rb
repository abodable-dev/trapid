class MicrosoftGraphClient
  GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'
  TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'

  class AuthenticationError < StandardError; end
  class APIError < StandardError; end

  def initialize(credential)
    @credential = credential
    ensure_valid_token!
  end

  # OAuth Methods

  # Get authorization URL for user to consent
  def self.authorization_url(redirect_uri, state = nil)
    params = {
      client_id: ENV['ONEDRIVE_CLIENT_ID'],
      response_type: 'code',
      redirect_uri: redirect_uri,
      scope: 'Files.ReadWrite.All offline_access',
      response_mode: 'query'
    }
    params[:state] = state if state.present?

    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?#{params.to_query}"
  end

  # Exchange authorization code for access token
  def self.exchange_code_for_token(code, redirect_uri)
    response = HTTParty.post(TOKEN_URL,
      body: {
        client_id: ENV['ONEDRIVE_CLIENT_ID'],
        client_secret: ENV['ONEDRIVE_CLIENT_SECRET'],
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: { 'Content-Type' => 'application/x-www-form-urlencoded' }
    )

    handle_token_response(response)
  end

  # Refresh access token
  def refresh_token!
    response = HTTParty.post(TOKEN_URL,
      body: {
        client_id: ENV['ONEDRIVE_CLIENT_ID'],
        client_secret: ENV['ONEDRIVE_CLIENT_SECRET'],
        refresh_token: @credential.refresh_token,
        grant_type: 'refresh_token'
      },
      headers: { 'Content-Type' => 'application/x-www-form-urlencoded' }
    )

    token_data = self.class.handle_token_response(response)

    # Update credential with new tokens
    @credential.update!(
      access_token: token_data[:access_token],
      refresh_token: token_data[:refresh_token] || @credential.refresh_token,
      token_expires_at: token_data[:expires_at]
    )

    token_data
  end

  # Drive/Folder Operations

  # Get user's default drive
  def get_default_drive
    get('/me/drive')
  end

  # Create folder structure based on template
  def create_folder_structure(template, job_data = {})
    drive = get_default_drive
    drive_id = drive['id']

    # Create root folder (e.g., "PROJ-001 - Malbon Street")
    root_folder_name = template.name.gsub(/\{(\w+)\}/) do |match|
      variable_name = $1
      job_data[variable_name.to_sym] || job_data[variable_name] || match
    end

    root_folder = create_folder(root_folder_name, drive_id: drive_id)

    # Update credential with folder information
    @credential.update!(
      drive_id: drive_id,
      root_folder_id: root_folder['id'],
      folder_path: root_folder_name,
      metadata: @credential.metadata.merge({
        root_folder_name: root_folder_name,
        root_folder_web_url: root_folder['webUrl'],
        created_at: Time.current
      })
    )

    # Create subfolders based on template
    create_subfolders_from_template(template, root_folder['id'], job_data)

    root_folder
  end

  # Create a single folder
  def create_folder(name, parent_id: nil, drive_id: nil)
    path = if drive_id && !parent_id
      "/drives/#{drive_id}/root/children"
    elsif parent_id
      "/me/drive/items/#{parent_id}/children"
    else
      "/me/drive/root/children"
    end

    post(path, {
      name: name,
      folder: {},
      "@microsoft.graph.conflictBehavior": "rename"
    })
  end

  # List items in a folder
  def list_folder_items(folder_id = nil)
    path = if folder_id
      "/me/drive/items/#{folder_id}/children"
    else
      @credential.root_folder_id ?
        "/me/drive/items/#{@credential.root_folder_id}/children" :
        "/me/drive/root/children"
    end

    get(path)
  end

  # Get folder by path
  def get_folder_by_path(path)
    encoded_path = path.split('/').map { |segment| CGI.escape(segment) }.join('/')
    get("/me/drive/root:/#{encoded_path}")
  rescue APIError => e
    return nil if e.message.include?('itemNotFound')
    raise
  end

  # File Operations

  # Upload small file (< 4MB)
  def upload_file(file, parent_folder_id, filename = nil)
    filename ||= File.basename(file.path)

    post(
      "/me/drive/items/#{parent_folder_id}:/#{filename}:/content",
      File.read(file),
      { 'Content-Type' => 'application/octet-stream' }
    )
  end

  # Create upload session for large files (>= 4MB)
  def create_upload_session(parent_folder_id, filename, file_size)
    post(
      "/me/drive/items/#{parent_folder_id}:/#{filename}:/createUploadSession",
      {
        item: {
          "@microsoft.graph.conflictBehavior": "rename",
          name: filename
        }
      }
    )
  end

  # Download file
  def download_file(file_id)
    response = HTTParty.get(
      "#{GRAPH_API_BASE}/me/drive/items/#{file_id}/content",
      headers: auth_headers,
      follow_redirects: true
    )

    raise APIError, "Download failed: #{response.code}" unless response.success?
    response.body
  end

  # Get file metadata
  def get_file(file_id)
    get("/me/drive/items/#{file_id}")
  end

  # Delete file or folder
  def delete_item(item_id)
    delete("/me/drive/items/#{item_id}")
  end

  # Search for files
  def search(query, folder_id = nil)
    path = if folder_id
      "/me/drive/items/#{folder_id}/search(q='#{CGI.escape(query)}')"
    else
      "/me/drive/root/search(q='#{CGI.escape(query)}')"
    end

    get(path)
  end

  private

  def ensure_valid_token!
    return unless @credential.token_expired?

    Rails.logger.info "Token expired, refreshing..."
    refresh_token!
  end

  def create_subfolders_from_template(template, parent_folder_id, job_data)
    # Get root level items (items with no parent)
    root_items = template.folder_template_items.where(parent_id: nil).order(:order)

    # Track created folder IDs for children
    folder_id_map = {}

    # Process all items in order of level (breadth-first)
    template.folder_template_items.order(:level, :order).each do |item|
      # Determine parent folder ID
      parent_id = if item.parent_id
        folder_id_map[item.parent_id]
      else
        parent_folder_id
      end

      # Skip if parent hasn't been created yet (shouldn't happen with level ordering)
      next unless parent_id

      # Resolve variables in folder name
      folder_name = item.resolve_variables(job_data)

      # Create folder
      created_folder = create_folder(folder_name, parent_id: parent_id)

      # Store mapping for children
      folder_id_map[item.id] = created_folder['id']

      Rails.logger.info "Created folder: #{folder_name} (#{created_folder['id']})"
    end

    folder_id_map
  end

  def self.handle_token_response(response)
    unless response.success?
      error_message = response.parsed_response&.dig('error_description') ||
                     response.parsed_response&.dig('error') ||
                     "Token request failed with status #{response.code}"
      raise AuthenticationError, error_message
    end

    data = response.parsed_response
    {
      access_token: data['access_token'],
      refresh_token: data['refresh_token'],
      expires_in: data['expires_in'],
      expires_at: Time.current + data['expires_in'].to_i.seconds
    }
  end

  # HTTP Methods

  def get(path)
    response = HTTParty.get(
      "#{GRAPH_API_BASE}#{path}",
      headers: auth_headers
    )

    handle_response(response)
  end

  def post(path, body, custom_headers = {})
    headers = auth_headers.merge(custom_headers)

    # Set content type if body is a hash (JSON)
    if body.is_a?(Hash)
      headers['Content-Type'] = 'application/json'
      body = body.to_json
    end

    response = HTTParty.post(
      "#{GRAPH_API_BASE}#{path}",
      body: body,
      headers: headers
    )

    handle_response(response)
  end

  def patch(path, body)
    response = HTTParty.patch(
      "#{GRAPH_API_BASE}#{path}",
      body: body.to_json,
      headers: auth_headers.merge({ 'Content-Type' => 'application/json' })
    )

    handle_response(response)
  end

  def delete(path)
    response = HTTParty.delete(
      "#{GRAPH_API_BASE}#{path}",
      headers: auth_headers
    )

    # Delete returns 204 No Content on success
    return true if response.code == 204

    handle_response(response)
  end

  def handle_response(response)
    case response.code
    when 200, 201
      response.parsed_response
    when 204
      true
    when 401
      # Token might be expired, try refreshing once
      if @token_refresh_attempted
        raise AuthenticationError, "Authentication failed after token refresh"
      end

      @token_refresh_attempted = true
      refresh_token!
      raise AuthenticationError, "Token expired, please retry request"
    when 404
      raise APIError, "Resource not found (404)"
    when 429
      retry_after = response.headers['Retry-After']&.to_i || 60
      raise APIError, "Rate limited. Retry after #{retry_after} seconds"
    else
      error_message = response.parsed_response&.dig('error', 'message') ||
                     response.parsed_response&.dig('error_description') ||
                     "API request failed with status #{response.code}"
      raise APIError, error_message
    end
  end

  def auth_headers
    {
      'Authorization' => "Bearer #{@credential.access_token}",
      'Accept' => 'application/json'
    }
  end
end
