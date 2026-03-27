import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    const customers = await User.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error('Fetch Customers Error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
