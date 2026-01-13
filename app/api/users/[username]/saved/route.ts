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

    const { data: savedPosts, error } = await supabaseAdmin
      .from('saved_posts')
      .select(`
          post:posts(
            *,
            author:profiles!posts_author_id_fkey(id, name, username, avatar),
            likes_count:post_likes(count),
            comments_count:comments(count)
          )
      `)
      .eq('user_id', id);

    if (error) throw error;

    const posts = savedPosts.map((item: any) => ({
      ...item.post,
      likes: item.post.likes_count ? item.post.likes_count[0].count : 0,
      comments_count: item.post.comments_count ? item.post.comments_count[0].count : 0
    }));

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Fetch saved posts error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
