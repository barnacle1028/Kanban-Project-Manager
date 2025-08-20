# Authentication & Authorization Setup Guide

## 🔐 Complete Role-Based Authentication System

This implementation provides a secure, production-ready authentication system with:

- **Secure password hashing** (bcrypt with cost 12)
- **CAPTCHA validation** for login attempts
- **JWT-based authentication** with refresh tokens
- **Role-based access control** (Admin, Manager, Rep)
- **Account lockout** after failed attempts
- **Session management** and token rotation
- **Comprehensive audit logging**

## 🗄️ Database Setup

### 1. Run the Authentication Migration

```sql
-- First, ensure your main schema.sql is applied
psql -d kanban_db -f schema.sql

-- Then apply the authentication migration
psql -d kanban_db -f migrations/001_add_authentication.sql
```

### 2. Default Admin Account

The migration creates a default admin user:
- **Email**: `admin@kanban-app.com`
- **Password**: `admin123!`
- **Role**: `ADMIN`

⚠️ **Change this password immediately in production!**

## 🚀 Server Setup

### 1. Environment Configuration

Update your `.env` file:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/kanban_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# API URLs
VITE_API_BASE_URL=http://localhost:3001/api
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development
```

### 2. Start the Backend Server

```bash
# Development mode with auto-restart
npm run server:dev

# Production mode
npm run server
```

The server will start on `http://localhost:3001` with the following endpoints:

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/captcha` | Generate CAPTCHA | Public |
| `POST` | `/login` | User login with CAPTCHA | Public |
| `POST` | `/refresh` | Refresh access token | Public |
| `POST` | `/logout` | Logout and revoke tokens | Authenticated |
| `POST` | `/change-password` | Change user password | Authenticated |
| `GET` | `/profile` | Get user profile | Authenticated |

### Engagement Routes (`/api/engagements`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/` | List engagements (filtered by role) | All Users |
| `GET` | `/:id` | Get engagement details | Owner/Manager/Admin |
| `POST` | `/` | Create new engagement | Manager/Admin |
| `PATCH` | `/:id` | Update engagement | Owner/Manager/Admin |
| `PATCH` | `/:id/milestones/:mid` | Update milestone | Owner/Manager/Admin |
| `DELETE` | `/:id` | Delete engagement | Manager/Admin |

## 🛡️ Security Features

### 1. Password Security
- **bcrypt hashing** with cost factor 12
- **Password history** tracking (prevents reuse of last 5 passwords)
- **Strength requirements**: 8+ chars, uppercase, lowercase, number, special char

### 2. Account Protection
- **Account lockout** after 5 failed attempts (30-minute lockout)
- **Rate limiting**: 5 login attempts per 15 minutes per IP
- **Failed attempt logging** for security monitoring

### 3. CAPTCHA Protection
- **SVG-based CAPTCHA** for login forms
- **Limited attempts** (3 tries per CAPTCHA)
- **5-minute expiration** for CAPTCHA tokens

### 4. Token Security
- **JWT access tokens** (15-minute expiration)
- **Refresh tokens** (7-day expiration, stored hashed in database)
- **Token rotation** on refresh
- **Automatic revocation** on logout

## 👥 Role-Based Access Control

### Role Hierarchy
1. **REP** (Level 1) - Basic access
2. **MANAGER** (Level 2) - Team management
3. **ADMIN** (Level 3) - Full system access

### Access Rules

#### REP Access
- View and edit own engagements only
- Cannot create new engagements
- Cannot access team or admin features

#### MANAGER Access
- All REP permissions +
- View and edit team member engagements
- Create new engagements
- Assign engagements to team members
- Access team management features

#### ADMIN Access
- All system access
- User management
- System configuration
- Audit logs and reports
- Can access any engagement

## 🎨 Frontend Components

### Authentication Components
- `LoginForm` - Secure login with CAPTCHA
- `ProtectedRoute` - Route-based access control
- `UserMenu` - User profile and logout
- `AccessDenied` - Unauthorized access page

### Usage Examples

```jsx
// Protect entire routes
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Require specific role (hierarchy-based)
<ProtectedRoute requiredRole="MANAGER">
  <TeamManagement />
</ProtectedRoute>

// Require exact roles
<ProtectedRoute requiredRoles={['ADMIN']}>
  <AdminPanel />
</ProtectedRoute>
```

## 🔍 Testing the System

### 1. Start Both Servers

```bash
# Terminal 1: Backend server
npm run server:dev

# Terminal 2: Frontend server
npm run dev
```

### 2. Test Authentication Flow

1. **Visit**: `http://localhost:5173`
2. **Login** with admin credentials:
   - Email: `admin@kanban-app.com`
   - Password: `admin123!`
   - Complete the CAPTCHA
3. **Navigate** through role-based sections
4. **Test logout** functionality

### 3. Test Role-Based Access

1. Create users with different roles (via admin panel)
2. Login with each role
3. Verify access restrictions are enforced
4. Test unauthorized access attempts

## 📊 Monitoring & Maintenance

### Database Cleanup
The system includes automatic cleanup for:
- Expired refresh tokens
- Expired sessions
- Old login attempts (30-day retention)

### Manual Cleanup
```sql
-- Run this function periodically
SELECT cleanup_expired_auth();
```

### Security Monitoring
Monitor the `login_attempts` table for:
- Brute force attacks
- Unusual IP patterns
- Failed login spikes

## 🔧 Customization

### JWT Configuration
Adjust token expiration times in `.env`:
```env
JWT_EXPIRES_IN=30m          # Access token (increase for less frequent refreshes)
REFRESH_TOKEN_EXPIRES_IN=30d # Refresh token (increase for longer sessions)
```

### Role Permissions
Modify role hierarchy in `middleware/auth.js`:
```javascript
const roleHierarchy = {
  'REP': 1,
  'MANAGER': 2,
  'SENIOR_MANAGER': 3,  // Add new roles
  'ADMIN': 4
}
```

### CAPTCHA Settings
Adjust CAPTCHA difficulty in `middleware/captcha.js`:
```javascript
const captcha = svgCaptcha.create({
  size: 6,        // More characters
  noise: 3,       // More noise
  color: true,    // Use colors
})
```

## 🚨 Security Best Practices

1. **Change default admin password** immediately
2. **Use strong JWT secrets** in production
3. **Enable HTTPS** in production
4. **Monitor failed login attempts**
5. **Regular security updates**
6. **Database connection encryption**
7. **Rate limiting** on all endpoints
8. **Input validation** on all user inputs

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in `.env`
   - Ensure database exists

2. **CAPTCHA Not Loading**
   - Check server logs for SVG generation errors
   - Verify CORS settings
   - Check network connectivity

3. **JWT Token Expired**
   - Implement automatic token refresh in frontend
   - Check token expiration settings
   - Verify refresh token functionality

4. **Role Access Denied**
   - Check user role in database
   - Verify role hierarchy settings
   - Check middleware configuration

## 📈 Next Steps

Consider implementing:
- **Multi-factor authentication** (MFA)
- **OAuth integration** (Google, Microsoft)
- **Password reset via email**
- **Email verification**
- **Advanced audit logging**
- **Role-based UI customization**

---

This authentication system provides enterprise-grade security while maintaining ease of use. All components are production-ready and follow security best practices.