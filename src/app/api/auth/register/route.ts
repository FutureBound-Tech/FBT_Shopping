import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { fullName, mobileNumber } = await request.json();
    
    if (!fullName || !mobileNumber) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    
    // Upsert user based on mobile number
    let user = await User.findOne({ mobileNumber });
    if (!user) {
      user = await User.create({ fullName, mobileNumber });
    } else if (user.fullName !== fullName) {
      user.fullName = fullName;
      await user.save();
    }
    
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Auth Register Error:", error);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
