# Kanban Project Manager

🚀 **Professional Kanban project management system with enterprise-grade authentication and role-based access control.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbarnacle1028%2FKanban-Project-Manager)

## ✨ Features

### 🔐 **Authentication & Security**
- **Secure login** with bcrypt password hashing and CAPTCHA protection
- **JWT-based authentication** with refresh tokens and automatic rotation
- **Role-based access control**: Admin, Manager, Rep with granular permissions
- **Account security**: Lockout protection, audit logging, session management
- **Production-ready security**: Rate limiting, CORS, security headers

### 🎨 **Modern Frontend**
- **React 18 + TypeScript + Vite** for lightning-fast development
- **Drag & drop Kanban boards** with @dnd-kit
- **Responsive design** with CSS modules
- **Role-based UI** that adapts to user permissions
- **Real-time notifications** and error handling
- **Component testing** with Vitest and React Testing Library

### 🗄️ **Robust Backend**
- **Express.js API** with comprehensive middleware
- **PostgreSQL** with Supabase integration
- **Database migrations** and automated setup
- **RESTful API** with proper error handling
- **Comprehensive logging** and monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)

### 1. Clone and Install
```bash
git clone https://github.com/barnacle1028/Kanban-Project-Manager.git
cd Kanban-Project-Manager
npm install
```

### 2. Database Setup
```bash
# Set up your database
npm run setup-db

# Or manually run migrations
psql -d your_db -f schema.sql
psql -d your_db -f migrations/001_add_authentication.sql
```

### 3. Environment Configuration
```bash
# Copy and configure environment variables
cp .env.production .env
# Edit .env with your database credentials
```

### 4. Development
```bash
# Start frontend (port 5173)
npm run dev

# Start backend (port 3001)
npm run server:dev
```

## 🌐 Production Deployment

### Option 1: Cloud Deployment (Recommended)

**Frontend: Vercel**
1. Connect this GitHub repo to [Vercel](https://vercel.com)
2. Build settings: `npm run build` → `dist`
3. Environment: `VITE_API_BASE_URL=https://kanbanpm.com/api`

**Backend: Railway**
1. Deploy backend to [Railway](https://railway.app)
2. Add environment variables from `.env.production`
3. Connect your Supabase database

### Option 2: VPS Deployment
```bash
# Use the deployment script
chmod +x deploy.sh
./deploy.sh kanbanpm.com production
```

### Option 3: Docker
```bash
docker-compose up -d
```

## 👥 User Roles & Permissions

| Feature | REP | MANAGER | ADMIN |
|---------|-----|---------|-------|
| View own engagements | ✅ | ✅ | ✅ |
| View team engagements | ❌ | ✅ | ✅ |
| Create engagements | ❌ | ✅ | ✅ |
| User management | ❌ | ❌ | ✅ |
| System administration | ❌ | ❌ | ✅ |

## 🔑 Default Login
- **Email**: `admin@kanban-app.com`
- **Password**: `admin123!`
- **⚠️ Change this immediately in production!**

## 📊 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, @dnd-kit, React Query, Zustand
- **Backend**: Node.js, Express.js, JWT, bcrypt, CAPTCHA
- **Database**: PostgreSQL, Supabase
- **Deployment**: Vercel, Railway, Docker, GitHub Actions
- **Testing**: Vitest, React Testing Library, Playwright

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with CAPTCHA
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and revoke tokens
- `GET /api/auth/profile` - Get user profile

### Engagements
- `GET /api/engagements` - List engagements (role-filtered)
- `GET /api/engagements/:id` - Get engagement details
- `POST /api/engagements` - Create engagement (Manager+)
- `PATCH /api/engagements/:id` - Update engagement
- `PATCH /api/engagements/:id/milestones/:mid` - Update milestone

## 🗄️ Database Schema

### Core Tables
- **app_user** - Users with roles and authentication
- **engagement** - Project engagements with status tracking
- **engagement_milestone** - Milestone tracking with stages
- **milestone_template** - Reusable milestone templates
- **refresh_tokens** - JWT token management
- **login_attempts** - Security audit logging

### Views
- **vw_engagement_progress** - Calculated completion percentages
- **vw_engagement_with_manager** - Engagement hierarchy
- **vw_user_auth** - Authentication data

## 🔒 Security Features

- **Password Security**: bcrypt hashing, strength requirements, history tracking
- **Account Protection**: Failed attempt lockout, rate limiting
- **CAPTCHA**: SVG-based visual verification
- **Token Security**: JWT with refresh rotation, secure storage
- **Audit Logging**: Comprehensive security event tracking
- **Network Security**: CORS, security headers, SSL enforcement

## 📖 Documentation

- [**Authentication Setup**](./AUTHENTICATION_SETUP.md) - Complete auth system guide
- [**Deployment Guide**](./DEPLOYMENT_GUIDE.md) - Production deployment options
- [**GoDaddy Setup**](./GODADDY_SETUP.md) - Domain configuration for kanbanpm.com

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.ai/code)
- UI components inspired by modern design principles
- Security practices following OWASP guidelines

---

**🌐 Live Demo**: [kanbanpm.com](https://kanbanpm.com)

**📧 Support**: For issues or questions, please open a GitHub issue.
