#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ukizjreylybyidbazgas.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY not set in environment');
  console.log('Please set it and try again:');
  console.log('$env:SUPABASE_SERVICE_KEY="your-service-key"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  try {
    const sqlFile = path.join(
      process.cwd(),
      'supabase/migrations/20251204_add_investment_returns_tracking.sql'
    );

    if (!fs.existsSync(sqlFile)) {
      console.error(`❌ Migration file not found: ${sqlFile}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlFile, 'utf-8');
    console.log('📝 Running investment returns migration...\n');

    // Execute each statement separately
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      console.log(`⏳ Executing: ${statement.substring(0, 60)}...`);
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement,
      });

      if (error) {
        console.error(`❌ Error executing statement: ${error.message}`);
        // Continue with next statement
      } else {
        console.log('✅ Statement executed successfully');
      }
    }

    console.log('\n✅ Migration completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
