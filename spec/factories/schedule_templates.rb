FactoryBot.define do
  factory :schedule_template do
    sequence(:name) { |n| "Test Schedule Template #{n}" }
    description { "A test schedule template" }
    is_default { false }

    # Association - requires a user for created_by_id
    # We'll use User.first or create one if none exists
    created_by_id { User.first&.id || create(:user).id }
  end
end
