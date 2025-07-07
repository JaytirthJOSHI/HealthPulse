# HealthPulse API Quick Reference

## Base URL
```
https://healthpulse-api.healthsathi.workers.dev
```

## Common Endpoints

### Health Check
```bash
curl https://healthpulse-api.healthsathi.workers.dev/health
```

### Get All Reports
```bash
curl https://healthpulse-api.healthsathi.workers.dev/api/reports
```

### Create a Report
```bash
curl -X POST https://healthpulse-api.healthsathi.workers.dev/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "JohnDoe",
    "country": "United States",
    "pinCode": "12345",
    "symptoms": ["Fever", "Cough"],
    "illnessType": "flu",
    "severity": "moderate",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

### Get Health Aggregates
```bash
curl https://healthpulse-api.healthsathi.workers.dev/api/health-aggregates
```

### Get WHO Data
```bash
curl https://healthpulse-api.healthsathi.workers.dev/api/who-data
```

### Get Health Tips
```bash
curl https://healthpulse-api.healthsathi.workers.dev/api/health-tips
```

### Get Diseases Info
```bash
curl https://healthpulse-api.healthsathi.workers.dev/api/diseases
```

### Get Regions Data
```bash
curl https://healthpulse-api.healthsathi.workers.dev/api/regions
```

## Phone AI Endpoints

### Voice Symptom Report
```bash
curl -X POST https://healthpulse-api.healthsathi.workers.dev/api/phone-ai/voice-report \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "voiceMessage": "I have a fever and cough",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "country": "United States"
    }
  }'
```

### Health Consultation
```bash
curl -X POST https://healthpulse-api.healthsathi.workers.dev/api/phone-ai/health-consultation \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "symptoms": ["Fever", "Cough", "Fatigue"],
    "duration": "3 days",
    "severity": "moderate"
  }'
```

### Send Notification
```bash
curl -X POST https://healthpulse-api.healthsathi.workers.dev/api/phone-ai/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "message": "Your health check is due",
    "type": "reminder"
  }'
```

### Emergency Alert
```bash
curl -X POST https://healthpulse-api.healthsathi.workers.dev/api/phone-ai/emergency-alert \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "emergencyType": "severe_symptoms",
    "symptoms": ["Chest pain", "Difficulty breathing"],
    "severity": "critical"
  }'
```

### Get Phone Health Status
```bash
curl "https://healthpulse-api.healthsathi.workers.dev/api/phone-ai/health-status?phoneNumber=+1234567890"
```

## Analytics Endpoints

### Outbreak Prediction
```bash
curl "https://healthpulse-api.healthsathi.workers.dev/api/analytics/outbreak-prediction?region=North%20America&disease=flu&timeframe=30d"
```

### Health Trends
```bash
curl "https://healthpulse-api.healthsathi.workers.dev/api/analytics/health-trends?metric=flu_cases&period=30d"
```

### Risk Assessment
```bash
curl -X POST https://healthpulse-api.healthsathi.workers.dev/api/analytics/risk-assessment \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "gender": "male",
    "symptoms": ["Fever", "Cough"],
    "medicalHistory": ["Asthma"]
  }'
```

### Seasonal Patterns
```bash
curl "https://healthpulse-api.healthsathi.workers.dev/api/analytics/seasonal-patterns?disease=flu&region=North%20America"
```

## JavaScript Examples

### Fetch Reports
```javascript
fetch('https://healthpulse-api.healthsathi.workers.dev/api/reports')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### Create Report
```javascript
fetch('https://healthpulse-api.healthsathi.workers.dev/api/reports', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nickname: 'JohnDoe',
    country: 'United States',
    pinCode: '12345',
    symptoms: ['Fever', 'Cough'],
    illnessType: 'flu',
    severity: 'moderate',
    latitude: 40.7128,
    longitude: -74.0060
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Get Health Aggregates
```javascript
fetch('https://healthpulse-api.healthsathi.workers.dev/api/health-aggregates')
  .then(response => response.json())
  .then(data => {
    const totalReports = data.find(item => item.metric === 'total_reports')?.value;
    console.log('Total reports:', totalReports);
  })
  .catch(error => console.error('Error:', error));
```

## Python Examples

### Using requests library
```python
import requests
import json

# Get all reports
response = requests.get('https://healthpulse-api.healthsathi.workers.dev/api/reports')
reports = response.json()
print(f"Total reports: {len(reports)}")

# Create a new report
new_report = {
    "nickname": "JohnDoe",
    "country": "United States",
    "pinCode": "12345",
    "symptoms": ["Fever", "Cough"],
    "illnessType": "flu",
    "severity": "moderate",
    "latitude": 40.7128,
    "longitude": -74.0060
}

response = requests.post(
    'https://healthpulse-api.healthsathi.workers.dev/api/reports',
    json=new_report
)
result = response.json()
print(f"Created report: {result['data']['id']}")

# Get health aggregates
response = requests.get('https://healthpulse-api.healthsathi.workers.dev/api/health-aggregates')
aggregates = response.json()
for item in aggregates:
    print(f"{item['metric']}: {item['value']}")
```

## Common Response Patterns

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
  "details": "Additional details"
}
```

### Array Response (for GET endpoints)
```json
[
  { ... },
  { ... }
]
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Phone AI System
- **Phone Number:** `+1 7703620543`
- **Features:** Voice reporting, AI consultations, notifications, emergency alerts

## Demo Data
- 28,000+ symptom reports
- 19 countries covered
- Realistic geographical distribution
- Seasonal patterns included 