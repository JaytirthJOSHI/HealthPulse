# HealthPulse API Documentation

## Overview

HealthPulse is a comprehensive health monitoring platform that provides real-time disease tracking, AI-powered health consultations, and predictive analytics. This API is built on Cloudflare Workers and serves as the backend for the HealthPulse frontend application.

**Base URL:** `https://healthpulse-api.healthsathi.workers.dev`

**Phone AI System:** `+1 7703620543`

## Authentication

Currently, the API does not require authentication for most endpoints. However, it's recommended to implement proper authentication for production use.

## CORS

The API supports Cross-Origin Resource Sharing (CORS) with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Endpoints

### 1. Health Check

**GET** `/health`

Check the API service status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "HealthPulse Backend (Cloudflare Workers)",
  "environment": "production",
  "phoneAISystem": "+1 7703620543"
}
```

---

### 2. Symptom Reports

#### Create Report

**POST** `/api/reports`

Submit a new symptom report.

**Request Body:**
```json
{
  "nickname": "string",
  "country": "string",
  "pinCode": "string",
  "symptoms": ["string"],
  "illnessType": "string",
  "severity": "mild|moderate|severe",
  "latitude": "number",
  "longitude": "number",
  "phoneNumber": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "demo-12345",
    "nickname": "JohnDoe",
    "country": "United States",
    "pin_code": "12345",
    "symptoms": ["Fever", "Cough"],
    "illness_type": "flu",
    "severity": "moderate",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "phone_number": "+1234567890",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Get Reports

**GET** `/api/reports`

Retrieve all symptom reports.

**Response:**
```json
[
  {
    "id": "demo-12345",
    "nickname": "JohnDoe",
    "country": "United States",
    "pin_code": "12345",
    "symptoms": ["Fever", "Cough"],
    "illness_type": "flu",
    "severity": "moderate",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### 3. Health Aggregates

#### Get Health Aggregates

**GET** `/api/health-aggregates`

Get aggregated health statistics and metrics.

**Response:**
```json
[
  {
    "metric": "total_reports",
    "value": 28189
  },
  {
    "metric": "total_users",
    "value": 28189
  },
  {
    "metric": "reports_in_last_24h",
    "value": 0
  },
  {
    "metric": "active_countries",
    "value": 19
  },
  {
    "metric": "most_reported_illness",
    "value": "flu"
  },
  {
    "metric": "top_illnesses",
    "value": [
      {"type": "flu", "count": 12233},
      {"type": "covid", "count": 5391},
      {"type": "dengue", "count": 3456}
    ]
  }
]
```

---

### 4. WHO Data

#### Get WHO Data

**GET** `/api/who-data`

Retrieve World Health Organization statistics and data.

**Response:**
```json
{
  "global_stats": {
    "total_cases": 1234567,
    "active_cases": 98765,
    "recovered": 1111111,
    "deaths": 23456
  },
  "disease_breakdown": {
    "covid": {
      "cases": 456789,
      "deaths": 12345,
      "recovery_rate": 0.95
    },
    "flu": {
      "cases": 567890,
      "deaths": 2345,
      "recovery_rate": 0.98
    }
  },
  "regional_data": [
    {
      "region": "Americas",
      "cases": 345678,
      "deaths": 8901
    }
  ]
}
```

---

### 5. Health Tips

#### Get Health Tips

**GET** `/api/health-tips`

Retrieve health tips and recommendations.

**Response:**
```json
[
  {
    "id": "tip-1",
    "title": "Stay Hydrated",
    "content": "Drink at least 8 glasses of water daily to maintain good health.",
    "category": "general",
    "symptoms": ["dehydration", "fatigue"],
    "severity": "mild"
  },
  {
    "id": "tip-2",
    "title": "Rest When Sick",
    "content": "Get adequate rest to help your body fight off illness.",
    "category": "recovery",
    "symptoms": ["fever", "fatigue"],
    "severity": "moderate"
  }
]
```

---

### 6. Diseases

#### Get Diseases

**GET** `/api/diseases`

Retrieve information about various diseases.

**Response:**
```json
[
  {
    "id": "disease-1",
    "name": "Influenza",
    "symptoms": ["Fever", "Cough", "Fatigue", "Body aches"],
    "severity_levels": ["mild", "moderate", "severe"],
    "treatment": "Rest, fluids, over-the-counter medications",
    "prevention": "Annual flu vaccine, good hygiene"
  },
  {
    "id": "disease-2",
    "name": "COVID-19",
    "symptoms": ["Fever", "Cough", "Loss of taste", "Shortness of breath"],
    "severity_levels": ["mild", "moderate", "severe"],
    "treatment": "Rest, isolation, medical care if severe",
    "prevention": "Vaccination, masks, social distancing"
  }
]
```

---

### 7. Regions

#### Get Regions

**GET** `/api/regions`

Retrieve geographical region data.

**Response:**
```json
[
  {
    "id": "region-1",
    "name": "North America",
    "countries": ["United States", "Canada", "Mexico"],
    "population": 579000000,
    "health_metrics": {
      "avg_life_expectancy": 79.2,
      "healthcare_access": 0.85
    }
  },
  {
    "id": "region-2",
    "name": "Europe",
    "countries": ["Germany", "France", "United Kingdom"],
    "population": 746000000,
    "health_metrics": {
      "avg_life_expectancy": 81.1,
      "healthcare_access": 0.92
    }
  }
]
```

---

### 8. Phone AI Integration

#### Voice Symptom Report

**POST** `/api/phone-ai/voice-report`

Submit a voice-based symptom report through the phone AI system.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "voiceMessage": "I have a fever and cough",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "country": "United States"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "voice-report-12345",
    "transcription": "I have a fever and cough",
    "analysis": {
      "symptoms": ["Fever", "Cough"],
      "severity": "moderate",
      "recommendations": ["Rest", "Stay hydrated", "Monitor symptoms"]
    },
    "followUp": {
      "scheduled": true,
      "nextCall": "2024-01-16T10:30:00.000Z"
    }
  }
}
```

#### Health Consultation

**POST** `/api/phone-ai/health-consultation`

Request an AI-powered health consultation.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "symptoms": ["Fever", "Cough", "Fatigue"],
  "duration": "3 days",
  "severity": "moderate",
  "medicalHistory": "No chronic conditions",
  "currentMedications": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "consultationId": "consult-12345",
    "diagnosis": {
      "likelyCondition": "Upper respiratory infection",
      "confidence": 0.85,
      "differentialDiagnosis": ["Common cold", "Flu", "COVID-19"]
    },
    "recommendations": [
      "Rest and stay hydrated",
      "Take over-the-counter fever reducers",
      "Monitor for worsening symptoms",
      "Consider COVID-19 test if symptoms persist"
    ],
    "followUp": {
      "timeline": "48-72 hours",
      "warningSigns": ["Difficulty breathing", "High fever", "Chest pain"]
    }
  }
}
```

#### Send Notification

**POST** `/api/phone-ai/send-notification`

Send a health notification via phone.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "message": "Your health check is due. Please call for consultation.",
  "type": "reminder",
  "priority": "normal"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notificationId": "notif-12345",
    "status": "sent",
    "deliveryTime": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Emergency Alert

**POST** `/api/phone-ai/emergency-alert`

Send an emergency health alert.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "emergencyType": "severe_symptoms",
  "symptoms": ["Chest pain", "Difficulty breathing"],
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, New York, NY"
  },
  "severity": "critical"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "alertId": "emergency-12345",
    "status": "sent",
    "escalationLevel": "immediate",
    "actions": [
      "Emergency services notified",
      "Nearest hospital contacted",
      "Family members alerted"
    ]
  }
}
```

