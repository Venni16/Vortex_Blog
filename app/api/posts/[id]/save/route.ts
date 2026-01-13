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

    const { data: existingSave, error: fetchError } = await supabaseAdmin
      .from('saved_posts')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    let isSaved = false;
    if (existingSave) {
      const { error: deleteError } = await supabaseAdmin
        .from('saved_posts')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);
      if (deleteError) throw deleteError;
      isSaved = false;
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('saved_posts')
        .insert([{ user_id: userId, post_id: postId }]);
      if (insertError) throw insertError;
      isSaved = true;
    }

    return NextResponse.json({ saved: isSaved });
  } catch (error) {
    console.error('Save post error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
