import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      { count: totalPosts },
      { count: totalUsers },
      { count: totalComments },
      { data: likes }
    ] = await Promise.all([
      supabaseAdmin.from('posts').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('comments').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('post_likes').select('*')
    ]);

    const totalLikes = likes?.length || 0;
    const engagement = totalPosts && totalPosts > 0 
      ? Math.round(((totalLikes + (totalComments || 0)) / totalPosts) * 10) / 10 
      : 0;

    return NextResponse.json({
      totalPosts: totalPosts || 0,
      totalUsers: totalUsers || 0,
      totalComments: totalComments || 0,
      engagement: `${engagement}x`
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
