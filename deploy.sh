#!/bin/bash

# Kanban Application Deployment Script
# Make sure to run: chmod +x deploy.sh

set -e

echo "🚀 Starting Kanban Application Deployment..."

# Configuration
DOMAIN=${1:-"your-domain.com"}
ENVIRONMENT=${2:-"production"}

echo "📋 Domain: $DOMAIN"
echo "🌍 Environment: $ENVIRONMENT"

# Update environment files with domain
echo "📝 Updating configuration for domain: $DOMAIN"
sed -i.bak "s/your-domain.com/$DOMAIN/g" .env.production
sed -i.bak "s/your-domain.com/$DOMAIN/g" nginx.conf

# Build the application
echo "🔨 Building application..."
npm run build

# Create production-ready server
echo "🔧 Preparing server files..."
cp -r server server-prod
find server-prod -name "*.js" -exec mv {} {}.bak \;
for file in server-prod/**/*.js.bak; do 
    mv "$file" "${file%.bak}.cjs"
done

# Update require statements for production
echo "📦 Updating module imports..."
find server-prod -name "*.cjs" -exec sed -i.bak "s/require('\.\/\([^']*\)')/require('.\/\1.cjs')/g" {} \;
find server-prod -name "*.cjs" -exec sed -i.bak "s/require('\.\.\/\([^']*\)')/require('..\/\1.cjs')/g" {} \;

# Clean up backup files
find server-prod -name "*.bak" -delete

echo "✅ Build completed successfully!"

# Deployment options
echo ""
echo "🎯 Choose your deployment method:"
echo "1. Docker Compose (Recommended)"
echo "2. Manual VPS deployment"
echo "3. Vercel (Frontend) + Railway/Heroku (Backend)"
echo "4. AWS/DigitalOcean with load balancer"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🐳 Docker Compose Deployment"
        echo "Run: docker-compose up -d"
        ;;
    2)
        echo "🖥️ Manual VPS Deployment"
        echo "1. Copy files to your VPS"
        echo "2. Install Node.js and Nginx"
        echo "3. Run: npm install --production"
        echo "4. Run: pm2 start server-prod/app.cjs"
        echo "5. Configure Nginx with the provided config"
        ;;
    3)
        echo "☁️ Cloud Platform Deployment"
        echo "Frontend (Vercel):"
        echo "1. Connect your GitHub repo to Vercel"
        echo "2. Set build command: npm run build"
        echo "3. Set output directory: dist"
        echo ""
        echo "Backend (Railway):"
        echo "1. Connect repo to Railway"
        echo "2. Set start command: node server/app.cjs"
        echo "3. Add environment variables from .env.production"
        ;;
    4)
        echo "🏗️ Enterprise Deployment"
        echo "Use the provided Docker configuration with:"
        echo "- AWS ECS/EKS or DigitalOcean Kubernetes"
        echo "- Application Load Balancer"
        echo "- CloudFlare for CDN and security"
        ;;
esac

echo ""
echo "📋 Next Steps:"
echo "1. Update DNS records to point to your server"
echo "2. Obtain SSL certificate (Let's Encrypt recommended)"
echo "3. Update .env.production with actual domain and secrets"
echo "4. Test the deployment"
echo ""
echo "🔐 Security Reminders:"
echo "- Change default admin password"
echo "- Generate secure JWT secrets"
echo "- Enable firewall rules"
echo "- Set up monitoring and backups"

echo ""
echo "✨ Deployment preparation complete!"