#### Get Phone Health Status

**GET** `/api/phone-ai/health-status`

Get the current health status for a phone number.

**Query Parameters:**
- `phoneNumber` (required): The phone number to check

**Response:**
```json
{
  "success": true,
  "data": {
    "phoneNumber": "+1234567890",
    "healthScore": 75,
    "lastReport": "2024-01-15T10:30:00.000Z",
    "activeConditions": ["Upper respiratory infection"],
    "recommendations": [
      "Continue rest and hydration",
      "Monitor fever",
      "Follow up in 48 hours"
    ],
    "riskLevel": "low",
    "nextCheckIn": "2024-01-16T10:30:00.000Z"
  }
}
```

---

### 9. Predictive Analytics

#### Outbreak Prediction

**GET** `/api/analytics/outbreak-prediction`

Get AI-powered outbreak predictions.

**Query Parameters:**
- `region` (optional): Specific region to analyze
- `disease` (optional): Specific disease to predict
- `timeframe` (optional): Prediction timeframe (7d, 30d, 90d)

**Response:**
```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "disease": "flu",
        "region": "North America",
        "predictedCases": 12500,
        "confidence": 0.87,
        "timeframe": "30d",
        "riskFactors": [
          "Seasonal patterns",
          "Vaccination rates",
          "Weather conditions"
        ],
        "recommendations": [
          "Increase vaccination campaigns",
          "Monitor high-risk areas",
          "Prepare healthcare resources"
        ]
      }
    ],
    "modelInfo": {
      "version": "1.2.0",
      "lastUpdated": "2024-01-15T10:30:00.000Z",
      "accuracy": 0.89
    }
  }
}
```

