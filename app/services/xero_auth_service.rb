class XeroAuthService
  XERO_CLIENT_ID = ENV['XERO_CLIENT_ID']
  XERO_CLIENT_SECRET = ENV['XERO_CLIENT_SECRET']
  XERO_REDIRECT_URI = ENV['XERO_REDIRECT_URI'] || 'http://localhost:5173/corporate/xero/callback'
  XERO_AUTH_URL = 'https://login.xero.com/identity/connect/authorize'
  XERO_TOKEN_URL = 'https://identity.xero.com/connect/token'
  XERO_CONNECTIONS_URL = 'https://api.xero.com/connections'

  def initialize
    raise "Xero credentials not configured" unless XERO_CLIENT_ID && XERO_CLIENT_SECRET
  end

  def authorization_url(company_id)
    state = encode_state(company_id)

    params = {
      response_type: 'code',
      client_id: XERO_CLIENT_ID,
      redirect_uri: XERO_REDIRECT_URI,
      scope: 'openid profile email accounting.settings accounting.transactions accounting.contacts accounting.journals.read accounting.reports.read accounting.attachments',
      state: state
    }

    "#{XERO_AUTH_URL}?#{URI.encode_www_form(params)}"
  end

  def handle_callback(code, company_id)
    # Exchange authorization code for tokens
    tokens = exchange_code_for_tokens(code)

    # Get tenant information
    tenants = get_tenants(tokens[:access_token])
    tenant = tenants.first # Use first tenant for now

    raise "No Xero organization found" unless tenant

    # Create or update connection
    connection = CompanyXeroConnection.find_or_initialize_by(company_id: company_id)
    connection.update!(
      tenant_id: tenant['tenantId'],
      tenant_name: tenant['tenantName'],
      access_token: tokens[:access_token],
      refresh_token: tokens[:refresh_token],
      token_expires_at: Time.current + tokens[:expires_in].seconds
    )

    connection
  end

  def refresh_token(connection)
    body = {
      grant_type: 'refresh_token',
      refresh_token: connection.refresh_token
    }

    response = HTTP.basic_auth(user: XERO_CLIENT_ID, pass: XERO_CLIENT_SECRET)
                   .post(XERO_TOKEN_URL, form: body)

    raise "Token refresh failed: #{response.status}" unless response.status.success?

    data = JSON.parse(response.body)

    connection.update!(
      access_token: data['access_token'],
      refresh_token: data['refresh_token'],
      token_expires_at: Time.current + data['expires_in'].seconds
    )

    connection
  end

  private

  def exchange_code_for_tokens(code)
    body = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: XERO_REDIRECT_URI
    }

    response = HTTP.basic_auth(user: XERO_CLIENT_ID, pass: XERO_CLIENT_SECRET)
                   .post(XERO_TOKEN_URL, form: body)

    raise "Token exchange failed: #{response.status}" unless response.status.success?

    data = JSON.parse(response.body)

    {
      access_token: data['access_token'],
      refresh_token: data['refresh_token'],
      expires_in: data['expires_in']
    }
  end

  def get_tenants(access_token)
    response = HTTP.auth("Bearer #{access_token}").get(XERO_CONNECTIONS_URL)

    raise "Failed to get tenants: #{response.status}" unless response.status.success?

    JSON.parse(response.body)
  end

  def encode_state(company_id)
    Base64.urlsafe_encode64({ company_id: company_id, timestamp: Time.current.to_i }.to_json)
  end

  def decode_state(state)
    JSON.parse(Base64.urlsafe_decode64(state))
  end
end
