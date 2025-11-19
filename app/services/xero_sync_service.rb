class XeroSyncService
  XERO_API_URL = 'https://api.xero.com/api.xro/2.0'

  def initialize(connection)
    @connection = connection
    ensure_token_valid!
  end

  def sync_accounts
    # Refresh token if needed
    ensure_token_valid!

    # Fetch chart of accounts from Xero
    accounts = fetch_accounts

    # Clear existing synced accounts
    @connection.xero_accounts.destroy_all

    # Create new account records
    accounts_created = 0

    accounts.each do |account|
      @connection.xero_accounts.create!(
        xero_account_id: account['AccountID'],
        account_code: account['Code'],
        account_name: account['Name'],
        account_type: account['Type'],
        tax_type: account['TaxType'],
        description: account['Description'],
        is_active: account['Status'] == 'ACTIVE'
      )
      accounts_created += 1
    end

    # Update last sync timestamp
    @connection.update!(last_sync_at: Time.current)

    {
      accounts_synced: accounts_created,
      synced_at: @connection.last_sync_at
    }
  rescue StandardError => e
    Rails.logger.error "Xero sync failed: #{e.message}"
    raise e
  end

  private

  def ensure_token_valid!
    if @connection.needs_token_refresh?
      XeroAuthService.new.refresh_token(@connection)
      @connection.reload
    end
  end

  def fetch_accounts
    url = "#{XERO_API_URL}/Accounts"

    response = HTTP.auth("Bearer #{@connection.access_token}")
                   .headers('Xero-Tenant-Id' => @connection.tenant_id, 'Accept' => 'application/json')
                   .get(url)

    raise "Failed to fetch accounts: #{response.status} - #{response.body}" unless response.status.success?

    data = JSON.parse(response.body)
    data['Accounts'] || []
  end
end
