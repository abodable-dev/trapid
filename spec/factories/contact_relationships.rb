FactoryBot.define do
  factory :contact_relationship do
    source_contact { nil }
    related_contact { nil }
    relationship_type { "MyString" }
    notes { "MyText" }
  end
end
