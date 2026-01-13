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

    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select(`
          *,
          author:profiles!posts_author_id_fkey(id, name, username, avatar),
          likes_count:post_likes(count),
          comments_count:comments(count)
        `)
      .eq('author_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedPosts = posts.map(post => ({
      ...post,
      likes: post.likes_count ? post.likes_count[0].count : 0,
      comments_count: post.comments_count ? post.comments_count[0].count : 0
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Fetch user posts error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