#### Health Trends

**GET** `/api/analytics/health-trends`

Get health trend analysis.

**Query Parameters:**
- `metric` (optional): Specific metric to analyze
- `period` (optional): Analysis period (7d, 30d, 90d, 1y)

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "metric": "flu_cases",
        "trend": "increasing",
        "change": 15.5,
        "period": "30d",
        "dataPoints": [
          {"date": "2024-01-01", "value": 100},
          {"date": "2024-01-15", "value": 115}
        ]
      }
    ],
    "insights": [
      "Flu cases are 15.5% higher than last month",
      "Peak season expected in February",
      "Vaccination rates below target"
    ]
  }
}
```

#### Risk Assessment

**POST** `/api/analytics/risk-assessment`

Perform a personalized health risk assessment.

**Request Body:**
```json
{
  "age": 35,
  "gender": "male",
  "location": {
    "country": "United States",
    "region": "Northeast"
  },
  "symptoms": ["Fever", "Cough"],
  "medicalHistory": ["Asthma"],
  "lifestyle": {
    "smoking": false,
    "exercise": "moderate",
    "diet": "balanced"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "riskScore": 0.25,
    "riskLevel": "moderate",
    "factors": [
      {
        "factor": "Asthma history",
        "impact": "increases risk",
        "weight": 0.3
      },
      {
        "factor": "Current symptoms",
        "impact": "requires monitoring",
        "weight": 0.4
      }
    ],
    "recommendations": [
      "Monitor symptoms closely",
      "Consider medical consultation",
      "Avoid triggers",
      "Follow asthma action plan"
    ],
    "followUp": {
      "timeline": "24-48 hours",
      "actions": ["Check symptoms", "Contact doctor if worsening"]
    }
  }
}
```

#### Seasonal Patterns

**GET** `/api/analytics/seasonal-patterns`

Get seasonal health pattern analysis.

**Query Parameters:**
- `disease` (optional): Specific disease to analyze
- `region` (optional): Specific region to analyze

**Response:**
```json
{
  "success": true,
  "data": {
    "patterns": [
      {
        "disease": "flu",
        "season": "winter",
        "peakMonths": ["December", "January", "February"],
        "averageCases": 15000,
        "trend": "seasonal",
        "factors": [
          "Cold weather",
          "Indoor gatherings",
          "Holiday travel"
        ]
      }
    ],
    "predictions": {
      "nextPeak": "February 2024",
      "expectedCases": 18000,
      "confidence": 0.82
    }
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

Currently, the API does not implement rate limiting. However, it's recommended to implement appropriate rate limiting for production use.

## Data Storage

The API currently uses in-memory storage for demonstration purposes. In production, it should be configured to use Cloudflare KV or D1 for persistent data storage.

## Demo Data

The API includes comprehensive demo data with:
- 28,000+ symptom reports from 19 countries
- Realistic geographical distribution
- Seasonal disease patterns
- Various illness types and severities

## Phone AI Integration

The phone AI system (`+1 7703620543`) provides:
- Voice-based symptom reporting
- AI-powered health consultations
- Automated notifications and alerts
- Emergency response coordination

## Predictive Analytics

The analytics system uses AI models to provide:
- Outbreak predictions
- Health trend analysis
- Personalized risk assessments
- Seasonal pattern recognition

## Support

For technical support or questions about the API, please contact the development team or refer to the project documentation.

---

*Last updated: January 2024*
*API Version: 1.0*