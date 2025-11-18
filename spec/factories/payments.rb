FactoryBot.define do
  factory :payment do
    purchase_order { nil }
    amount { "9.99" }
    payment_date { "2025-11-13" }
    payment_method { "MyString" }
    reference_number { "MyString" }
    notes { "MyText" }
    xero_payment_id { "MyString" }
    xero_synced_at { "2025-11-13 07:36:31" }
    xero_sync_error { "MyText" }
  end
end
