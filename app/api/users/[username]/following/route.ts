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

        const { data: following, error } = await supabaseAdmin
            .from('follows')
            .select(`
        following:profiles!follows_following_id_fkey(id, name, username, avatar, bio)
      `)
            .eq('follower_id', id);

        if (error) throw error;

        const formattedFollowing = following.map((f: any) => f.following);

        return NextResponse.json({ following: formattedFollowing });
    } catch (error) {
        console.error('Fetch following error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
