import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

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

    const userId = session.id;

    const { data: existingLike, error: fetchError } = await supabaseAdmin
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      const { error: deleteError } = await supabaseAdmin
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      if (deleteError) throw deleteError;
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('post_likes')
        .insert([{ post_id: postId, user_id: userId }]);
      if (insertError) throw insertError;

      // Notification
      const { data: post } = await supabaseAdmin.from('posts').select('author_id').eq('id', postId).single();
      if (post && post.author_id !== userId) {
        await supabaseAdmin.from('notifications').insert([{
          user_id: post.author_id,
          actor_id: userId,
          type: 'like',
          post_id: postId
        }]);
      }
    }

    const { count, error: countError } = await supabaseAdmin
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    return NextResponse.json({ message: 'Action successful', likes: count || 0 });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
