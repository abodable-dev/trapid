require 'oauth2'
require 'httparty'

class XeroApiClient
  include HTTParty

  BASE_URL = 'https://api.xero.com/api.xro/2.0'
  AUTH_URL = 'https://login.xero.com/identity/connect/authorize'
  TOKEN_URL = 'https://identity.xero.com/connect/token'
  CONNECTIONS_URL = 'https://api.xero.com/connections'

  # Custom error classes
  class ApiError < StandardError; end
  class AuthenticationError < StandardError; end
  class RateLimitError < StandardError; end

  def initialize
    @client_id = ENV['XERO_CLIENT_ID']
    @client_secret = ENV['XERO_CLIENT_SECRET']
    @redirect_uri = ENV['XERO_REDIRECT_URI']

    raise AuthenticationError, 'Missing Xero credentials in environment' unless credentials_present?
  end

  # Generate OAuth authorization URL
  def authorization_url
    client = oauth_client
    client.auth_code.authorize_url(
      redirect_uri: @redirect_uri,
      scope: 'offline_access accounting.transactions accounting.contacts accounting.settings'
    )
  end

  # Exchange authorization code for access token
  def exchange_code_for_token(code)
    begin
      client = oauth_client
      token = client.auth_code.get_token(code, redirect_uri: @redirect_uri)

      # Get tenant information
      tenant_info = get_tenant_info(token.token)

      if tenant_info.empty?
        raise ApiError, 'No Xero organization connected'
      end

      # Use the first organization
      tenant = tenant_info.first

      # Store credentials in database
      credential = XeroCredential.create!(
        access_token: token.token,
        refresh_token: token.refresh_token,
        expires_at: Time.current + token.expires_in.seconds,
        tenant_id: tenant['tenantId'],
        tenant_name: tenant['tenantName'],
        tenant_type: tenant['tenantType']
      )

      Rails.logger.info("Xero OAuth successful: #{tenant['tenantName']} (#{tenant['tenantId']})")

      {
        success: true,
        tenant_name: tenant['tenantName'],
        tenant_id: tenant['tenantId'],
        expires_at: credential.expires_at
      }
    rescue OAuth2::Error => e
      Rails.logger.error("Xero OAuth error: #{e.message}")
      raise AuthenticationError, "Failed to exchange code: #{e.message}"
    rescue StandardError => e
      Rails.logger.error("Xero token exchange error: #{e.message}")
      raise ApiError, "Token exchange failed: #{e.message}"
    end
  end

  # Refresh the access token
  def refresh_access_token
    credential = XeroCredential.current
    return { success: false, error: 'No credentials found' } unless credential

    begin
      client = oauth_client
      old_token = OAuth2::AccessToken.new(
        client,
        credential.access_token,
        refresh_token: credential.refresh_token
      )

      new_token = old_token.refresh!

      # Update stored credential
      credential.update!(
        access_token: new_token.token,
        refresh_token: new_token.refresh_token,
        expires_at: Time.current + new_token.expires_in.seconds
      )

      Rails.logger.info("Xero token refreshed successfully")

      {
        success: true,
        expires_at: credential.expires_at
      }
    rescue OAuth2::Error => e
      Rails.logger.error("Xero token refresh error: #{e.message}")
      raise AuthenticationError, "Failed to refresh token: #{e.message}"
    end
  end

  # Make authenticated GET request to Xero API
  def get(endpoint, params = {})
    make_request(:get, endpoint, params)
  end

  # Make authenticated POST request to Xero API
  def post(endpoint, data = {})
    make_request(:post, endpoint, data)
  end

  # Make authenticated PUT request to Xero API
  def put(endpoint, data = {})
    make_request(:put, endpoint, data)
  end

  # Check connection status
  def connection_status
    credential = XeroCredential.current

    if credential.nil?
      return {
        connected: false,
        message: 'Not connected to Xero'
      }
    end

    {
      connected: true,
      tenant_name: credential.tenant_name,
      tenant_id: credential.tenant_id,
      expires_at: credential.expires_at,
      expired: credential.expired?
    }
  end

  # Disconnect from Xero (revoke tokens)
  def disconnect
    credential = XeroCredential.current
    return { success: false, error: 'Not connected' } unless credential

    begin
      # Xero doesn't have a revoke endpoint, so we just delete our stored credentials
      credential.destroy

      Rails.logger.info("Xero disconnected successfully")

      { success: true, message: 'Disconnected from Xero' }
    rescue StandardError => e
      Rails.logger.error("Xero disconnect error: #{e.message}")
      { success: false, error: e.message }
    end
  end

  private

  def credentials_present?
    @client_id.present? && @client_secret.present? && @redirect_uri.present?
  end

  def oauth_client
    OAuth2::Client.new(
      @client_id,
      @client_secret,
      site: 'https://login.xero.com',
      authorize_url: AUTH_URL,
      token_url: TOKEN_URL
    )
  end

  def get_tenant_info(access_token)
    response = HTTParty.get(
      CONNECTIONS_URL,
      headers: {
        'Authorization' => "Bearer #{access_token}",
        'Content-Type' => 'application/json'
      }
    )

    if response.success?
      JSON.parse(response.body)
    else
      raise ApiError, "Failed to get tenant info: #{response.code}"
    end
  end

  def make_request(method, endpoint, data = {})
    credential = XeroCredential.current

    unless credential
      raise AuthenticationError, 'Not authenticated with Xero'
    end

    # Refresh token if expired
    refresh_access_token if credential.expired?

    # Reload credential to get updated token
    credential.reload

    url = "#{BASE_URL}/#{endpoint}"

    begin
      headers = {
        'Authorization' => "Bearer #{credential.access_token}",
        'Xero-tenant-id' => credential.tenant_id,
        'Content-Type' => 'application/json',
        'Accept' => 'application/json'
      }

      response = case method
      when :get
        HTTParty.get(url, headers: headers, query: data, timeout: 30)
      when :post
        HTTParty.post(url, headers: headers, body: data.to_json, timeout: 30)
      when :put
        HTTParty.put(url, headers: headers, body: data.to_json, timeout: 30)
      else
        raise ArgumentError, "Unsupported HTTP method: #{method}"
      end

      handle_response(response)
    rescue Net::ReadTimeout => e
      Rails.logger.error("Xero API timeout: #{e.message}")
      raise ApiError, 'Request timeout'
    rescue StandardError => e
      Rails.logger.error("Xero API error: #{e.message}")
      raise ApiError, e.message
    end
  end

  def handle_response(response)
    case response.code
    when 200..299
      # Success
      Rails.logger.info("Xero API request successful: #{response.code}")
      {
        success: true,
        data: JSON.parse(response.body)
      }
    when 401
      # Unauthorized - token may be invalid
      Rails.logger.error("Xero API unauthorized: #{response.body}")
      raise AuthenticationError, 'Authentication failed'
    when 429
      # Rate limit exceeded
      retry_after = response.headers['Retry-After'] || 60
      Rails.logger.warn("Xero API rate limit hit. Retry after: #{retry_after}s")
      raise RateLimitError, "Rate limit exceeded. Retry after #{retry_after} seconds"
    when 400..499
      # Client error
      error_body = JSON.parse(response.body) rescue {}
      error_message = error_body['Message'] || error_body['message'] || 'Client error'
      Rails.logger.error("Xero API client error: #{response.code} - #{error_message}")
      raise ApiError, error_message
    when 500..599
      # Server error
      Rails.logger.error("Xero API server error: #{response.code}")
      raise ApiError, 'Xero server error'
    else
      Rails.logger.error("Xero API unexpected response: #{response.code}")
      raise ApiError, "Unexpected response code: #{response.code}"
    end
  end
end
