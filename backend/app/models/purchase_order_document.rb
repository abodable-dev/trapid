class PurchaseOrderDocument < ApplicationRecord
  belongs_to :purchase_order
  belongs_to :document_task

  validates :purchase_order_id, presence: true
  validates :document_task_id, presence: true
  validates :document_task_id, uniqueness: { scope: :purchase_order_id }
end
