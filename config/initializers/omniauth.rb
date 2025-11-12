# Only mount OmniAuth middleware on OAuth paths to avoid intercepting API requests
# Custom middleware wrapper to constrain OmniAuth to specific paths
class ConditionalOmniAuth
  def initialize(app, path_prefix)
    @app = app
    @path_prefix = path_prefix
    @omniauth_app = OmniAuth::Builder.new(app) do
      provider :microsoft_office365,
        ENV['MICROSOFT_CLIENT_ID'],
        ENV['MICROSOFT_CLIENT_SECRET'],
        {
          scope: 'openid profile email User.Read',
          callback_path: '/api/v1/auth/microsoft_office365/callback'
        }
    end
  end

  def call(env)
    # Only pass to OmniAuth if the request path starts with the auth prefix
    if env['PATH_INFO'].to_s.start_with?(@path_prefix)
      @omniauth_app.call(env)
    else
      @app.call(env)
    end
  end
end

Rails.application.config.middleware.use ConditionalOmniAuth, '/api/v1/auth'

# Configure OmniAuth to handle missing sessions gracefully for API-only apps
OmniAuth.config.allowed_request_methods = [:post, :get]
OmniAuth.config.path_prefix = '/api/v1/auth'
OmniAuth.config.silence_get_warning = true
OmniAuth.config.on_failure = proc { |env|
  [302, {'Location' => "#{env['omniauth.origin']}/auth/failure"}, []]
}
