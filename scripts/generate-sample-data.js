const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample locations with coordinates
const locations = [
  { country: 'India', pinCode: '400001', city: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
  { country: 'India', pinCode: '110001', city: 'New Delhi', latitude: 28.6139, longitude: 77.2090 },
  { country: 'India', pinCode: '700001', city: 'Kolkata', latitude: 22.5726, longitude: 88.3639 },
  { country: 'India', pinCode: '600001', city: 'Chennai', latitude: 13.0827, longitude: 80.2707 },
  { country: 'India', pinCode: '560001', city: 'Bangalore', latitude: 12.9716, longitude: 77.5946 },
  { country: 'India', pinCode: '695001', city: 'Thiruvananthapuram', latitude: 8.5241, longitude: 76.9366 },
  { country: 'India', pinCode: '380001', city: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714 },
  { country: 'India', pinCode: '302001', city: 'Jaipur', latitude: 26.9124, longitude: 75.7873 },
  { country: 'India', pinCode: '226001', city: 'Lucknow', latitude: 26.8467, longitude: 80.9462 },
  { country: 'India', pinCode: '800001', city: 'Patna', latitude: 25.5941, longitude: 85.1376 },
];

// Disease patterns with seasonal variations
const diseasePatterns = {
  dengue: {
    baseRate: 0.3,
    seasonalMultiplier: 2.5,
    symptoms: ['High fever', 'Severe headache', 'Joint pain', 'Muscle pain', 'Rash'],
    severity: ['mild', 'moderate', 'severe'],
    locations: ['400001', '110001', '700001', '600001', '695001', '380001']
  },
  flu: {
    baseRate: 0.4,
    seasonalMultiplier: 1.8,
    symptoms: ['Fever', 'Cough', 'Sore throat', 'Body aches', 'Fatigue'],
    severity: ['mild', 'moderate'],
    locations: ['400001', '110001', '700001', '600001', '560001', '226001', '800001']
  },
  covid: {
    baseRate: 0.2,
    seasonalMultiplier: 1.2,
    symptoms: ['Fever', 'Cough', 'Fatigue', 'Loss of taste/smell', 'Shortness of breath'],
    severity: ['mild', 'moderate', 'severe'],
    locations: ['400001', '110001', '700001', '600001', '560001']
  },
  malaria: {
    baseRate: 0.15,
    seasonalMultiplier: 3.0,
    symptoms: ['Cyclic fever', 'Chills', 'Sweating', 'Headache', 'Nausea'],
    severity: ['mild', 'moderate', 'severe'],
    locations: ['400001', '700001', '695001']
  },
  typhoid: {
    baseRate: 0.1,
    seasonalMultiplier: 2.0,
    symptoms: ['High fever', 'Headache', 'Abdominal pain', 'Diarrhea'],
    severity: ['mild', 'moderate', 'severe'],
    locations: ['400001', '600001', '226001', '800001']
  }
};

// Nicknames for anonymous reporting
const nicknames = [
  'HealthWatcher', 'WellnessSeeker', 'CommunityCare', 'HealthGuard', 'WellnessBuddy',
  'HealthTracker', 'CommunityHealth', 'WellnessGuide', 'HealthMonitor', 'WellnessPartner',
  'HealthHelper', 'CommunityWell', 'WellnessFriend', 'HealthSupporter', 'WellnessAdvocate'
];

// Exponential decay function
function exponentialDecay(baseValue, days, halfLife = 3) {
  return baseValue * Math.exp(-Math.log(2) * days / halfLife);
}

// Generate random date within the last 14 days
function getRandomDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 14);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);
  
  return date.toISOString();
}

// Generate sample reports with exponential decay
async function generateSampleData() {
  console.log('🚀 Generating sample health data with exponential decay...');
  
  const reports = [];
  const now = new Date();
  
  // Generate data for each location and disease pattern
  for (const location of locations) {
    for (const [diseaseType, pattern] of Object.entries(diseasePatterns)) {
      // Skip if this disease doesn't occur in this location
      if (!pattern.locations.includes(location.pinCode)) continue;
      
      // Calculate base number of reports for this location-disease combination
      const baseReports = Math.floor(pattern.baseRate * 50); // 50 is a scaling factor
      
      // Generate reports for the last 14 days with exponential decay
      for (let day = 0; day < 14; day++) {
        const decayedReports = Math.floor(exponentialDecay(baseReports, day));
        
        // Add some randomness to make it more realistic
        const actualReports = Math.floor(decayedReports * (0.5 + Math.random()));
        
        for (let i = 0; i < actualReports; i++) {
          const report = {
            nickname: nicknames[Math.floor(Math.random() * nicknames.length)],
            country: location.country,
            pin_code: location.pinCode,
            symptoms: pattern.symptoms.slice(0, 2 + Math.floor(Math.random() * 3)), // 2-4 symptoms
            illness_type: diseaseType,
            severity: pattern.severity[Math.floor(Math.random() * pattern.severity.length)],
            latitude: location.latitude + (Math.random() - 0.5) * 0.01, // Add some variation
            longitude: location.longitude + (Math.random() - 0.5) * 0.01,
            created_at: getRandomDate()
          };
          
          reports.push(report);
        }
      }
    }
  }
  
  console.log(`📊 Generated ${reports.length} sample reports`);
  
  // Insert reports in batches
  const batchSize = 100;
  for (let i = 0; i < reports.length; i += batchSize) {
    const batch = reports.slice(i, i + batchSize);
    
    try {
      const { error } = await supabase
        .from('symptom_reports')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting batch:', error);
      } else {
        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(reports.length / batchSize)}`);
      }
    } catch (err) {
      console.error('Error inserting batch:', err);
    }
  }
  
  console.log('🎉 Sample data generation complete!');
  
  // Show summary statistics
  const { data: summary } = await supabase
    .from('symptom_reports')
    .select('illness_type, created_at')
    .gte('created_at', new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString());
  
  if (summary) {
    const diseaseCounts = summary.reduce((acc, report) => {
      acc[report.illness_type] = (acc[report.illness_type] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📈 Sample Data Summary (Last 14 days):');
    Object.entries(diseaseCounts).forEach(([disease, count]) => {
      console.log(`  ${disease}: ${count} reports`);
    });
  }
}

// Run the script
generateSampleData().catch(console.error); 