# 🚀 Production Deployment Guide

## Quick Start Options

### Option 1: Cloud Platforms (Recommended for beginners)

**Frontend: Vercel**
1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Import your project
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add environment variables from `.env.production`
5. Deploy automatically on every push!

**Backend: Railway**
1. Connect your repo to [Railway](https://railway.app)
2. Deploy the backend service
3. Set start command: `node server/app.cjs`
4. Add all environment variables from `.env.production`
5. Connect your Supabase database

### Option 2: VPS Deployment (More control)

**1. Prepare your VPS (Ubuntu/Debian)**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx

# Install SSL certificate tool
sudo apt install certbot python3-certbot-nginx
```

**2. Deploy your application**
```bash
# Clone your repository
git clone https://github.com/yourusername/kanban.git
cd kanban

# Install dependencies
npm install --production

# Build the application
npm run build

# Start with PM2
pm2 start server/app.cjs --name kanban-app
pm2 startup
pm2 save
```

**3. Configure Nginx**
```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/kanban
sudo ln -s /etc/nginx/sites-available/kanban /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### Option 3: Docker Deployment

**1. Install Docker**
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

**2. Deploy with Docker Compose**
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Update deployment
git pull
docker-compose down
docker-compose up -d --build
```

## Configuration

### 1. Domain Setup

**Update `.env.production`:**
```env
VITE_API_BASE_URL=https://yourdomain.com/api
FRONTEND_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
COOKIE_DOMAIN=yourdomain.com
```

**Update `nginx.conf`:**
- Replace `your-domain.com` with your actual domain
- Update SSL certificate paths

### 2. Security Configuration

**Generate secure secrets:**
```bash
# JWT Secret (64 characters)
openssl rand -base64 64

# Session Secret (32 characters)
openssl rand -base64 32
```

**Update environment variables:**
```env
JWT_SECRET=your-generated-jwt-secret
SESSION_SECRET=your-generated-session-secret
```

### 3. Database Configuration

Your Supabase database is already configured. For production:

1. **Change default admin password**
2. **Review database connection pooling**
3. **Set up database backups**
4. **Monitor connection limits**

## DNS Configuration

**Add these DNS records:**
```
A     @              YOUR_SERVER_IP
A     www            YOUR_SERVER_IP
AAAA  @              YOUR_SERVER_IPv6 (if available)
AAAA  www            YOUR_SERVER_IPv6 (if available)
```

## SSL Certificate

**Let's Encrypt (Free):**
```bash
# For Nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# For standalone (if not using Nginx)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

**Auto-renewal:**
```bash
# Test renewal
sudo certbot renew --dry-run

# Set up automatic renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## Monitoring & Maintenance

### 1. Application Monitoring

**PM2 Monitoring:**
```bash
# View status
pm2 status

# View logs
pm2 logs kanban-app

# Restart application
pm2 restart kanban-app

# Monitor resources
pm2 monit
```

### 2. Server Monitoring

**Basic monitoring script:**
```bash
#!/bin/bash
# Save as /usr/local/bin/monitor-kanban.sh

# Check if application is running
if ! pm2 list | grep -q "kanban-app.*online"; then
    echo "$(date): Kanban app is down, restarting..." >> /var/log/kanban-monitor.log
    pm2 restart kanban-app
fi

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$(date): Disk usage is ${DISK_USAGE}%" >> /var/log/kanban-monitor.log
fi
```

**Set up cron job:**
```bash
# Run monitoring every 5 minutes
echo "*/5 * * * * /usr/local/bin/monitor-kanban.sh" | sudo crontab -
```

### 3. Backup Strategy

**Database backup (automated):**
Supabase handles this automatically, but you can also set up additional backups:

```bash
#!/bin/bash
# Daily database backup
pg_dump $DATABASE_URL > /backups/kanban-$(date +%Y%m%d).sql
find /backups -name "kanban-*.sql" -mtime +7 -delete
```

## Performance Optimization

### 1. Frontend Optimization

- **Enable gzip compression** (handled by Nginx config)
- **Set proper cache headers** (configured in Nginx)
- **Use CDN** for static assets (CloudFlare recommended)

### 2. Backend Optimization

- **Database connection pooling** (already configured)
- **Rate limiting** (configured in Nginx and Express)
- **Response compression** (enabled in Express)

### 3. Server Optimization

```bash
# Increase file limits
echo "fs.file-max = 65536" | sudo tee -a /etc/sysctl.conf

# Optimize TCP settings
echo "net.core.somaxconn = 65536" | sudo tee -a /etc/sysctl.conf

# Apply changes
sudo sysctl -p
```

## Troubleshooting

### Common Issues

**1. "502 Bad Gateway"**
- Check if backend is running: `pm2 status`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify backend health: `curl http://localhost:3001/health`

**2. Database Connection Errors**
- Verify environment variables are loaded
- Check Supabase connection limits
- Test connection: `curl http://localhost:3001/api/test`

**3. CORS Errors**
- Verify FRONTEND_URL in environment
- Check CORS_ORIGINS configuration
- Ensure domain matches exactly

**4. SSL Certificate Issues**
- Renew certificate: `sudo certbot renew`
- Check certificate validity: `openssl x509 -in /path/to/cert -text -noout`

### Health Checks

**Application health:**
```bash
# Backend health
curl https://yourdomain.com/health

# Database connectivity
curl https://yourdomain.com/api/test

# Frontend loading
curl -I https://yourdomain.com
```

### Log Locations

- **Application logs:** `pm2 logs kanban-app`
- **Nginx access:** `/var/log/nginx/access.log`
- **Nginx error:** `/var/log/nginx/error.log`
- **System logs:** `/var/log/syslog`

## Security Checklist

- [ ] Change default admin password
- [ ] Generate secure JWT and session secrets
- [ ] Enable SSL certificate
- [ ] Configure firewall (ufw)
- [ ] Set up fail2ban for SSH protection
- [ ] Regular security updates
- [ ] Monitor failed login attempts
- [ ] Set up intrusion detection

## Cost Optimization

**Free Tier Options:**
- **Frontend:** Vercel (100GB bandwidth/month)
- **Backend:** Railway ($5/month after free trial)
- **Database:** Supabase (500MB/2 weeks)
- **Domain:** Freenom (free domains) or Namecheap (~$10/year)
- **SSL:** Let's Encrypt (free)

**Total Monthly Cost:** ~$5-15/month for a production-ready application!

---

Your Kanban application is now ready for production deployment with enterprise-grade security, monitoring, and scalability! 🎉