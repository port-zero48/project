import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

async function checkUser() {
  const { data, error } = await supabase
    .from('users')
    .select('email, role, id')
    .eq('email', 'sokjoon6@gmail.com');

  console.log('Query result:', { data, error });
  
  if (data && data.length > 0) {
    console.log('sokjoon6@gmail.com found:');
    console.log('  Email:', data[0].email);
    console.log('  Role:', data[0].role);
    console.log('  ID:', data[0].id);
  } else {
    console.log('sokjoon6@gmail.com NOT found in users table');
  }
}

checkUser();
