# Trapid

**Construction Project Management & Estimation Platform**

Full-stack application built with Rails (backend) and React (frontend) for managing construction projects, price books, purchase orders, and job estimations.

---

## 🚀 Quick Start (macOS)

**One-line setup for macOS developers:**

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/abodable-dev/trapid/main/trapid-mac-setup.sh)
```

This will automatically:
- ✅ Install all development tools (Homebrew, PostgreSQL, Ruby, Node.js, VS Code)
- ✅ Clone the repository
- ✅ Set up the database
- ✅ Install all dependencies
- ✅ Install VS Code extensions (including Claude Code)
- ✅ Open the project in VS Code

**Time required:** 15-30 minutes (depending on internet speed)

---

## 📚 Manual Setup

If you prefer manual setup or are not on macOS, see our detailed guides:

- **[Quick Start Guide](docs/SETUP.md)** - Fast manual setup
- **[Environment Setup](docs/ENVIRONMENT_SETUP.md)** - Complete configuration guide
- **[Config Variables Reference](docs/CONFIG_VARS.md)** - All environment variables explained

---

## 🏗️ Architecture

```
trapid/
├── backend/              # Rails 8 API
│   ├── app/             # Controllers, models, services
│   ├── config/          # Configuration
│   └── db/              # Database migrations
│
├── frontend/            # React + Vite
│   ├── src/            # React components
│   └── public/         # Static assets
│
└── docs/               # Documentation
```

---

## 🛠️ Tech Stack

### Backend
- **Ruby on Rails 8.0** - API-only mode
- **PostgreSQL** - Primary database
- **Solid Queue** - Background jobs
- **Rack CORS** - Cross-origin requests

### Frontend
- **React 19** - UI framework
- **Vite 7** - Build tool & dev server
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

### Integrations
- **Cloudinary** - Image storage
- **Microsoft OneDrive** - Document management
- **Xero** - Accounting integration
- **Anthropic Claude** - AI features
- **Google Search API** - Product image search

---

## 🔑 Key Features

### Price Book Management
- Import suppliers and products
- Track price history
- Export price books per supplier
- Automatic categorization

### Purchase Order Tracking
- Create and manage POs
- Match invoices from Xero
- Track payment status
- Generate reports

### Job Estimation
- Visual job planning interface
- Drag-and-drop product selection
- Real-time cost calculation
- Export estimates

### Document Management
- OneDrive integration for job documents
- Automatic folder creation
- Version tracking

### AI-Powered Features
- Intelligent product image selection
- Construction plan review
- Automated categorization

---

## 🚦 Running Locally

### Backend Server
```bash
cd backend
bundle exec rails server
# Runs on http://localhost:3000
```

### Frontend Dev Server
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

---

## 📖 Documentation

### Getting Started
- [Setup Guide](docs/SETUP.md) - Quick start instructions
- [Environment Setup](docs/ENVIRONMENT_SETUP.md) - Detailed configuration
- [Config Variables](docs/CONFIG_VARS.md) - All environment variables

### Features
- [Price Book Import](backend/PRICEBOOK_IMPORT.md) - Import guide
- [Invoice Matching](backend/INVOICE_MATCHING_ENHANCEMENT.md) - Xero integration
- [Schedule Master](docs/SCHEDULE_MASTER_IMPLEMENTATION.md) - Job scheduling
- [Image Scraping](docs/IMAGE_SCRAPING_SYSTEM.md) - Product images

### Development
- [Knowledge Base](docs/KNOWLEDGE_BASE.md) - Architecture overview
- [Development Progress](docs/development-progress.md) - Current status
- [OneDrive Setup](docs/onedrive-setup/) - OneDrive integration guide

---

## 🌐 Deployment

### Backend (Heroku)
```bash
cd backend
heroku create trapid-api
heroku addons:create heroku-postgresql:essential-0
git push heroku main
heroku run rails db:migrate
```

See: [Environment Setup Guide](docs/ENVIRONMENT_SETUP.md#production-heroku--vercel)

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set root directory: `frontend`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL`

---

## 🔐 Environment Variables

All sensitive configuration is managed via environment variables. See:

- **Quick Reference:** [docs/CONFIG_VARS.md](docs/CONFIG_VARS.md)
- **Detailed Setup:** [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md)

**Minimum required variables:**
- `DATABASE_URL` - PostgreSQL connection
- `SECRET_KEY_BASE` - Rails secret key
- `FRONTEND_URL` - Frontend application URL
- `VITE_API_URL` - Backend API URL

**Optional integrations:**
- Cloudinary (image storage)
- OneDrive (documents)
- Xero (accounting)
- Claude AI (AI features)

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
bundle exec rspec
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 📦 Database

### Create Database
```bash
cd backend
rails db:create
```

### Run Migrations
```bash
rails db:migrate
```

### Seed Data (Optional)
```bash
rails db:seed
```

### Import Price Books
```bash
# See backend/PRICEBOOK_IMPORT.md for detailed instructions
rails pricebook:import_suppliers
rails pricebook:import_items
rails pricebook:import_history
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 🆘 Support

### Common Issues

**Database connection failed:**
```bash
# Check PostgreSQL is running
brew services list  # macOS
# or
sudo systemctl status postgresql  # Linux
```

**Frontend can't connect to backend:**
- Verify `VITE_API_URL` in `frontend/.env`
- Check backend is running on correct port
- Verify CORS settings in `backend/config/initializers/cors.rb`

**Missing environment variables:**
```bash
# Copy templates
cd backend && cp .env.example .env
cd frontend && cp .env.example .env
```

### Getting Help

1. Check the [documentation](docs/)
2. Review [troubleshooting guide](docs/ENVIRONMENT_SETUP.md#troubleshooting)
3. Search existing [GitHub issues](https://github.com/abodable-dev/trapid/issues)
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - OS and version info

---

## 📊 Project Status

**Current Version:** v102+

**Active Development Areas:**
- Job estimation workflow improvements
- Enhanced price book management
- Xero invoice matching optimization
- AI-powered plan review

See: [Development Progress](docs/development-progress.md)

---

## 🔗 Links

- **Backend:** [backend/README.md](backend/README.md)
- **Frontend:** [frontend/README.md](frontend/README.md)
- **Documentation:** [docs/](docs/)
- **Production:** https://trapid.vercel.app
- **API:** https://trapid-backend-447058022b51.herokuapp.com

---

**Built with ❤️ for construction professionals**
