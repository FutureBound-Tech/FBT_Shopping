import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import AdminSession from '@/models/AdminSession';
import { sendAdminOtp } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // 1. Check Hardcoded Admin Credentials
    if (username !== 'admin' || password !== 'admin') {
      return NextResponse.json({ success: false, error: 'Authorization Denied' }, { status: 401 });
    }

    // 2. Generate 6-Digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const attemptId = crypto.randomUUID();

    // 3. Connect DB and Store Temporarily
    await dbConnect();
    await AdminSession.create({
      otp,
      attemptId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // 4. Send Email
    const emailResult = await sendAdminOtp(otp);
    if (!emailResult.success) {
      return NextResponse.json({ success: false, error: 'Email service unavailable' }, { status: 500 });
    }

    return NextResponse.json({ success: true, attemptId });
  } catch (error) {
    console.error('[ADMIN-AUTH-LOGIN]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
