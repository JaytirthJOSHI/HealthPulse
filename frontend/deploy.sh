#!/bin/bash

# HealthPulse Frontend Deployment Script
# Deploys to pulse.health-sathi.org

echo "🚀 Starting HealthPulse Frontend Deployment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if logged in to Cloudflare
echo "🔐 Checking Cloudflare login..."
wrangler whoami

if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Cloudflare. Please run: wrangler login"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
wrangler pages deploy build --project-name=healthpulse-frontend

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app should be available at: https://pulse.health-sathi.org"
    echo ""
    echo "📝 Next steps:"
    echo "1. Configure custom domain in Cloudflare Dashboard"
    echo "2. Set environment variables if not already done:"
    echo "   - REACT_APP_SUPABASE_URL"
    echo "   - REACT_APP_SUPABASE_ANON_KEY"
    echo "3. Test the application"
else
    echo "❌ Deployment failed!"
    exit 1
fi 