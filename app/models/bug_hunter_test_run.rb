class BugHunterTestRun < ApplicationRecord
  validates :test_id, presence: true
  validates :status, presence: true, inclusion: { in: %w[pass fail error] }

  scope :for_test, ->(test_id) { where(test_id: test_id).order(created_at: :desc) }
  scope :recent, -> { order(created_at: :desc).limit(100) }
  scope :old, ->(before_date) { where('created_at < ?', before_date) }
end