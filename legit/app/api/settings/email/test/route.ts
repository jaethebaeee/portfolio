import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { host, port, user, password, fromEmail, toEmail } = body;

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465, // true for 465, false for other ports
      auth: {
        user,
        pass: password,
      },
    });

    await transporter.verify();
    
    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: 'DoctorsFlow SMTP Test',
      text: 'This is a test email from your DoctorsFlow SMTP configuration.',
      html: '<p>This is a test email from your <b>DoctorsFlow</b> SMTP configuration.</p>',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('SMTP Test Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

