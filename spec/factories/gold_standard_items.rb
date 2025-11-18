FactoryBot.define do
  factory :gold_standard_item do
    category { "MyString" }
    section { "MyString" }
    email { "MyString" }
    phone { "MyString" }
    is_active { false }
    discount { "9.99" }
    price { "9.99" }
    quantity { 1 }
    content { "MyText" }
    component { "MyString" }
    status { "MyString" }
    updated_by { "MyString" }
    metadata { "" }
  end
end
