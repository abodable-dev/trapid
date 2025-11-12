class ContactRelationship < ApplicationRecord
  belongs_to :source_contact, class_name: 'Contact'
  belongs_to :related_contact, class_name: 'Contact'

  # Relationship type options
  RELATIONSHIP_TYPES = [
    'previous_client',
    'parent_company',
    'subsidiary',
    'partner',
    'referral',
    'supplier_alternate',
    'related_project',
    'family_member',
    'other'
  ].freeze

  # Validations
  validates :relationship_type, presence: true, inclusion: { in: RELATIONSHIP_TYPES }
  validates :source_contact_id, presence: true
  validates :related_contact_id, presence: true
  validate :cannot_relate_to_self
  validate :unique_relationship_pair

  # Callbacks for bidirectional sync
  after_create :create_reverse_relationship
  after_update :update_reverse_relationship
  after_destroy :destroy_reverse_relationship

  # Find the reverse relationship
  def reverse_relationship
    ContactRelationship.find_by(
      source_contact_id: related_contact_id,
      related_contact_id: source_contact_id
    )
  end

  private

  def cannot_relate_to_self
    if source_contact_id == related_contact_id
      errors.add(:related_contact_id, "cannot be the same as source contact")
    end
  end

  def unique_relationship_pair
    # Check if this relationship already exists
    existing = ContactRelationship.where(
      source_contact_id: source_contact_id,
      related_contact_id: related_contact_id
    ).where.not(id: id)

    if existing.exists?
      errors.add(:base, "Relationship already exists between these contacts")
    end
  end

  def create_reverse_relationship
    # Skip if reverse already exists or if we're being called from the reverse creation
    return if reverse_relationship.present?
    return if Thread.current[:creating_reverse_relationship]

    Thread.current[:creating_reverse_relationship] = true
    ContactRelationship.create!(
      source_contact_id: related_contact_id,
      related_contact_id: source_contact_id,
      relationship_type: relationship_type,
      notes: notes
    )
  ensure
    Thread.current[:creating_reverse_relationship] = false
  end

  def update_reverse_relationship
    return if Thread.current[:updating_reverse_relationship]

    reverse = reverse_relationship
    return unless reverse

    Thread.current[:updating_reverse_relationship] = true
    reverse.update!(
      relationship_type: relationship_type,
      notes: notes
    )
  ensure
    Thread.current[:updating_reverse_relationship] = false
  end

  def destroy_reverse_relationship
    return if Thread.current[:destroying_reverse_relationship]

    reverse = reverse_relationship
    return unless reverse

    Thread.current[:destroying_reverse_relationship] = true
    reverse.destroy!
  ensure
    Thread.current[:destroying_reverse_relationship] = false
  end
end
