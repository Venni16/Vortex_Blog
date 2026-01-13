
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yofzalmwsbpzbuwofccx.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvZnphbG13c2JwemJ1d29mY2N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIxNzU1MywiZXhwIjoyMDgzNzkzNTUzfQ.-DW5HzLDBQUaEGe-HGpe0NdCK1E_HF_-phWNnkx9fAg';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testQuery() {
    console.log('Testing Profile Query...');

    // Get a user ID first
    const { data: users } = await supabaseAdmin.from('profiles').select('id').limit(1);
    if (!users || users.length === 0) {
        console.log('No users found.');
        return;
    }
    const id = users[0].id; // Use the first user found or a specific one if known
    console.log(`Querying for user: ${id}`);

    // Attempt 1: Explicit constraint names (Original)
    console.log('--- Attempt 1: Constraint Names (Original) ---');
    const { data: user1, error: error1 } = await supabaseAdmin
        .from('profiles')
        .select(`
        id, 
        posts_count:posts(count),
        followers_count:follows!follows_following_id_fkey(count),
        following_count:follows!follows_follower_id_fkey(count)
      `)
        .eq('id', id)
        .single();

    if (error1) {
        console.error('Attempt 1 Failed:', error1.message);
    } else {
        console.log('Attempt 1 Success:', JSON.stringify(user1, null, 2));
    }

    // Attempt 2: Column names as hints
    console.log('--- Attempt 2: Column Names ---');
    const { data: user2, error: error2 } = await supabaseAdmin
        .from('profiles')
        .select(`
        id, 
        followers:follows!following_id(count),
        following:follows!follower_id(count)
      `)
        .eq('id', id)
        .single();

    if (error2) {
        console.error('Attempt 2 Failed:', error2.message);
    } else {
        console.log('Attempt 2 Success:', JSON.stringify(user2, null, 2));
    }

    // Attempt 3: Ambiguous / Default
    console.log('--- Attempt 3: No Hints ---');
    const { data: user3, error: error3 } = await supabaseAdmin
        .from('profiles')
        .select(`
        id, 
        follows(count)
      `)
        .eq('id', id)
        .single();

    if (error3) {
        console.error('Attempt 3 Failed:', error3.message);
    } else {
        console.log('Attempt 3 Success:', JSON.stringify(user3, null, 2));
    }
}

testQuery();
