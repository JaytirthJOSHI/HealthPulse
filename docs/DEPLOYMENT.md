# 🚀 HealthPulse Deployment Guide

## **Backend Deployment to api.pulse.health-sathi.org**

### **Prerequisites**
1. Cloudflare account with Workers enabled
2. Domain `health-sathi.org` managed by Cloudflare
3. Supabase project with database setup

### **Step 1: Install Wrangler CLI**
```bash
npm install -g wrangler
```

### **Step 2: Login to Cloudflare**
```bash
wrangler login
```

### **Step 3: Set Environment Variables**
```bash
# Set Supabase credentials
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
```

### **Step 4: Deploy to Production**
```bash
cd backend
wrangler deploy --env production
```

### **Step 5: Configure Custom Domain**

1. **In Cloudflare Dashboard:**
   - Go to Workers & Pages
   - Select your `healthpulse-api` worker
   - Go to Settings → Triggers
   - Add Custom Domain: `api.pulse.health-sathi.org`

2. **DNS Configuration:**
   - The domain should automatically be configured
   - Verify CNAME record points to your worker

### **Step 6: Test the API**
```bash
# Health check
curl https://api.pulse.health-sathi.org/health

# Test symptom report
curl -X POST https://api.pulse.health-sathi.org/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "TestUser",
    "country": "India",
    "pinCode": "400001",
    "symptoms": ["fever", "cough"],
    "illnessType": "respiratory",
    "severity": "moderate",
    "latitude": 19.0760,
    "longitude": 72.8777
  }'
```

## **Frontend Deployment to pulse.health-sathi.org**

### **Prerequisites**
1. Cloudflare account with Pages enabled
2. Domain `health-sathi.org` managed by Cloudflare
3. Supabase project with database setup

### **Step 1: Install Wrangler CLI (if not already installed)**
```bash
npm install -g wrangler
```

### **Step 2: Login to Cloudflare (if not already logged in)**
```bash
wrangler login
```

### **Step 3: Configure Frontend for Deployment**
The frontend is already configured with:
- `wrangler.toml` for Cloudflare Pages configuration
- `_redirects` file for client-side routing
- Build scripts in `package.json`

### **Step 4: Set Environment Variables**
```bash
# Set Supabase credentials for frontend
wrangler pages secret put REACT_APP_SUPABASE_URL --project-name=healthpulse-frontend
wrangler pages secret put REACT_APP_SUPABASE_ANON_KEY --project-name=healthpulse-frontend
```

**Note:** The frontend now uses Supabase real-time instead of Socket.IO, so `REACT_APP_SOCKET_URL` is no longer needed.

### **Step 5: Deploy to Production**
```bash
cd frontend
npm run deploy
```

### **Step 6: Configure Custom Domain**

1. **In Cloudflare Dashboard:**
   - Go to Workers & Pages
   - Select your `healthpulse-frontend` project
   - Go to Settings → Custom domains
   - Add Custom Domain: `pulse.health-sathi.org`

2. **DNS Configuration:**
   - The domain should automatically be configured
   - Verify CNAME record points to your Pages project

### **Step 7: Test the Frontend**
Visit `https://pulse.health-sathi.org` to verify:
- Homepage loads correctly
- Navigation works
- API calls to backend succeed
- Real-time features work

### **Alternative: Manual Deployment via Cloudflare Dashboard**

1. **Build the Project:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to Cloudflare Pages:**
   - Go to Cloudflare Dashboard → Pages
   - Create new project: `healthpulse-frontend`
   - Upload the `build` folder
   - Set environment variables in the dashboard

3. **Configure Custom Domain:**
   - Add `pulse.health-sathi.org` as custom domain
   - Configure DNS settings

## **API Endpoints**

### **Health Check**
```
GET https://api.pulse.health-sathi.org/health
```

### **Symptom Reports**
```
POST https://api.pulse.health-sathi.org/api/reports
GET https://api.pulse.health-sathi.org/api/reports
```

### **Health Tips**
```
GET https://api.pulse.health-sathi.org/api/health-tips
```

### **Disease Risk Analysis**
```
GET https://api.pulse.health-sathi.org/api/disease-risk?pinCode=400001
```

### **Diseases & Regions**
```
GET https://api.pulse.health-sathi.org/api/diseases
GET https://api.pulse.health-sathi.org/api/regions
```

### **Health Aggregates**
```
GET https://api.pulse.health-sathi.org/api/aggregates
```

## **Environment Variables**

### **Backend (Cloudflare Workers)**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

### **Frontend (Cloudflare Pages)**
- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key

**Note:** Real-time features are handled by Supabase real-time subscriptions, no additional WebSocket configuration needed.

## **Monitoring & Logs**

### **View Worker Logs**
```bash
wrangler tail --env production
```

### **Monitor Performance**
- Cloudflare Analytics dashboard
- Real-time metrics in Workers dashboard

## **Troubleshooting**

### **Common Issues**

1. **CORS Errors:**
   - Verify CORS headers in worker.js
   - Check frontend domain is allowed

2. **Environment Variables:**
   - Ensure secrets are set correctly
   - Check variable names match exactly

3. **Domain Issues:**
   - Verify DNS propagation
   - Check Cloudflare proxy status

4. **Supabase Connection:**
   - Test database connection
   - Verify RLS policies

### **Debug Commands**
```bash
# Test worker locally
wrangler dev

# Check worker status
wrangler whoami

# View worker info
wrangler info --env production
```

## **Security Considerations**

1. **CORS Configuration:**
   - Restrict origins in production
   - Use specific domains instead of wildcards

2. **Rate Limiting:**
   - Implement rate limiting for API endpoints
   - Use Cloudflare's built-in protection

3. **Environment Variables:**
   - Never commit secrets to version control
   - Use Cloudflare's secret management

4. **Input Validation:**
   - Validate all API inputs
   - Sanitize user data

## **Performance Optimization**

1. **Caching:**
   - Implement response caching
   - Use Cloudflare's edge caching

2. **Database Queries:**
   - Optimize Supabase queries
   - Use indexes for frequently accessed data

3. **Bundle Size:**
   - Minimize worker bundle size
   - Remove unused dependencies

## **Backup & Recovery**

1. **Database Backups:**
   - Enable Supabase automated backups
   - Test restore procedures

2. **Code Deployment:**
   - Use staging environment for testing
   - Implement rollback procedures

## **Support**

For issues or questions:
1. Check Cloudflare documentation
2. Review Supabase guides
3. Check application logs
4. Test endpoints individually 