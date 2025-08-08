const fetch = require('node-fetch');

// A small set of global locations for demo
const locations = [
  { country: 'US', pinCode: '10001', city: 'New York', latitude: 40.7128, longitude: -74.0060 },
  { country: 'IN', pinCode: '400001', city: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
  { country: 'BR', pinCode: '20000-000', city: 'Rio de Janeiro', latitude: -22.9068, longitude: -43.1729 },
  { country: 'ZA', pinCode: '2000', city: 'Johannesburg', latitude: -26.2041, longitude: 28.0473 },
  { country: 'AU', pinCode: '2000', city: 'Sydney', latitude: -33.8688, longitude: 151.2093 },
  { country: 'RU', pinCode: '101000', city: 'Moscow', latitude: 55.7558, longitude: 37.6176 },
  { country: 'CN', pinCode: '100000', city: 'Beijing', latitude: 39.9042, longitude: 116.4074 },
  { country: 'JP', pinCode: '100-0001', city: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { country: 'GB', pinCode: 'SW1A', city: 'London', latitude: 51.5074, longitude: -0.1278 },
  { country: 'EG', pinCode: '11511', city: 'Cairo', latitude: 30.0444, longitude: 31.2357 },
];

const illnesses = ['flu', 'covid', 'dengue', 'malaria', 'typhoid', 'chikungunya', 'unknown', 'other'];
const severities = ['mild', 'moderate', 'severe'];
const symptomsList = [
  'Fever', 'Cough', 'Sore throat', 'Headache', 'Fatigue',
  'Body aches', 'Runny nose', 'Nausea', 'Diarrhea', 'Loss of taste/smell',
  'Shortness of breath', 'Chest pain', 'Dizziness', 'Chills', 'Sweating'
];
const nicknames = ['HealthWatcher', 'WellnessSeeker', 'CommunityCare', 'HealthGuard', 'WellnessBuddy'];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSymptoms() {
  const count = 2 + Math.floor(Math.random() * 3);
  const shuffled = symptomsList.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomDateISO() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now);
  date.setDate(now.getDate() - daysAgo);
  return date.toISOString();
}

const WORKER_API = 'https://healthpulse-api.healthsathi.workers.dev/api/reports';

async function postReport(report) {
  const payload = {
    nickname: report.nickname,
    country: report.country,
    pinCode: report.pinCode,
    symptoms: report.symptoms,
    illnessType: report.illnessType,
    severity: report.severity,
    latitude: report.latitude,
    longitude: report.longitude,
    createdAt: report.createdAt,
  };

  const res = await fetch(WORKER_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error(`Failed to POST report: ${res.status} ${res.statusText}`);
  } else {
    console.log('Posted report:', payload.nickname, payload.country, payload.pinCode);
  }
}

(async () => {
  for (let i = 0; i < 100; i++) {
    const loc = randomFrom(locations);
    const report = {
      nickname: randomFrom(nicknames),
      country: loc.country,
      pinCode: loc.pinCode,
      symptoms: randomSymptoms(),
      illnessType: randomFrom(illnesses),
      severity: randomFrom(severities),
      latitude: loc.latitude + (Math.random() - 0.5) * 0.2, // scatter a bit
      longitude: loc.longitude + (Math.random() - 0.5) * 0.2,
      createdAt: randomDateISO(),
    };
    await postReport(report);
    await new Promise(r => setTimeout(r, 50)); // avoid rate limits
  }
  console.log('All demo reports posted!');
})(); 