# 🌐 GoDaddy DNS Setup for kanbanpm.com

## Quick Deployment Options for kanbanpm.com

### 🚀 **Option 1: Cloud Hosting (Recommended - Easiest)**

**Step 1: Deploy Frontend to Vercel**
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Connect your GitHub account
3. Import your Kanban project
4. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. In Environment Variables, add:
   ```
   VITE_API_BASE_URL=https://kanbanpm.com/api
   ```
6. Deploy! You'll get a temporary URL like `your-project.vercel.app`

**Step 2: Deploy Backend to Railway**
1. Go to [railway.app](https://railway.app) and sign up
2. Create new project from GitHub repo
3. Add environment variables from your `.env.production` file
4. Deploy! You'll get an API URL like `your-project.railway.app`

**Step 3: Configure DNS in GoDaddy**
1. Login to your GoDaddy account
2. Go to "My Products" → "Domains" → "kanbanpm.com" → "Manage DNS"
3. Add these DNS records:

```
Type    Name    Value                           TTL
CNAME   @       your-project.vercel.app        1 Hour
CNAME   www     your-project.vercel.app        1 Hour
CNAME   api     your-project.railway.app       1 Hour
```

**Step 4: Configure Custom Domain in Vercel**
1. In Vercel dashboard, go to your project
2. Go to Settings → Domains
3. Add domain: `kanbanpm.com`
4. Add domain: `www.kanbanpm.com`
5. Vercel will provide DNS instructions (should match step 3)

### 🖥️ **Option 2: VPS Hosting (More Control)**

**Step 1: Get a VPS**
- **DigitalOcean**: $6/month droplet
- **Linode**: $5/month
- **Vultr**: $6/month
- **AWS Lightsail**: $5/month

**Step 2: Configure DNS in GoDaddy**
```
Type    Name    Value                   TTL
A       @       YOUR_VPS_IP_ADDRESS    1 Hour
A       www     YOUR_VPS_IP_ADDRESS    1 Hour
A       api     YOUR_VPS_IP_ADDRESS    1 Hour
```

**Step 3: Deploy to VPS**
```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Install dependencies
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs nginx certbot python3-certbot-nginx
npm install -g pm2

# Clone and setup your app
git clone https://github.com/yourusername/kanban.git
cd kanban
npm install --production
npm run build

# Start the application
pm2 start server/app.cjs --name kanban-app
pm2 startup
pm2 save

# Configure Nginx
cp nginx.conf /etc/nginx/sites-available/kanbanpm.com
ln -s /etc/nginx/sites-available/kanbanpm.com /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Get SSL certificate
certbot --nginx -d kanbanpm.com -d www.kanbanpm.com

# Restart services
systemctl restart nginx
systemctl enable nginx
```

## 🔧 **Environment Configuration**

Update your `.env.production` with secure secrets:

```bash
# Generate secure JWT secret
openssl rand -base64 64

# Generate secure session secret  
openssl rand -base64 32
```

Then update:
```env
JWT_SECRET=your-generated-jwt-secret-here
SESSION_SECRET=your-generated-session-secret-here
```

## 🚀 **Subdomain Strategy**

For better organization, consider this setup:

```
kanbanpm.com          → Frontend (Vercel)
api.kanbanpm.com      → Backend API (Railway/VPS)
admin.kanbanpm.com    → Admin panel (optional)
docs.kanbanpm.com     → Documentation (optional)
```

GoDaddy DNS records:
```
Type    Name    Value
CNAME   @       your-frontend.vercel.app
CNAME   www     your-frontend.vercel.app
CNAME   api     your-backend.railway.app
```

## 📧 **Email Setup (Optional)**

To set up professional email like `admin@kanbanpm.com`:

**Option 1: Google Workspace ($6/user/month)**
1. In GoDaddy, go to Email & Office
2. Purchase Google Workspace
3. Follow setup instructions

**Option 2: Free Email Forwarding**
1. In GoDaddy DNS management
2. Add MX records for email forwarding
3. Set up forwarding rules

## 🔐 **SSL Certificate**

**For Vercel/Railway**: SSL is automatic
**For VPS**: Use Let's Encrypt (free)

```bash
# On your VPS
certbot --nginx -d kanbanpm.com -d www.kanbanpm.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

## 📊 **Monitoring Setup**

**Free monitoring options:**
- **UptimeRobot**: Monitor if kanbanpm.com is online
- **Google Analytics**: Track website usage
- **LogRocket**: Monitor application errors
- **Supabase Dashboard**: Monitor database performance

## 🚀 **Quick Start Commands**

**Deploy to cloud (recommended):**
```bash
# 1. Build production version
npm run build

# 2. Commit and push to GitHub
git add .
git commit -m "Production ready for kanbanpm.com"
git push origin main

# 3. Deploy via Vercel/Railway (automatic via GitHub)
```

**Deploy to VPS:**
```bash
# 1. Make deploy script executable
chmod +x deploy.sh

# 2. Run deployment
./deploy.sh kanbanpm.com production
```

## 🎯 **Launch Checklist**

- [ ] DNS records configured in GoDaddy
- [ ] SSL certificate active
- [ ] Frontend deployed and accessible at kanbanpm.com
- [ ] Backend API accessible at kanbanpm.com/api
- [ ] Database connected (Supabase)
- [ ] Admin account created and password changed
- [ ] Environment variables secured
- [ ] Monitoring enabled
- [ ] Backup strategy in place

## 🔍 **Testing Your Deployment**

```bash
# Test frontend
curl -I https://kanbanpm.com

# Test backend health
curl https://kanbanpm.com/health

# Test API
curl https://kanbanpm.com/api/auth/captcha

# Test database connection
curl https://kanbanpm.com/api/test
```

## 🆘 **Troubleshooting**

**DNS Propagation**: Changes can take 24-48 hours to propagate globally
**Check propagation**: Use [whatsmydns.net](https://whatsmydns.net)
**SSL Issues**: Make sure DNS points to correct server before requesting certificates
**API Errors**: Check CORS settings and environment variables

---

Your `kanbanpm.com` domain is ready to host a professional Kanban project management application! 🎉

**Next Steps:**
1. Choose your deployment method (Cloud or VPS)
2. Configure the DNS records in GoDaddy
3. Deploy your application
4. Test and enjoy your live application!