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

// Clear sample data
async function clearSampleData() {
  console.log('🗑️  Clearing sample data...');
  
  try {
    // Delete all symptom reports
    const { error } = await supabase
      .from('symptom_reports')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (error) {
      console.error('Error clearing data:', error);
    } else {
      console.log('✅ Sample data cleared successfully!');
    }
  } catch (err) {
    console.error('Error clearing data:', err);
  }
}

// Run the script
clearSampleData().catch(console.error); 