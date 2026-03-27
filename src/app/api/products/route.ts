import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort');

    let query: any = {};
    if (category) {
      query.category = category;
    }

    let sortOption: any = { createdAt: -1 }; // Default: Newest first (same day / new arrivals)
    
    if (sort === 'trending') {
      sortOption = { views: -1 }; // Highest views first
    } else if (sort === 'price-low') {
        sortOption = { price: 1 };
    } else if (sort === 'price-high') {
        sortOption = { price: -1 };
    } else if (sort === 'new') {
        sortOption = { createdAt: -1 };
    }

    const products = await Product.find(query).sort(sortOption);
    
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get products' }, { status: 500 });
  }
}
