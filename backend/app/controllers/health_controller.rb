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
      heroku_env_vars: heroku_environment_variables,
      timestamp: Time.current
    }
  end

  private

  def heroku_release_version
    # Heroku sets HEROKU_RELEASE_VERSION env var (e.g., "v96")
    ENV['HEROKU_RELEASE_VERSION'] || 'unknown'
  end

  def heroku_environment_variables
    ENV.select { |key, _| key.start_with?('HEROKU_') }
  end
end
