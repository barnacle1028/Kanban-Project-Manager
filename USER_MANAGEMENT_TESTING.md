# User Management System - Testing Guide

## Overview
This document outlines how to test the complete user lifecycle in the Kanban Project Manager application, including User Management and User Role assignment systems.

## System Components

### 1. Database Schema (Supabase)
- **Users Table**: Enhanced with comprehensive fields (personal, professional, contact info)
- **User Roles Table**: Admin, Manager, Consultant, Custom role types
- **User Role Assignments Table**: Track role assignments with effective dates
- **User Preferences Table**: Personal settings and preferences
- **User Activities Table**: Activity logging and audit trail
- **Password Reset Tokens Table**: Secure password reset functionality

### 2. API Services
- **userManagementService**: Complete CRUD operations for users
- **userRoleService**: Role management and assignment operations
- **emailService**: Email notifications and templates

### 3. UI Components
- **User Management Interface**: Create, edit, list, and manage users
- **User Role Management**: Create and manage user roles
- **Role Assignment Modal**: Assign roles to users with audit trail
- **User Settings Page**: Personal profile, password, and preferences
- **Password Reset Flow**: Forgot password and reset confirmation

## Complete User Lifecycle Testing

### Test Scenario 1: Admin Creates New User

**Steps:**
1. Login as Admin (Chris) with email: `chris@company.com`
2. Click "User Management" button in Admin Dashboard
3. Click "Add User" button
4. Fill out user creation form:
   - Email: `newuser@company.com`
   - First Name: `John`
   - Last Name: `Doe`
   - User Role: Select from available roles
   - Employee Type: `full_time`
   - Send welcome email: ✓ checked
5. Click "Create User"

**Expected Results:**
- User created with temporary password
- Welcome email preview shown in console
- User appears in user list with "pending" status
- User must change password on first login

### Test Scenario 2: Role Assignment

**Steps:**
1. In User Management, find the newly created user
2. Click the Shield icon (Assign Role) for the user
3. Role Assignment Modal opens showing:
   - Current role information
   - Available roles dropdown
   - Effective dates
   - Reason field
4. Select a new role and set effective date
5. Click "Assign Role"

**Expected Results:**
- Role assignment successful
- User's role updated in the list
- Role change logged in system
- Email notification sent (console preview)

### Test Scenario 3: Password Reset Flow

**Steps:**
1. Logout from admin account
2. On login page, click "Forgot your password?"
3. Enter email address of existing user
4. Click "Send reset link"
5. Check console for email preview with reset URL
6. Navigate to the reset URL (copy from console)
7. Enter new password meeting requirements
8. Confirm password reset

**Expected Results:**
- Password reset email sent
- Reset form shows password requirements
- Password successfully changed
- User can login with new password

### Test Scenario 4: User Settings Management

**Steps:**
1. Login as any user
2. Click "⚙️ Settings" button in header
3. Test Profile Tab:
   - Update personal information
   - Save changes
4. Test Password Tab:
   - Change password with current password
   - Verify password requirements validation
5. Test Preferences Tab:
   - Change theme, timezone, notifications
   - Save preferences

**Expected Results:**
- All changes saved successfully
- Settings persist across sessions
- Password requirements enforced
- Success notifications shown

### Test Scenario 5: Authentication Integration

**Steps:**
1. Try to login with User Management credentials
2. Test different user status scenarios:
   - Active user: Should login successfully
   - Inactive user: Should show error message
   - User with `must_change_password`: Should prompt for password reset
3. Verify role-based dashboard access:
   - Admin users see Admin Dashboard
   - Manager users see Manager Dashboard
   - Rep users see Rep Dashboard

**Expected Results:**
- Authentication works with User Management service
- Proper role-based access control
- Inactive users blocked appropriately
- Password change requirements enforced

## Email Notifications Testing

The system includes comprehensive email templates that are previewed in the browser console:

### Welcome Email
- **Trigger**: New user creation with "Send welcome email" checked
- **Content**: Temporary password, login instructions, security notes
- **Preview**: Check browser console for email preview

### Password Reset Email
- **Trigger**: Password reset request
- **Content**: Secure reset link with expiration
- **Preview**: Check browser console for email preview

