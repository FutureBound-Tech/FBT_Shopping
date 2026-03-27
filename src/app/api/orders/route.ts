import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { customerName, customerMobile, items, totalAmount, shippingAddress } = body;

    if (!customerName || !customerMobile || !items?.length || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { fullName, mobileNumber, addressLine1, city, state, pincode } = shippingAddress;
    if (!fullName || !mobileNumber || !addressLine1 || !city || !state || !pincode) {
      return NextResponse.json({ error: 'Incomplete shipping address' }, { status: 400 });
    }

    const order = await Order.create({
      customerName,
      customerMobile,
      items,
      totalAmount,
      shippingAddress,
      status: 'pending',
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Create Order Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get('mobile');

    const filter: any = {};
    if (mobile) filter.customerMobile = mobile;

    const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('items.product', 'title media');
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
