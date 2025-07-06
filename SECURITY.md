# Security Guide - HealthPulse

This document outlines the security measures implemented in the HealthPulse project to protect sensitive data and credentials.

## 🔒 Environment Variables Protection

### What's Protected
All `.env` files containing sensitive data are **explicitly ignored** by git to prevent accidental commits of credentials.

### Protected Files
- `frontend/.env` - Frontend environment variables
- `backend/.env` - Backend environment variables  
- `scripts/.env` - Script environment variables
- Any `.env.local`, `.env.development.local`, `.env.test.local`, `.env.production.local`

### What's Tracked (Safe)
- `frontend/env.example` - Example template for frontend
- `backend/env.example` - Example template for backend
- `scripts/.env.example` - Example template for scripts

## 🛡️ Git Ignore Configuration

### Root Level Protection
The main `.gitignore` file protects:
- All `.env*` files
- `node_modules/` directories
- Build artifacts
- IDE files
- OS generated files
- Log files
- Cache directories

### Directory-Specific Protection
Each directory has its own `.gitignore`:
- `frontend/.gitignore` - React-specific ignores
- `backend/.gitignore` - Node.js-specific ignores
- `scripts/.gitignore` - Script-specific ignores with extra data protection

## 🔐 Sensitive Data Handling

### Supabase Credentials
- **URL**: `https://xchwpafqmkfheyxuvtij.supabase.co`
- **Anon Key**: Stored in `.env` files only
- **Database Password**: Stored in `.env` files only

### API Keys
- Google Maps API Key (optional)
- Any other third-party service keys

## 📋 Security Checklist

### Before Committing
- [ ] No `.env` files are staged
- [ ] No credentials in code comments
- [ ] No hardcoded API keys
- [ ] No database passwords in source code

### Before Sharing Code
- [ ] All `.env` files are in `.gitignore`
- [ ] Example files don't contain real credentials
- [ ] No sensitive data in commit history

### Before Deployment
- [ ] Environment variables are set in deployment platform
- [ ] Production credentials are different from development
- [ ] Database connections use environment variables

## 🚨 Security Best Practices

### For Developers
1. **Never commit `.env` files**
2. **Use example files for templates**
3. **Rotate credentials regularly**
4. **Use different credentials for dev/staging/prod**
5. **Monitor for accidental credential exposure**

### For Deployment
1. **Set environment variables in deployment platform**
2. **Use secrets management services**
3. **Restrict database access by IP**
4. **Enable SSL/TLS for all connections**
5. **Regular security audits**

## 🔍 Verification Commands

### Check for Untracked .env Files
```bash
git status --porcelain | grep ".env"
```

### Check for Tracked .env Files
```bash
git ls-files | grep -E "\.env$"
```

### List All Environment Files
```bash
find . -name ".env*" -type f
```

## 📞 Security Contacts

If you discover a security vulnerability:
1. **DO NOT** create a public issue
2. **DO** contact the project maintainer privately
3. **DO** provide detailed information about the vulnerability
4. **DO** allow time for assessment and fix

## 🔄 Credential Rotation

### When to Rotate
- After any suspected compromise
- Quarterly as a best practice
- When team members leave
- After deployment to new environments

### How to Rotate
1. Generate new credentials in Supabase dashboard
2. Update all `.env` files
3. Update deployment environment variables
4. Test all functionality
5. Remove old credentials from Supabase

## 📚 Additional Resources

- [Supabase Security Documentation](https://supabase.com/docs/guides/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://reactjs.org/docs/security.html)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/) 