### Role Change Notification
- **Trigger**: Role assignment changes
- **Content**: Old role, new role, effective date
- **Preview**: Check browser console for email preview

### Account Status Notifications
- **Trigger**: Account activation/deactivation
- **Content**: Status change notification
- **Preview**: Check browser console for email preview

## Data Validation

### User Creation Validation
- ✅ Email format validation
- ✅ Required fields enforcement
- ✅ Employee ID uniqueness
- ✅ Phone number format
- ✅ Role assignment requirement

### Password Requirements
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one number
- ✅ At least one special character
- ✅ Real-time validation feedback

### Role Assignment Validation
- ✅ Valid role selection
- ✅ Effective date requirements
- ✅ Permission-based role assignment
- ✅ Audit trail maintenance

## Mock Data Available for Testing

### Pre-configured Users:
- **chris@company.com** - System Administrator (Admin)
- **derek@company.com** - Team Manager (Manager)
- **rolando@company.com** - Sales Representative (Rep)
- **amanda@company.com** - Senior Sales Representative (Rep)
- **lisa@company.com** - Sales Representative (Rep)
- **josh@company.com** - Junior Sales Representative (Rep) - Has temp password
- **steph@company.com** - Sales Representative (Rep) - Pending status

### Pre-configured Roles:
- **System Administrator** - Full admin access
- **Team Manager** - Manager dashboard access
- **Sales Consultant** - Rep dashboard access
- **Sales Manager** - Manager-level permissions

## Security Features Implemented

### Password Security
- ✅ Temporary password generation
- ✅ Password complexity requirements
- ✅ Secure password reset tokens
- ✅ Token expiration (1 hour)
- ✅ Password change enforcement

### Access Control
- ✅ Role-based permissions
- ✅ Dashboard access restrictions
- ✅ User status validation
- ✅ Account activation/deactivation

### Audit Trail
- ✅ User activity logging
- ✅ Role change tracking
- ✅ Login/logout tracking
- ✅ Password change logging

## Integration Points

### User Management ↔ User Roles
- ✅ Role assignment during user creation
- ✅ Role reassignment interface
- ✅ Permission-based role assignment validation
- ✅ Role change audit logging

### Authentication ↔ User Management
- ✅ Login uses User Management service
- ✅ Status validation during login
- ✅ Password change requirement enforcement
- ✅ Role-based dashboard routing

### User Settings ↔ Preferences
- ✅ Personal profile management
- ✅ Password change functionality
- ✅ Preference storage and retrieval
- ✅ Settings persistence

## Production Readiness Notes

### Ready for Production:
- ✅ Comprehensive database schema
- ✅ Complete API service layer
- ✅ Full UI implementation
- ✅ Security best practices
- ✅ Email template system
- ✅ Audit logging
- ✅ Role-based access control

### Requires Production Setup:
- 📧 **Email Service Integration**: Replace console previews with actual email service (SendGrid, SES, etc.)
- 🔐 **Password Hashing**: Implement bcrypt password hashing in authentication service
- 🔒 **HTTPS**: Ensure all authentication flows use HTTPS
- 📊 **Monitoring**: Add application monitoring and error tracking
- 🗄️ **Database Migration**: Run Supabase migrations in production environment

## Testing Checklist

- [ ] Admin can create new users
- [ ] Role assignment works correctly
- [ ] Password reset flow functional
- [ ] User settings can be updated
- [ ] Email notifications generated
- [ ] Authentication integration working
- [ ] Role-based access control enforced
- [ ] Audit logging captures activities
- [ ] Password requirements validated
- [ ] User status changes work
- [ ] Inactive users blocked from login
- [ ] Password change enforcement works

## Support and Troubleshooting

### Common Issues:
1. **Email not received**: Check browser console for email preview
2. **Password reset not working**: Verify token hasn't expired (1 hour limit)
3. **Role assignment fails**: Check user permissions for role assignment
4. **Login fails**: Verify user status is "active" and account is not suspended

### Debug Information:
- All email notifications show in browser console with full content
- User activities are logged to the database
- Error messages provide specific feedback for validation failures
- Role assignment validation explains permission requirements

This testing guide ensures comprehensive coverage of the User Management system's functionality and integration points.