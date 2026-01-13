import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data: post, error } = await supabaseAdmin
      .from('posts')
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, name, username, avatar),
          likes_count:post_likes(count),
          comments_count:comments(count)
        `)
      .eq('id', id)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const formattedPost = {
      ...post,
      likes: post.likes_count ? post.likes_count[0].count : 0,
      comments_count: post.comments_count ? post.comments_count[0].count : 0
    };

    return NextResponse.json({ post: formattedPost });
  } catch (error) {
    console.error('Fetch post error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && existingPost.author_id !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, content, image, tags } = await req.json();
    
    const { data: post, error: updateError } = await supabaseAdmin
      .from('posts')
      .update({ title, content, image, tags })
      .eq('id', id)
        .select(`
          *,
          author:profiles!posts_author_id_fkey(id, name, avatar)
        `)
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: existingPost, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && existingPost.author_id !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
