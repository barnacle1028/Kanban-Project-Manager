# Supabase Edge Functions Deployment Guide

This guide explains how to deploy the Account Management system using Supabase Edge Functions.

## Prerequisites

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Verify Installation**:
   ```bash
   supabase --version
   ```

## Deployment Steps

### 1. Login to Supabase
```bash
supabase login
```

### 2. Link to Your Project
```bash
supabase link --project-ref gmqdmwligbsjybjdqzhf
```

### 3. Deploy the Edge Function
```bash
supabase functions deploy accounts
```

### 4. Update Environment Variables
Make sure your Supabase project has the required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## What's Being Deployed

### Edge Function: `accounts`
- **File**: `supabase/functions/accounts/index.ts`
- **Endpoints**:
  - `GET /accounts` - Get all accounts
  - `GET /accounts/{id}` - Get account by ID  
  - `GET /accounts?q={query}` - Search accounts
  - `POST /accounts` - Create new account
  - `PATCH /accounts/{id}` - Update account
  - `DELETE /accounts/{id}` - Delete account

### Frontend Integration
- **File**: `src/api/accounts.ts` - Updated to use Supabase Edge Functions
- **Authentication**: Uses existing Supabase auth headers
- **CORS**: Properly configured for your domain

## Benefits of Edge Functions

✅ **No separate backend server needed**  
✅ **Automatic scaling**  
✅ **Built-in authentication**  
✅ **Global edge deployment**  
✅ **Cost-effective**  

## Testing the Deployment

1. After deployment, test the Edge Function:
   ```bash
   supabase functions invoke accounts --method GET
   ```

2. Check function logs:
   ```bash
   supabase functions logs accounts
   ```

## Troubleshooting

### Common Issues:

1. **Authentication Error**: Make sure you're logged into Supabase CLI
2. **Project Not Found**: Verify your project reference ID
3. **Function Not Found**: Ensure the function was deployed successfully
4. **CORS Issues**: Check that your frontend domain is allowed

### Get Help:
- Check function logs: `supabase functions logs accounts`
- View project dashboard: https://supabase.com/dashboard/project/gmqdmwligbsjybjdqzhf