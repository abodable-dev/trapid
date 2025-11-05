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

      # Master Schedule - Projects
      resources :projects do
        member do
          get :gantt
        end

        # Project tasks (nested under projects)
        resources :tasks, controller: 'project_tasks'
      end

      # Purchase Orders management
      resources :purchase_orders do
        collection do
          post :smart_lookup
          post :smart_create
          post :bulk_create
        end
        member do
          post :approve
          post :send_to_supplier
          post :mark_received
        end
      end

      # Price Book management
      resources :pricebook, controller: 'pricebook_items', path: 'pricebook' do
        member do
          get :history
          post :fetch_image
          post :update_image
          post :add_price
          post :set_default_supplier
          delete 'price_histories/:history_id', to: 'pricebook_items#delete_price_history'
        end
        collection do
          patch :bulk_update
          post :import
          post :preview
          post :fetch_all_images
          get :image_stats
        end
      end

      # Suppliers management
      resources :suppliers do
        collection do
          get :unmatched
          get :needs_review
          post :auto_match
        end
        member do
          post :link_contact
          post :unlink_contact
          post :verify_match
        end
      end

      # Contacts management
      resources :contacts

      # Company Settings
      resource :company_settings, only: [:show, :update]

      # Xero integration
      resources :xero, only: [] do
        collection do
          get :auth_url
          post :callback
          get :status
          delete :disconnect
        end
      end

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
