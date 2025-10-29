# Trapid

A full-stack application with Rails API backend and React frontend.

## Project Structure

```
trapid/
├── backend/        # Rails API (PostgreSQL)
├── frontend/       # React + Vite
└── README.md       # This file
```

## Tech Stack

### Backend
- Ruby on Rails 8.0 (API mode)
- PostgreSQL
- Rack CORS for cross-origin requests
- Deployed on Heroku

### Frontend
- React 19
- Vite
- Deployed on Vercel

## Getting Started

### Prerequisites
- Ruby 3.x
- Node.js 18+
- PostgreSQL
- Git

### Local Development Setup

#### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/trapid.git
cd trapid
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
bundle install

# Create and setup database
rails db:create
rails db:migrate
rails db:seed

# Start the Rails server (runs on port 3000)
rails server
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your backend URL (default: http://localhost:3000)

# Start the development server (runs on port 5173)
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to see the application.

## Deployment

### Backend - Heroku

1. **Create Heroku app**
```bash
cd backend
heroku create trapid-api
```

2. **Add PostgreSQL addon**
```bash
heroku addons:create heroku-postgresql:essential-0
```

3. **Set environment variables**
```bash
heroku config:set RAILS_ENV=production
heroku config:set RAILS_LOG_TO_STDOUT=enabled
heroku config:set RAILS_SERVE_STATIC_FILES=enabled
heroku config:set CORS_ORIGINS=https://your-app.vercel.app
```

4. **Deploy**
```bash
git push heroku main
```

5. **Run migrations**
```bash
heroku run rails db:migrate
```

### Frontend - Vercel

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy from frontend directory**
```bash
cd frontend
vercel
```

3. **Set environment variable in Vercel**
- Go to your project settings on Vercel
- Add environment variable: `VITE_API_URL` = `https://your-heroku-app.herokuapp.com`

4. **Update CORS on Heroku**
```bash
cd backend
heroku config:set CORS_ORIGINS=https://your-vercel-domain.vercel.app
```

## GitHub Setup

1. **Create a new repository on GitHub**

2. **Push your code**
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/trapid.git
git push -u origin main
```

3. **Connect to Vercel and Heroku**
- Link your GitHub repository to Vercel for automatic deployments
- Link your GitHub repository to Heroku for automatic deployments

## API Usage

The frontend includes a configured API client at `frontend/src/api.js`:

```javascript
import { api } from './api';

// GET request
const data = await api.get('/api/endpoint');

// POST request
const result = await api.post('/api/endpoint', { key: 'value' });

// PUT request
const updated = await api.put('/api/endpoint/:id', { key: 'value' });

// DELETE request
const deleted = await api.delete('/api/endpoint/:id');
```

## Development Workflow

1. Make changes to your code
2. Test locally
3. Commit and push to GitHub
4. Automatic deployments trigger on Vercel (frontend) and Heroku (backend)

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://localhost/trapid_development
RAILS_ENV=development
CORS_ORIGINS=http://localhost:5173
SECRET_KEY_BASE=generate_with_rails_secret
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

## License

MIT
