import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    const { data: comments, error } = await supabaseAdmin
      .from('comments')
      .select(`
        *,
        author:profiles(id, name, username, avatar)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Fetch comments error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, parentComment } = await req.json();

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert([
        {
          content,
          post_id: postId,
          author_id: session.id,
          parent_comment_id: parentComment || null,
        },
      ])
      .select(`
        *,
        author:profiles(id, name, avatar)
      `)
      .single();

    if (error) throw error;

    // Notifications
    const { data: post } = await supabaseAdmin.from('posts').select('author_id').eq('id', postId).single();
    if (post && post.author_id !== session.id) {
      await supabaseAdmin.from('notifications').insert([{
        user_id: post.author_id,
        actor_id: session.id,
        type: 'comment',
        post_id: postId
      }]);
    }

    if (parentComment) {
      const { data: parent } = await supabaseAdmin.from('comments').select('author_id').eq('id', parentComment).single();
      if (parent && parent.author_id !== session.id && parent.author_id !== post?.author_id) {
        await supabaseAdmin.from('notifications').insert([{
          user_id: parent.author_id,
          actor_id: session.id,
          type: 'comment', // Could distinguish 'reply' type if schema supported, sticking to 'comment'
          post_id: postId
        }]);
      }
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
