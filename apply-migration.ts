import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ukizjreylybyidbazgas.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_KEY environment variable not set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('Applying RLS policy fix...')

    // Drop the old restrictive policy
    await supabase.rpc('exec_sql', {
      sql: `DROP POLICY IF EXISTS "Admin can update withdrawal requests" ON public.withdrawal_requests;`,
    })

    // Create separate policies for admin and user updates
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can update own withdrawal requests"
          ON public.withdrawal_requests
          FOR UPDATE
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
      `,
    })

    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Admin can update all withdrawal requests"
          ON public.withdrawal_requests
          FOR UPDATE
          USING (auth.jwt() ->> 'email' = 'vit88095@gmail.com')
          WITH CHECK (auth.jwt() ->> 'email' = 'vit88095@gmail.com');
      `,
    })

    console.log('✅ Migration applied successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

applyMigration()
