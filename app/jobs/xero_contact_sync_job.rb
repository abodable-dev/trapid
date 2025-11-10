class XeroContactSyncJob < ApplicationJob
  queue_as :default

  BATCH_SIZE = 10
  RATE_LIMIT_DELAY = 1 # seconds between API calls to stay under 60/min
  MAX_RETRIES = 3
  SIMILARITY_THRESHOLD = 0.85

  def perform
    Rails.logger.info("XeroContactSyncJob started at #{Time.current}")

    # Initialize tracking
    @stats = {
      matched: 0,
      created_in_trapid: 0,
      created_in_xero: 0,
      updated: 0,
      errors: [],
      skipped: 0,
      total_processed: 0
    }
    @sync_timestamp = Time.current
    @xero_client = XeroApiClient.new

    begin
      # Fetch all contacts from both systems
      xero_contacts = fetch_xero_contacts
      trapid_contacts = Contact.all.to_a

      total_contacts = xero_contacts.length + trapid_contacts.select(&:sync_with_xero).length
      Rails.logger.info("Processing #{xero_contacts.length} Xero contacts and #{trapid_contacts.length} Trapid contacts")

      # Update job metadata
      update_job_metadata(status: "processing", total: total_contacts, processed: 0)

      # Process contacts in batches
      process_contacts_in_batches(xero_contacts, trapid_contacts)

      # Mark job as completed
      update_job_metadata(
        status: "completed",
        completed_at: Time.current,
        stats: @stats
      )

      Rails.logger.info("XeroContactSyncJob completed: #{@stats.inspect}")
    rescue XeroApiClient::AuthenticationError => e
      handle_job_error("Authentication error", e)
    rescue XeroApiClient::RateLimitError => e
      handle_job_error("Rate limit exceeded", e)
    rescue StandardError => e
      handle_job_error("Sync failed", e)
    end
  end

  private

  def fetch_xero_contacts
    result = @xero_client.get("Contacts")

    if result[:success]
      contacts = result[:data]["Contacts"] || []
      Rails.logger.info("Successfully fetched #{contacts.length} contacts from Xero")
      contacts
    else
      raise XeroApiClient::ApiError, "Failed to fetch Xero contacts"
    end
  end

  def process_contacts_in_batches(xero_contacts, trapid_contacts)
    # Track which contacts have been matched
    matched_trapid_ids = Set.new
    matched_xero_ids = Set.new

    # Build lookup maps for efficient matching
    trapid_by_xero_id = trapid_contacts.select { |c| c.xero_id.present? }
                                       .index_by(&:xero_id)
    trapid_by_tax_number = trapid_contacts.select { |c| c.tax_number.present? }
                                          .group_by(&:tax_number)
    trapid_by_email = trapid_contacts.select { |c| c.email.present? }
                                     .index_by { |c| c.email.downcase.strip }

    # Process Xero contacts in batches
    xero_contacts.each_slice(BATCH_SIZE).with_index do |batch, batch_index|
      Rails.logger.info("Processing Xero batch #{batch_index + 1}/#{(xero_contacts.length.to_f / BATCH_SIZE).ceil}")

      batch.each do |xero_contact|
        process_xero_contact(
          xero_contact,
          trapid_contacts,
          trapid_by_xero_id,
          trapid_by_tax_number,
          trapid_by_email,
          matched_trapid_ids,
          matched_xero_ids
        )

        @stats[:total_processed] += 1
        update_progress
      end

      # Sleep between batches to respect rate limits
      sleep(RATE_LIMIT_DELAY) unless batch_index == (xero_contacts.length.to_f / BATCH_SIZE).ceil - 1
    end

    # Process unmatched Trapid contacts that should sync to Xero
    unmatched_trapid = trapid_contacts.reject { |c| matched_trapid_ids.include?(c.id) }
    contacts_to_sync = unmatched_trapid.select { |c| c.sync_with_xero }

    contacts_to_sync.each_slice(BATCH_SIZE).with_index do |batch, batch_index|
      Rails.logger.info("Processing Trapid batch #{batch_index + 1}/#{(contacts_to_sync.length.to_f / BATCH_SIZE).ceil}")

      batch.each do |trapid_contact|
        create_xero_contact_from_trapid(trapid_contact)
        @stats[:total_processed] += 1
        update_progress
      end

      # Sleep between batches to respect rate limits
      sleep(RATE_LIMIT_DELAY) unless batch_index == (contacts_to_sync.length.to_f / BATCH_SIZE).ceil - 1
    end

    # Count skipped contacts
    @stats[:skipped] = unmatched_trapid.reject { |c| c.sync_with_xero }.count
  end

  def process_xero_contact(xero_contact, trapid_contacts, by_xero_id, by_tax_number, by_email, matched_trapid_ids, matched_xero_ids)
    retry_count = 0

    begin
      trapid_contact = find_matching_trapid_contact(
        xero_contact,
        by_xero_id,
        by_tax_number,
        by_email,
        trapid_contacts - matched_trapid_ids.map { |id| trapid_contacts.find { |c| c.id == id } }.compact
      )

      if trapid_contact
        # Match found - update both systems
        matched_trapid_ids.add(trapid_contact.id)
        matched_xero_ids.add(xero_contact["ContactID"])
        update_trapid_from_xero(trapid_contact, xero_contact)
        @stats[:matched] += 1
      else
        # No match - create in Trapid
        create_trapid_contact_from_xero(xero_contact)
        matched_xero_ids.add(xero_contact["ContactID"])
        @stats[:created_in_trapid] += 1
      end

      # Small delay between each API call
      sleep(RATE_LIMIT_DELAY)
    rescue XeroApiClient::RateLimitError => e
      # Handle rate limiting with exponential backoff
      if retry_count < MAX_RETRIES
        retry_count += 1
        retry_after = parse_retry_after(e.message)
        Rails.logger.warn("Rate limited. Retry #{retry_count}/#{MAX_RETRIES}. Sleeping for #{retry_after}s")
        sleep(retry_after)
        retry
      else
        error_msg = "Max retries exceeded for Xero contact #{xero_contact['Name']}: #{e.message}"
        Rails.logger.error(error_msg)
        @stats[:errors] << error_msg
      end
    rescue StandardError => e
      error_msg = "Error processing Xero contact #{xero_contact['Name']}: #{e.message}"
      Rails.logger.error(error_msg)
      @stats[:errors] << error_msg
    end
  end

  def create_xero_contact_from_trapid(trapid_contact)
    retry_count = 0

    begin
      # Build Xero contact payload
      xero_payload = {
        Contacts: [
          build_xero_contact_payload(trapid_contact)
        ]
      }

      result = @xero_client.post("Contacts", xero_payload)

      if result[:success]
        created_contact = result[:data]["Contacts"]&.first
        if created_contact
          trapid_contact.update!(
            xero_id: created_contact["ContactID"],
            last_synced_at: @sync_timestamp,
            xero_sync_error: nil
          )
          @stats[:created_in_xero] += 1
          Rails.logger.info("Created Xero contact: #{created_contact['ContactID']}")
        end
      else
        raise XeroApiClient::ApiError, "Failed to create contact in Xero"
      end

      # Small delay between each API call
      sleep(RATE_LIMIT_DELAY)
    rescue XeroApiClient::RateLimitError => e
      # Handle rate limiting with exponential backoff
      if retry_count < MAX_RETRIES
        retry_count += 1
        retry_after = parse_retry_after(e.message)
        Rails.logger.warn("Rate limited. Retry #{retry_count}/#{MAX_RETRIES}. Sleeping for #{retry_after}s")
        sleep(retry_after)
        retry
      else
        error_msg = "Max retries exceeded creating Xero contact for #{trapid_contact.display_name}: #{e.message}"
        Rails.logger.error(error_msg)
        trapid_contact.update(xero_sync_error: error_msg)
        @stats[:errors] << error_msg
      end
    rescue StandardError => e
      error_msg = "Error creating Xero contact for #{trapid_contact.display_name}: #{e.message}"
      Rails.logger.error(error_msg)
      trapid_contact.update(xero_sync_error: error_msg)
      @stats[:errors] << error_msg
    end
  end

  def parse_retry_after(message)
    # Extract retry-after value from error message
    # Message format: "Rate limit exceeded. Retry after 35 seconds"
    match = message.match(/Retry after (\d+) seconds/)
    match ? match[1].to_i : 60
  end

  def update_job_metadata(metadata)
    # Store job metadata in Rails cache for progress tracking
    # Note: Temporarily disabled due to solid_cache setup issues
    # Rails.cache.write("xero_sync_job_#{job_id}", metadata.merge(job_id: job_id), expires_in: 24.hours)
    Rails.logger.info("Job metadata update: #{metadata.inspect}")
  end

  def update_progress
    # Update progress every 10 contacts
    if @stats[:total_processed] % 10 == 0
      update_job_metadata(
        status: "processing",
        processed: @stats[:total_processed],
        stats: @stats
      )
    end
  end

  def handle_job_error(error_type, exception)
    error_msg = "#{error_type}: #{exception.message}"
    Rails.logger.error("XeroContactSyncJob failed: #{error_msg}")
    Rails.logger.error(exception.backtrace.join("\n"))
    @stats[:errors] << error_msg

    update_job_metadata(
      status: "failed",
      error: error_msg,
      stats: @stats,
      failed_at: Time.current
    )
  end

  # Contact matching and processing helper methods
  def find_matching_trapid_contact(xero_contact, by_xero_id, by_tax_number, by_email, remaining_contacts)
    xero_id = xero_contact["ContactID"]
    xero_tax = xero_contact["TaxNumber"]
    xero_email = extract_xero_email(xero_contact)
    xero_name = xero_contact["Name"]

    # Priority 1: Match by xero_id
    return by_xero_id[xero_id] if by_xero_id[xero_id]

    # Priority 2: Match by tax_number (ABN/ACN)
    if xero_tax.present?
      normalized_tax = normalize_tax_number(xero_tax)
      matches = by_tax_number[normalized_tax]
      return matches.first if matches && matches.any?
    end

    # Priority 3: Match by exact email
    if xero_email.present?
      normalized_email = xero_email.downcase.strip
      match = by_email[normalized_email]
      return match if match
    end

    # Priority 4: Match by fuzzy name (>85% similarity)
    if xero_name.present? && remaining_contacts.any?
      return fuzzy_match_by_name(xero_name, remaining_contacts)
    end

    nil
  end

  def fuzzy_match_by_name(xero_name, contacts)
    return nil if contacts.empty?

    # Create fuzzy matcher with contact names
    contact_names = contacts.map { |c| [ c.display_name, c ] }.to_h
    matcher = FuzzyMatch.new(contact_names.keys)

    # Find best match
    matched_name = matcher.find(xero_name, threshold: SIMILARITY_THRESHOLD)

    matched_name ? contact_names[matched_name] : nil
  end

  def update_trapid_from_xero(trapid_contact, xero_contact)
    updates = {
      xero_id: xero_contact["ContactID"],
      last_synced_at: @sync_timestamp,
      xero_sync_error: nil
    }

    # Update fields if Xero has data and Trapid doesn't, or if explicitly syncing
    updates[:full_name] = xero_contact["Name"] if xero_contact["Name"].present?
    updates[:first_name] = xero_contact["FirstName"] if xero_contact["FirstName"].present?
    updates[:last_name] = xero_contact["LastName"] if xero_contact["LastName"].present?
    updates[:tax_number] = normalize_tax_number(xero_contact["TaxNumber"]) if xero_contact["TaxNumber"].present?

    # Extract email from Xero contact
    xero_email = extract_xero_email(xero_contact)
    updates[:email] = xero_email if xero_email.present?

    # Extract phone numbers
    if xero_contact["Phones"].present?
      xero_contact["Phones"].each do |phone|
        case phone["PhoneType"]
        when "MOBILE"
          updates[:mobile_phone] = phone["PhoneNumber"] if phone["PhoneNumber"].present?
        when "DEFAULT", "DDI"
          updates[:office_phone] = phone["PhoneNumber"] if phone["PhoneNumber"].present?
        end
      end
    end

    trapid_contact.update!(updates)
    @stats[:updated] += 1
    Rails.logger.info("Updated Trapid contact ##{trapid_contact.id}")
  rescue StandardError => e
    error_msg = "Failed to update Trapid contact: #{e.message}"
    trapid_contact.update(xero_sync_error: error_msg)
    raise
  end

  def create_trapid_contact_from_xero(xero_contact)
    Rails.logger.info("Creating Trapid contact from Xero: #{xero_contact['Name']}")

    contact_data = {
      xero_id: xero_contact["ContactID"],
      full_name: xero_contact["Name"],
      first_name: xero_contact["FirstName"],
      last_name: xero_contact["LastName"],
      tax_number: normalize_tax_number(xero_contact["TaxNumber"]),
      email: extract_xero_email(xero_contact),
      sync_with_xero: true,
      last_synced_at: @sync_timestamp
    }

    # Extract phone numbers
    if xero_contact["Phones"].present?
      xero_contact["Phones"].each do |phone|
        case phone["PhoneType"]
        when "MOBILE"
          contact_data[:mobile_phone] = phone["PhoneNumber"]
        when "DEFAULT", "DDI"
          contact_data[:office_phone] = phone["PhoneNumber"]
        end
      end
    end

    Contact.create!(contact_data.compact)
    Rails.logger.info("Created Trapid contact from Xero: #{xero_contact['Name']}")
  rescue StandardError => e
    error_msg = "Failed to create Trapid contact from Xero: #{e.message}"
    Rails.logger.error(error_msg)
    raise
  end

  def build_xero_contact_payload(trapid_contact)
    payload = {
      Name: trapid_contact.full_name || "#{trapid_contact.first_name} #{trapid_contact.last_name}".strip
    }

    payload[:FirstName] = trapid_contact.first_name if trapid_contact.first_name.present?
    payload[:LastName] = trapid_contact.last_name if trapid_contact.last_name.present?
    payload[:EmailAddress] = trapid_contact.email if trapid_contact.email.present?
    payload[:TaxNumber] = trapid_contact.tax_number if trapid_contact.tax_number.present?

    # Add phone numbers
    phones = []
    if trapid_contact.mobile_phone.present?
      phones << {
        PhoneType: "MOBILE",
        PhoneNumber: trapid_contact.mobile_phone
      }
    end
    if trapid_contact.office_phone.present?
      phones << {
        PhoneType: "DEFAULT",
        PhoneNumber: trapid_contact.office_phone
      }
    end
    payload[:Phones] = phones if phones.any?

    payload
  end

  def extract_xero_email(xero_contact)
    # Xero can have email in EmailAddress field or in Addresses array
    return xero_contact["EmailAddress"] if xero_contact["EmailAddress"].present?

    # Check addresses for email
    if xero_contact["Addresses"].present?
      xero_contact["Addresses"].each do |address|
        return address["EmailAddress"] if address["EmailAddress"].present?
      end
    end

    nil
  end

  def normalize_tax_number(tax_number)
    return nil if tax_number.blank?
    # Remove spaces, dashes, and other formatting
    tax_number.to_s.gsub(/[\s\-]/, "").upcase
  end
end
