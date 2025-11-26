import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import nodemailer from 'nodemailer';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('email_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Don't return the password in plain text if possible, or just return it (not secure but MVP)
    // For MVP we return it so the form is populated.
    return NextResponse.json({ settings: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sender_name, sender_email, smtp_host, smtp_port, smtp_user, smtp_password } = body;

    const supabase = createServerClient();

    // Check if exists
    const { data: existing } = await supabase
        .from('email_settings')
        .select('id')
        .eq('user_id', userId)
        .single();

    let result;
    if (existing) {
        result = await supabase
            .from('email_settings')
            .update({
                sender_name,
                sender_email,
                smtp_host,
                smtp_port,
                smtp_user,
                smtp_password,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select()
            .single();
    } else {
        result = await supabase
            .from('email_settings')
            .insert({
                user_id: userId,
                sender_name,
                sender_email,
                smtp_host,
                smtp_port,
                smtp_user,
                smtp_password
            })
            .select()
            .single();
    }

    if (result.error) throw result.error;

    return NextResponse.json({ settings: result.data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

