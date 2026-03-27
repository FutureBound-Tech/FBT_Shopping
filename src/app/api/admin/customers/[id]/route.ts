import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { fullName, mobileNumber } = body;

    if (!fullName && !mobileNumber) {
      return NextResponse.json({ error: 'At least one field is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (mobileNumber) updateData.mobileNumber = mobileNumber;

    const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!user) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, customer: user });
  } catch (error: any) {
    console.error('Update Customer Error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Mobile number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Customer deleted' });
  } catch (error: any) {
    console.error('Delete Customer Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete customer' }, { status: 500 });
  }
}
