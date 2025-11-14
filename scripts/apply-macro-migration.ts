import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  console.log('📦 Reading migration file...');
  const migrationPath = join(process.cwd(), 'supabase/migrations/20250120_add_macros_to_food_priors.sql');
  const sql = readFileSync(migrationPath, 'utf-8');

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 Found ${statements.length} SQL statements to execute`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (statement.length === 0) continue;

    try {
      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      
      if (error) {
        // Try direct query if RPC doesn't work
        const { error: directError } = await supabase.from('_').select('*').limit(0);
        if (directError) {
          console.error(`❌ Error: ${error.message}`);
          console.error(`   Statement: ${statement.substring(0, 100)}...`);
          // Continue with next statement
        }
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    } catch (err) {
      console.error(`❌ Error executing statement ${i + 1}:`, err);
      // Continue with next statement
    }
  }

  console.log('\n✅ Migration completed!');
}

// Alternative: Use Supabase REST API to execute SQL
async function applyMigrationViaREST() {
  console.log('📦 Reading migration file...');
  const migrationPath = join(process.cwd(), 'supabase/migrations/20250120_add_macros_to_food_priors.sql');
  const sql = readFileSync(migrationPath, 'utf-8');

  console.log('📝 Executing migration via Supabase REST API...');
  
  // Use the Supabase Management API or direct SQL execution
  // Note: This requires the service role key and proper endpoint
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql_query: sql }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error executing migration:', errorText);
    console.log('\n💡 Alternative: Run the SQL manually in Supabase Dashboard SQL Editor');
    console.log('   File location: supabase/migrations/20250120_add_macros_to_food_priors.sql');
    process.exit(1);
  }

  console.log('✅ Migration applied successfully!');
}

// Try the REST API approach first
applyMigrationViaREST().catch((err) => {
  console.error('❌ Migration failed:', err);
  console.log('\n💡 Please run the migration manually:');
  console.log('   1. Go to Supabase Dashboard → SQL Editor');
  console.log('   2. Copy contents of: supabase/migrations/20250120_add_macros_to_food_priors.sql');
  console.log('   3. Paste and execute');
  process.exit(1);
});


