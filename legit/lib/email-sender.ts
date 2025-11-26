import nodemailer from 'nodemailer';
import { createServerClient } from '@/lib/supabase';

export async function sendEmail(userId: string, options: { to: string; subject: string; html: string }) {
  const supabase = createServerClient();
  
  // Get Settings
  const { data: settings } = await supabase
    .from('email_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!settings) {
    throw new Error('Email settings not configured');
  }

  if (!options.to) {
      throw new Error('Recipient email is missing');
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: settings.smtp_port,
    secure: settings.smtp_port === 465,
    auth: {
      user: settings.smtp_user,
      pass: settings.smtp_password,
    },
  });

  const info = await transporter.sendMail({
    from: `"${settings.sender_name}" <${settings.sender_email}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  return { messageId: info.messageId };
}

