Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # API health check
  get "/health", to: "health#index"

  # API routes
  namespace :api do
    namespace :v1 do
      # Authentication routes
      post 'auth/signup', to: 'authentication#signup'
      post 'auth/login', to: 'authentication#login'
      get 'auth/me', to: 'authentication#me'

      # Import routes
      post 'imports/upload', to: 'imports#upload'
      post 'imports/execute', to: 'imports#execute'
      get 'imports/status/:session_key', to: 'imports#status'

      # Grok AI integration
      post 'grok/chat', to: 'grok#chat'
      get 'grok/suggest-features', to: 'grok#suggest_features'
      post 'grok/plans', to: 'grok#create_plan'
      get 'grok/plans', to: 'grok#list_plans'
      get 'grok/plans/:id', to: 'grok#show_plan'
      patch 'grok/plans/:id', to: 'grok#update_plan'

      # Construction jobs management
      resources :constructions

      # Price Book management
      resources :pricebook, controller: 'pricebook_items', path: 'pricebook' do
        member do
          get :history
        end
        collection do
          patch :bulk_update
          post :import
        end
      end

      # Suppliers management
      resources :suppliers

      # Table management
      resources :tables do
        # Column management
        resources :columns, only: [:create, :update, :destroy] do
          member do
            get :lookup_options
            get :lookup_search
          end
        end

        # Record management for dynamic tables
        resources :records
      end
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
