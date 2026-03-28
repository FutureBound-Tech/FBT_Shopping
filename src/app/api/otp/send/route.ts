import { NextResponse } from 'next/server';
import { sendCustomerOtp } from '@/lib/mail';

// In-memory OTP store (resets on server restart)
// Key: email, Value: { otp: string, expires: number }
const otpStore = (globalThis as any).__otpStore || new Map<string, { otp: string; expires: number }>();
(globalThis as any).__otpStore = otpStore;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(email.toLowerCase(), { otp, expires });

    // Clean up expired OTPs periodically
    for (const [key, val] of otpStore.entries()) {
      if (val.expires < Date.now()) otpStore.delete(key);
    }

    console.log(`[OTP] Generated for ${email}: ${otp}`);

    // Send email
    const result = await sendCustomerOtp(email, otp);

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email. Please check your email address.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent to your email' });
  } catch (error: any) {
    console.error('OTP Send Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
