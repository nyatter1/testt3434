import { supabase } from './src/lib/supabase';
async function run() {
  const { data, error } = await supabase.from('moderation').select('*').limit(1);
  console.log('mod', data, error);
}
run();
