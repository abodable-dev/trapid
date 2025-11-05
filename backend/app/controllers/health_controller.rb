class HealthController < ApplicationController
  def index
    render json: {
      status: "ok",
      timestamp: Time.current,
      environment: Rails.env,
      version: heroku_release_version
    }
  end

  def version
    render json: {
      version: heroku_release_version,
      timestamp: Time.current
    }
  end

  private

  def heroku_release_version
    # Heroku sets HEROKU_RELEASE_VERSION env var (e.g., "v96")
    ENV['HEROKU_RELEASE_VERSION'] || 'unknown'
  end
end
