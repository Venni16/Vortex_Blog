import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    let dbQuery = supabaseAdmin
      .from('posts')
      .select(`
          *,
          author:profiles!posts_author_id_fkey(id, name, username, avatar),
          likes_count:post_likes(count),
          comments_count:comments(count)
        `)
      .order('created_at', { ascending: false });

    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
    }

    const { data: posts, error } = await dbQuery;

    if (error) throw error;

    const formattedPosts = posts.map(post => ({
      ...post,
      likes: post.likes_count ? post.likes_count[0].count : 0,
      comments_count: post.comments_count ? post.comments_count[0].count : 0
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Fetch posts error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, image, tags } = await req.json();

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert([
        {
          title,
          content,
          image,
          tags,
          author_id: session.id,
        },
      ])
      .select(`
          *,
          author:profiles!posts_author_id_fkey(id, name, username, avatar)
        `)
      .single();

    if (error) throw error;

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
