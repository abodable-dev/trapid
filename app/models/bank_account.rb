class BankAccount < ApplicationRecord
  # Associations
  belongs_to :company

  # Validations
  validates :account_name, presence: true
  validates :bank_name, presence: true
  validates :bsb, presence: true, format: { with: /\A\d{3}-?\d{3}\z/, message: "must be in format XXX-XXX" }
  validates :account_number, presence: true
  validates :is_primary, uniqueness: { scope: :company_id, conditions: -> { where(is_primary: true) },
                                        message: "company can only have one primary account" }

  # Callbacks
  before_save :normalize_bsb

  private

  def normalize_bsb
    self.bsb = bsb.gsub(/\D/, '').insert(3, '-') if bsb.present?
  end
end
