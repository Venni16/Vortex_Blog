import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';

export async function ensureAdminExists() {
  if (typeof window !== 'undefined') return;

  const adminEmail = process.env.ADMIN_EMAIL || 'venniwork16@gmail.com';
  const adminPassword = 'Venniadmin123';

  try {
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', adminEmail)
      .single();

    if (!existingUser) {
      console.log('Admin user not found, creating...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const { error: createError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            name: 'Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
          },
        ]);

      if (createError) {
        console.error('Error creating admin user:', createError);
      } else {
        console.log('Admin user created successfully');
      }
    }
  } catch (error) {
    console.error('Failed to ensure admin exists:', error);
  }
}
