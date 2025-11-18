FactoryBot.define do
  factory :role do
    name { "MyString" }
    display_name { "MyString" }
    description { "MyText" }
    active { false }
    position { 1 }
  end
end
