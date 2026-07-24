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
      'supabase/migrations/20260421_enable_market_data_rls.sql'
    );

    if (!fs.existsSync(sqlFile)) {
      console.error(`❌ Migration file not found: ${sqlFile}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlFile, 'utf-8');
    console.log('📝 Running market_data RLS migration...\n');
    console.log(sql);
    console.log('\n---\n');

    // Execute each statement separately
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      console.log(`⏳ Executing: ${statement.substring(0, 60)}...`);
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement,
      });

      if (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
      }
      console.log('✅ Done');
    }

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
