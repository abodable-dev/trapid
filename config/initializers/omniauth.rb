# Only mount OmniAuth middleware on OAuth paths to avoid intercepting API requests
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :microsoft_office365,
    ENV['MICROSOFT_CLIENT_ID'],
    ENV['MICROSOFT_CLIENT_SECRET'],
    {
      scope: 'openid profile email User.Read',
      callback_path: '/api/v1/auth/microsoft_office365/callback'
    }
end

# Configure OmniAuth to handle missing sessions gracefully for API-only apps
OmniAuth.config.allowed_request_methods = [:post, :get]
OmniAuth.config.path_prefix = '/api/v1/auth'
OmniAuth.config.silence_get_warning = true
OmniAuth.config.on_failure = proc { |env|
  [302, {'Location' => "#{env['omniauth.origin']}/auth/failure"}, []]
}
