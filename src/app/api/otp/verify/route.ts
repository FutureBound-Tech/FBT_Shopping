import { NextResponse } from 'next/server';

// Use same in-memory store as send endpoint
const otpStore = (globalThis as any).__otpStore || new Map<string, { otp: string; expires: number }>();
(globalThis as any).__otpStore = otpStore;

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const key = email.toLowerCase();
    const stored = otpStore.get(key);

    if (!stored) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 });
    }

    if (stored.expires < Date.now()) {
      otpStore.delete(key);
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    if (stored.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP. Please check and try again.' }, { status: 400 });
    }

    // OTP verified — clean up
    otpStore.delete(key);

    return NextResponse.json({ success: true, message: 'Email verified successfully' });
  } catch (error: any) {
    console.error('OTP Verify Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify OTP' }, { status: 500 });
  }
}
