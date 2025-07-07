const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

// Load Supabase credentials from environment variables or fallback to backend env
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function backupSymptomReports() {
  try {
    console.log('Fetching all reports from Supabase...');
    let { data, error, count } = await supabase
      .from('symptom_reports')
      .select('*', { count: 'exact', head: false });

    if (error) {
      throw error;
    }

    const today = new Date().toISOString().slice(0, 10);
    const backupFile = path.join(__dirname, `backup-symptom-reports-${today}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
    console.log(`Backup complete! ${data.length} reports saved to ${backupFile}`);
  } catch (err) {
    console.error('Backup failed:', err.message || err);
    process.exit(1);
  }
}

backupSymptomReports();