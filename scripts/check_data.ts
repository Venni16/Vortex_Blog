
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yofzalmwsbpzbuwofccx.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvZnphbG13c2JwemJ1d29mY2N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIxNzU1MywiZXhwIjoyMDgzNzkzNTUzfQ.-DW5HzLDBQUaEGe-HGpe0NdCK1E_HF_-phWNnkx9fAg';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkData() {
    console.log('Checking Tables...');

    const tables = ['profiles', 'posts', 'comments', 'post_likes', 'follows', 'notifications'];

    for (const table of tables) {
        const { count, error } = await supabaseAdmin
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error(`Error checking ${table}:`, error.message);
        } else {
            console.log(`${table}: ${count} rows`);
        }
    }
}

checkData();
