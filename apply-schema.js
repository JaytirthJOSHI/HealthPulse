const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
const supabaseUrl = 'https://xchwpafqmkfheyxuvtij.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjaHdwYWZxbWtmaGV5eHV2dGlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTUxNzU4OCwiZXhwIjoyMDY3MDkzNTg4fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchema() {
  try {
    console.log('Reading schema file...');
    const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Applying schema to Supabase...');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.log(`Warning: Statement ${i + 1} failed:`, error.message);
            // Continue with other statements
          } else {
            console.log(`✓ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`Warning: Statement ${i + 1} failed:`, err.message);
          // Continue with other statements
        }
      }
    }
    
    console.log('Schema application completed!');
    
  } catch (error) {
    console.error('Error applying schema:', error);
  }
}

// Alternative approach: Use direct SQL execution
async function applySchemaDirect() {
  try {
    console.log('Reading schema file...');
    const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Applying schema using direct SQL...');
    
    // Execute the entire schema as one statement
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('Error executing schema:', error);
    } else {
      console.log('✓ Schema applied successfully!');
    }
    
  } catch (error) {
    console.error('Error applying schema:', error);
  }
}

// Check if we can connect and see what tables exist
async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Try to query existing tables
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.log('Error querying tables:', error.message);
      console.log('This might be expected if tables don\'t exist yet');
    } else {
      console.log('Existing tables:', tables?.map(t => t.table_name) || []);
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

// Run the check first
checkDatabase().then(() => {
  console.log('\n--- Starting schema application ---\n');
  applySchemaDirect();
});