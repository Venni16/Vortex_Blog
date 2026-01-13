import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const { count, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate username from email or name
    let username = name.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 1000);
    
    const isAdminEmail = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;
    const role = (count === 0 || isAdminEmail) ? 'admin' : 'user';

    const { data: user, error: createError } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          name,
          email,
          username,
          password: hashedPassword,
          role,
        },
      ])
      .select()
      .single();

    if (createError) throw createError;

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ id: user.id, role: user.role, expires });

    const response = NextResponse.json({ message: 'User created' }, { status: 201 });
    response.cookies.set('session', session, { expires, httpOnly: true });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
