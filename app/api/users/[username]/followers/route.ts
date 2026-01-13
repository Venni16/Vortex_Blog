import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        const decodedUsername = decodeURIComponent(username);

        const { data: user } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('username', decodedUsername)
            .single();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const id = user.id;

        const { data: followers, error } = await supabaseAdmin
            .from('follows')
            .select(`
        follower:profiles!follows_follower_id_fkey(id, name, username, avatar, bio)
      `)
            .eq('following_id', id);

        if (error) throw error;

        const formattedFollowers = followers.map((f: any) => f.follower);

        return NextResponse.json({ followers: formattedFollowers });
    } catch (error) {
        console.error('Fetch followers error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
