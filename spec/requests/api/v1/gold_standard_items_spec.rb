require 'rails_helper'

RSpec.describe "Api::V1::GoldStandardItems", type: :request do
  describe "GET /index" do
    it "returns http success" do
      get "/api/v1/gold_standard_items/index"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /create" do
    it "returns http success" do
      get "/api/v1/gold_standard_items/create"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /update" do
    it "returns http success" do
      get "/api/v1/gold_standard_items/update"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /destroy" do
    it "returns http success" do
      get "/api/v1/gold_standard_items/destroy"
      expect(response).to have_http_status(:success)
    end
  end

end
