# HealthPulse Documentation

This directory contains comprehensive documentation for the HealthPulse health monitoring platform.

## 📚 Documentation Files

### API Documentation
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with all endpoints, request/response formats, and examples
- **[API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md)** - Quick reference guide with common use cases and code examples
- **[HealthPulse_API.postman_collection.json](./HealthPulse_API.postman_collection.json)** - Postman collection for easy API testing

### Setup & Deployment
- **[SETUP.md](../SETUP.md)** - Complete setup instructions for development environment
- **[DEPLOYMENT.md](../DEPLOYMENT.md)** - Deployment guide for production environment
- **[CLOUDFLARE_DEPLOYMENT.md](../CLOUDFLARE_DEPLOYMENT.md)** - Cloudflare Workers deployment guide

### Security & Configuration
- **[SECURITY.md](../SECURITY.md)** - Security considerations and best practices
- **[GITIGNORE_SETUP.md](../GITIGNORE_SETUP.md)** - Git configuration guide

## 🚀 Quick Start

### API Base URL
```
https://healthpulse-api.healthsathi.workers.dev
```

### Health Check
```bash
curl https://healthpulse-api.healthsathi.workers.dev/health
```

### Get All Reports
```bash
curl https://healthpulse-api.healthsathi.workers.dev/api/reports
```

## 📋 API Endpoints Overview

### Core Endpoints
- `GET /health` - Health check
- `GET /api/reports` - Get all symptom reports
- `POST /api/reports` - Create new symptom report
- `GET /api/health-aggregates` - Get health statistics
- `GET /api/who-data` - Get WHO statistics
- `GET /api/health-tips` - Get health tips
- `GET /api/diseases` - Get disease information
- `GET /api/regions` - Get regional data

### Phone AI Integration
- `POST /api/phone-ai/voice-report` - Submit voice symptom report
- `POST /api/phone-ai/health-consultation` - Request AI consultation
- `POST /api/phone-ai/send-notification` - Send health notification
- `POST /api/phone-ai/emergency-alert` - Send emergency alert
- `GET /api/phone-ai/health-status` - Get phone health status

### Predictive Analytics
- `GET /api/analytics/outbreak-prediction` - Get outbreak predictions
- `GET /api/analytics/health-trends` - Get health trends
- `POST /api/analytics/risk-assessment` - Perform risk assessment
- `GET /api/analytics/seasonal-patterns` - Get seasonal patterns

## 🛠️ Development Tools

### Postman Collection
Import the `HealthPulse_API.postman_collection.json` file into Postman for easy API testing with pre-configured requests.

### Code Examples
The API documentation includes examples in:
- JavaScript (fetch API)
- Python (requests library)
- cURL commands

## 📊 Demo Data

The API includes comprehensive demo data:
- **28,000+ symptom reports** from 19 countries
- **Realistic geographical distribution** with coordinates
- **Seasonal disease patterns** for various illnesses
- **Multiple illness types** (flu, COVID-19, dengue, typhoid, etc.)
- **Various severity levels** (mild, moderate, severe)

## 📞 Phone AI System

**Phone Number:** `+1 7703620543`

Features:
- Voice-based symptom reporting
- AI-powered health consultations
- Automated notifications and alerts
- Emergency response coordination

## 🔧 Technical Details

### Architecture
- **Backend:** Cloudflare Workers (TypeScript)
- **Frontend:** React with TypeScript
- **Storage:** In-memory (demo) / Cloudflare KV (production)
- **AI Integration:** Hack Club AI for predictive analytics

### CORS Support
The API supports Cross-Origin Resource Sharing with:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

### Response Format
All API responses follow a consistent format:
```json
{
  "success": true,
  "data": { ... }
}
```

## 📈 Features

### Real-time Health Monitoring
- Global disease outbreak tracking
- Interactive health map
- Real-time symptom reporting
- Community health insights

### AI-Powered Analytics
- Outbreak predictions
- Health trend analysis
- Personalized risk assessments
- Seasonal pattern recognition

### Phone Integration
- Voice symptom reporting
- AI health consultations
- Automated notifications
- Emergency alerts

### Comprehensive Data
- WHO statistics integration
- Regional health metrics
- Disease information database
- Health tips and recommendations

## 🤝 Support

For technical support or questions:
1. Check the detailed API documentation
2. Review the setup and deployment guides
3. Use the Postman collection for testing
4. Contact the development team

## 📝 Contributing

When contributing to the documentation:
1. Keep examples up to date with API changes
2. Include both success and error scenarios
3. Provide code examples in multiple languages
4. Update the Postman collection for new endpoints

---

*Last updated: July 2025*
*Documentation Version: 1.0* 