# Kanban Project Manager

🚀 **Enterprise-grade Kanban project management system with comprehensive business management capabilities.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbarnacle1028%2FKanban-Project-Manager)

## ✨ Features

### 📊 **Business Management**
- **Engagement Management**: Complete CRUD operations for project engagements
- **Account Management**: Client account tracking with comprehensive contact details  
- **Engagement Types Manager**: Configurable engagement categories with CRUD capabilities
- **CSV Import/Export**: Bulk data operations across all management modules
- **Audit Logging**: Complete CRUD history tracking with change management

### 🔐 **Authentication & Security**
- **Supabase Auth** with JWT-based authentication
- **Role-based access control**: Admin, Manager, Rep with granular permissions
- **Row Level Security (RLS)** policies for data protection
- **Comprehensive audit trails** for compliance and accountability

### 🎨 **Modern Frontend**
- **React 18 + TypeScript + Vite** for lightning-fast development
- **Drag & drop Kanban boards** with @dnd-kit
- **TanStack Query** for efficient state management and caching
- **Responsive design** optimized for all devices
- **Professional UI/UX** with consistent design system

### 🗄️ **Database & Backend**
- **Supabase PostgreSQL** with direct client integration
- **16 database tables** with optimized schema design
- **Real-time capabilities** with Supabase subscriptions
- **Automated backups** and scaling with Supabase

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### 1. Clone and Install
```bash
git clone https://github.com/barnacle1028/Kanban-Project-Manager.git
cd Kanban-Project-Manager
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Configure Supabase credentials
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Database Setup
Run the database migration scripts in your Supabase SQL editor:
- Use the provided schema files to set up all 16 tables
- Configure Row Level Security (RLS) policies
- Populate initial engagement types data

### 4. Development
```bash
# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## 🏗️ Architecture

### Current Stack
- **Frontend**: React + TypeScript + Vite (deployed on Vercel)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: TanStack Query
- **UI Components**: Custom components with modern design system

### Project Structure
```
src/
├── components/           # React components
│   ├── admin/           # Admin management interfaces
│   ├── auth/            # Authentication components
│   └── user/            # User-specific components
├── api/                 # Supabase API integrations
├── services/            # Business logic services
├── lib/                 # Configuration and utilities
└── types/               # TypeScript type definitions
```

## 📈 Development Status

**Current Phase**: Phase 1 - 85% Complete

### ✅ Completed Features
- Database infrastructure with 16 tables
- Account Management System
- Engagement Types Management
- CSV Import/Export System
- Comprehensive Audit Logging
- Authentication & Security
- Modern frontend architecture

### 🔄 In Progress
- Milestone Template System
- Advanced reporting features

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Deploy the dist/ folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure build passes
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue on the GitHub repository.

---

**Built with ❤️ using React, TypeScript, Supabase, and modern web technologies.**