import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();

    const [productCount, orderCount, customerCount, orders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.find({ status: { $ne: 'cancelled' } }).select('totalAmount'),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('customerName totalAmount status createdAt');

    return NextResponse.json({
      success: true,
      stats: {
        productCount,
        orderCount,
        customerCount,
        totalRevenue,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
