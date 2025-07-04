# 🚀 Cloudflare Deployment Guide for HealthPulse

## 📋 **Overview**

This guide will help you deploy HealthPulse to Cloudflare:
- **Frontend**: Cloudflare Pages (React app)
- **Backend**: Cloudflare Workers (API)
- **Database**: Supabase (already configured)

## 🛠️ **Prerequisites**

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install Cloudflare's CLI tool
3. **Supabase Project**: Your existing Supabase setup
4. **Git Repository**: Your HealthPulse code on GitHub

## 📦 **Install Wrangler CLI**

```bash
npm install -g wrangler
```

## 🔐 **Login to Cloudflare**

```bash
wrangler login
```

## 🏗️ **Step 1: Deploy Backend (Cloudflare Workers)**

### **1.1 Navigate to Backend Directory**
```bash
cd backend
```

### **1.2 Install Dependencies**
```bash
npm install
```

### **1.3 Configure Environment Variables**
```bash
wrangler secret put SUPABASE_URL
# Enter your Supabase URL when prompted

wrangler secret put SUPABASE_ANON_KEY
# Enter your Supabase anon key when prompted

wrangler secret put FRONTEND_URL
# Enter your frontend URL (will be set after frontend deployment)
```

### **1.4 Deploy the Worker**
```bash
wrangler deploy
```

**Note**: The first deployment will create a new Worker. Note the URL provided (e.g., `https://healthpulse-backend.your-subdomain.workers.dev`)

## 🌐 **Step 2: Deploy Frontend (Cloudflare Pages)**

### **2.1 Update Environment Variables**

Update your `frontend/.env` file with the Worker URL:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Socket.io Server URL (use the Worker URL)
REACT_APP_SOCKET_URL=https://healthpulse-backend.your-subdomain.workers.dev

# Optional: Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### **2.2 Deploy via Cloudflare Dashboard**

1. **Go to Cloudflare Dashboard**
   - Visit [dash.cloudflare.com](https://dash.cloudflare.com)
   - Click "Pages" in the sidebar

2. **Create New Project**
   - Click "Create a project"
   - Choose "Connect to Git"
   - Select your HealthPulse repository

3. **Configure Build Settings**
   - **Framework preset**: Create React App
   - **Build command**: `npm run build`
   - **Build output directory**: `build`
   - **Root directory**: `frontend`

4. **Set Environment Variables**
   - Click "Environment variables"
   - Add the following:
     ```
     REACT_APP_SUPABASE_URL=your_supabase_url
     REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
     REACT_APP_SOCKET_URL=https://healthpulse-backend.your-subdomain.workers.dev
     ```

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for the build to complete

## 🔧 **Step 3: Update Backend with Frontend URL**

Once your frontend is deployed, update the backend Worker:

```bash
cd backend
wrangler secret put FRONTEND_URL
# Enter your frontend URL (e.g., https://healthpulse-frontend.pages.dev)
wrangler deploy
```

## 🗄️ **Step 4: Run Database Schema**

1. **Go to Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Open your HealthPulse project

2. **Open SQL Editor**
   - Click "SQL Editor" in the sidebar
   - Click "New query"

3. **Run the Schema**
   - Copy the entire contents of `supabase/schema.sql`
   - Paste it into the SQL Editor
   - Click "Run"

## 🧪 **Step 5: Test Your Deployment**

### **Test Backend**
```bash
curl https://healthpulse-backend.your-subdomain.workers.dev/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "HealthPulse Backend (Cloudflare Workers)",
  "environment": "production"
}
```

### **Test Frontend**
Visit your frontend URL and test:
- Health Map loading
- Symptom reporting
- Disease information page
- Real-time updates

## 🔄 **Step 6: Set Up Continuous Deployment**

### **Automatic Deployments**
Both Cloudflare Pages and Workers will automatically redeploy when you push to your main branch.

### **Custom Domains (Optional)**
1. **Frontend**: In Cloudflare Pages settings, add your custom domain
2. **Backend**: In Cloudflare Workers settings, add your custom domain

## 📊 **Monitoring & Analytics**

### **Cloudflare Analytics**
- **Pages**: View page views, performance metrics
- **Workers**: Monitor API calls, errors, performance

### **Supabase Dashboard**
- Monitor database usage
- View real-time logs
- Check API performance

## 🚨 **Troubleshooting**

### **Common Issues**

1. **CORS Errors**
   - Ensure `FRONTEND_URL` is set correctly in Worker secrets
   - Check that CORS headers are being sent

2. **Build Failures**
   - Check build logs in Cloudflare Pages
   - Ensure all dependencies are in `package.json`

3. **API Errors**
   - Check Worker logs in Cloudflare dashboard
   - Verify Supabase credentials are correct

4. **Database Connection Issues**
   - Ensure Supabase project is active
   - Check RLS policies are configured correctly

### **Debug Commands**

```bash
# Test Worker locally
wrangler dev

# View Worker logs
wrangler tail

# Update Worker
wrangler deploy

# View Pages deployment status
wrangler pages deployment list
```

## 🎉 **Deployment Complete!**

Your HealthPulse application is now live on Cloudflare with:
- ✅ **Global CDN**: Fast loading worldwide
- ✅ **Edge Computing**: Low-latency API responses
- ✅ **Automatic Scaling**: Handles traffic spikes
- ✅ **SSL/TLS**: Secure connections
- ✅ **DDoS Protection**: Built-in security

### **Your URLs**
- **Frontend**: `https://healthpulse-frontend.pages.dev`
- **Backend**: `https://healthpulse-backend.your-subdomain.workers.dev`
- **Database**: Your Supabase project

### **Next Steps**
1. Test all features thoroughly
2. Set up monitoring alerts
3. Configure custom domains (optional)
4. Set up analytics tracking

## 📈 **Performance Benefits**

- **Global Edge Network**: 200+ locations worldwide
- **Automatic Caching**: Faster subsequent requests
- **Zero Cold Starts**: Workers are always ready
- **Built-in Security**: DDoS protection, WAF, SSL
- **Cost Effective**: Pay only for what you use

Your HealthPulse application is now production-ready and globally accessible! 🌍 