import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const decodedUsername = decodeURIComponent(username);

    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, name, email, username, avatar, bio, role, created_at,
        posts_count:posts!author_id(count),
        followers_count:follows!following_id(count),
        following_count:follows!follower_id(count)
      `)
      .eq('username', decodedUsername)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const session = await getSession();
    let isFollowing = false;

    if (session && session.id !== user.id) {
      const { data: follow } = await supabaseAdmin
        .from('follows')
        .select('*')
        .eq('follower_id', session.id)
        .eq('following_id', user.id)
        .single();
      isFollowing = !!follow;
    }

    const formattedUser = {
      ...user,
      postsCount: user.posts_count ? user.posts_count[0].count : 0,
      followersCount: user.followers_count ? user.followers_count[0].count : 0,
      followingCount: user.following_count ? user.following_count[0].count : 0,
      isFollowing
    };

    return NextResponse.json({ user: formattedUser });
  } catch (error) {
    console.error('Fetch user error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const session = await getSession();

    // We need to fetch the user first to verify identity
    const { data: targetUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (!session || !targetUser || session.id !== targetUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, bio, avatar, username: newUsername } = await req.json();

    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .update({ name, bio, avatar, username: newUsername })
      .eq('id', session.id) // Use session ID for safety
      .select('id, name, email, username, avatar, bio, role, created_at')
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
