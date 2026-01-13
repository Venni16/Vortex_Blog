import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function POST(
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

    const targetId = user.id;

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.id === targetId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const { data: existingFollow, error: fetchError } = await supabaseAdmin
      .from('follows')
      .select('*')
      .eq('follower_id', session.id)
      .eq('following_id', targetId)
      .single();

    let isFollowing = false;
    if (existingFollow) {
      const { error: deleteError } = await supabaseAdmin
        .from('follows')
        .delete()
        .eq('follower_id', session.id)
        .eq('following_id', targetId);
      if (deleteError) throw deleteError;
      isFollowing = false;
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('follows')
        .insert([{ follower_id: session.id, following_id: targetId }]);
      if (insertError) throw insertError;
      isFollowing = true;

      // Notification
      await supabaseAdmin.from('notifications').insert([{
        user_id: targetId,
        actor_id: session.id,
        type: 'follow'
      }]);
    }

    return NextResponse.json({ following: isFollowing });
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
