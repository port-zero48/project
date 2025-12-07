import { supabase } from './services/auth';

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
