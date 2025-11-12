Rails.application.config.middleware.use OmniAuth::Builder do
  provider :microsoft_office365,
    ENV['MICROSOFT_CLIENT_ID'],
    ENV['MICROSOFT_CLIENT_SECRET'],
    {
      scope: 'openid profile email User.Read',
      callback_path: '/api/v1/auth/microsoft_office365/callback'
    }
end

# Security: Protect against CSRF attacks
OmniAuth.config.allowed_request_methods = [:post, :get]
