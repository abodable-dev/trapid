# Service to match suppliers to contacts using fuzzy string matching
class SupplierMatcher
  # Match types and their thresholds
  MATCH_TYPES = {
    exact: 1.0,
    high: 0.9,
    fuzzy: 0.7,
    manual: 0.0,
    unmatched: 0.0
  }.freeze

  def initialize
    @contacts = Contact.all.to_a
  end

  # Find best match for a supplier name
  def find_match(supplier_name)
    return { contact: nil, score: 0.0, match_type: :unmatched } if supplier_name.blank?

    normalized_supplier = normalize_name(supplier_name)
    best_match = nil
    best_score = 0.0

    @contacts.each do |contact|
      next if contact.full_name.blank?

      normalized_contact = normalize_name(contact.full_name)
      score = calculate_similarity(normalized_supplier, normalized_contact)

      if score > best_score
        best_score = score
        best_match = contact
      end
    end

    {
      contact: best_match,
      score: best_score,
      match_type: determine_match_type(best_score)
    }
  end

  # Batch match all suppliers
  def match_all_suppliers(suppliers)
    results = []

    suppliers.each do |supplier|
      match_result = find_match(supplier.name)

      results << {
        supplier: supplier,
        contact: match_result[:contact],
        score: match_result[:score],
        match_type: match_result[:match_type]
      }
    end

    results
  end

  # Auto-apply matches above a certain threshold
  def auto_apply_matches(threshold: 0.9, verify_exact: true)
    suppliers = Supplier.where(contact_id: nil)
    matched_count = 0

    suppliers.each do |supplier|
      match_result = find_match(supplier.name)

      if match_result[:score] >= threshold && match_result[:contact]
        supplier.update!(
          contact_id: match_result[:contact].id,
          confidence_score: match_result[:score],
          match_type: match_result[:match_type],
          is_verified: verify_exact && match_result[:match_type] == :exact
        )
        matched_count += 1
      end
    end

    matched_count
  end

  private

  # Normalize company/contact name for better matching
  def normalize_name(name)
    return '' if name.blank?

    normalized = name.dup

    # Remove common business suffixes
    suffixes = [
      'Pty Ltd',
      'PTY LTD',
      'Pty. Ltd.',
      'Limited',
      'Ltd',
      'LTD',
      'Incorporated',
      'Inc',
      'INC',
      'Corporation',
      'Corp',
      'CORP',
      'Company',
      'Co',
      'CO',
      'Services',
      'Service',
      'Group',
      'Australia',
      'Australian',
      'Qld',
      'QLD',
      'Queensland',
      '& Associates',
      '&Associates',
      '& Sons',
      '&Sons'
    ]

    suffixes.each do |suffix|
      normalized = normalized.gsub(/\b#{Regexp.escape(suffix)}\b/i, '')
    end

    # Remove special characters and extra spaces
    normalized = normalized.gsub(/[^a-z0-9\s]/i, ' ')
    normalized = normalized.gsub(/\s+/, ' ')
    normalized.strip.downcase
  end

  # Calculate similarity between two strings using Levenshtein distance
  def calculate_similarity(str1, str2)
    return 1.0 if str1 == str2
    return 0.0 if str1.empty? || str2.empty?

    # Use Damerau-Levenshtein distance
    distance = levenshtein_distance(str1, str2)
    max_length = [str1.length, str2.length].max

    # Convert distance to similarity score (0-1)
    1.0 - (distance.to_f / max_length)
  end

  # Levenshtein distance algorithm
  def levenshtein_distance(str1, str2)
    matrix = Array.new(str1.length + 1) { Array.new(str2.length + 1, 0) }

    (0..str1.length).each { |i| matrix[i][0] = i }
    (0..str2.length).each { |j| matrix[0][j] = j }

    (1..str1.length).each do |i|
      (1..str2.length).each do |j|
        cost = str1[i - 1] == str2[j - 1] ? 0 : 1

        matrix[i][j] = [
          matrix[i - 1][j] + 1,      # deletion
          matrix[i][j - 1] + 1,      # insertion
          matrix[i - 1][j - 1] + cost # substitution
        ].min
      end
    end

    matrix[str1.length][str2.length]
  end

  # Determine match type based on score
  def determine_match_type(score)
    case score
    when MATCH_TYPES[:exact]
      :exact
    when MATCH_TYPES[:high]..Float::INFINITY
      :high
    when MATCH_TYPES[:fuzzy]..MATCH_TYPES[:high]
      :fuzzy
    else
      :unmatched
    end
  end
end
