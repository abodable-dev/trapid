FactoryBot.define do
  factory :table_protection do
    table_name { "MyString" }
    is_protected { false }
    description { "MyText" }
  end
end
