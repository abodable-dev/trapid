FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "test#{n}@example.com" }
    sequence(:name) { |n| "Test User #{n}" }
    password { 'Password123!' }
    password_confirmation { 'Password123!' }
    role { "admin" }
  end
end
