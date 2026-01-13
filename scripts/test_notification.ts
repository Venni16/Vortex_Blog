
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yofzalmwsbpzbuwofccx.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvZnphbG13c2JwemJ1d29mY2N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIxNzU1MywiZXhwIjoyMDgzNzkzNTUzfQ.-DW5HzLDBQUaEGe-HGpe0NdCK1E_HF_-phWNnkx9fAg';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testInsert() {
    console.log('Testing Insert into Notifications...');

    // Need a valid user id for foreign key
    const { data: users } = await supabaseAdmin.from('profiles').select('id').limit(1);
    if (!users?.length) {
        console.log('No users to test with');
        return;
    }
    const userId = users[0].id;

    const { error } = await supabaseAdmin.from('notifications').insert([{
        user_id: userId,
        actor_id: userId,
        type: 'like', // valid type
        read: true
    }]);

    if (error) {
        console.error('Insert Failed:', error.message);
    } else {
        console.log('Insert Successful');
    }
}

testInsert();
