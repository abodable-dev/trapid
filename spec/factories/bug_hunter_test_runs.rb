FactoryBot.define do
  factory :bug_hunter_test_run do
    test_id { "MyString" }
    test_name { "MyString" }
    status { "MyString" }
    message { "MyText" }
    duration { 1.5 }
  end
end
