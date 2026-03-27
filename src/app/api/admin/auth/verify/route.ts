import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongoose';
import AdminSession from '@/models/AdminSession';

export async function POST(req: Request) {
  try {
    const { attemptId, otp } = await req.json();

    if (!attemptId || !otp) {
      return NextResponse.json({ success: false, error: 'Authorization Incomplete' }, { status: 400 });
    }

    await dbConnect();

    // 1. Find Session
    const session = await AdminSession.findOne({ attemptId });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication Expired' }, { status: 401 });
    }

    // 2. Already Verified Check
    if (session.isVerified) {
      return NextResponse.json({ success: false, error: 'Unauthorized Session Reuse' }, { status: 403 });
    }

    // 3. OTP Match Check
    if (session.otp !== otp) {
      return NextResponse.json({ success: false, error: 'Invalid Verification Code' }, { status: 401 });
    }

    // 4. Verification Succeeded!
    // Update session or just issue cookie
    session.isVerified = true;
    await session.save();

    // 5. Issue Secure Admin Cookie (Valid for 24h)
    (await cookies()).set('fbt_admin_verified', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/admin', // restrict to admin routes
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({ success: true, redirect: '/admin' });
  } catch (error) {
    console.error('[ADMIN-AUTH-VERIFY]', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
