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
      version: Version.current_version_string,
      timestamp: Time.current
    }
  end

  def increment_version
    new_version = Version.increment!
    render json: {
      version: "v#{new_version}",
      message: "Version incremented successfully"
    }
  end
end
