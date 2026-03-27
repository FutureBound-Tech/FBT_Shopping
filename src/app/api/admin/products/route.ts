import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { parseProductFromDescription } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { description, media } = body; // 'description' from UI is the raw input
    
    if (!description || !media || media.length === 0) {
      return NextResponse.json({ error: 'Description and media are required' }, { status: 400 });
    }
    
    // AI extraction: returns cleaned title, price, sizes, AND a clean description
    const aiData = await parseProductFromDescription(description, media[0]?.url);
    
    console.log('[POST AI] Clean extracted:', JSON.stringify(aiData));
    
    const newProduct = await Product.create({
      title: aiData.title,
      description: aiData.description, // Use AI-cleaned description for display
      rawDescription: description,     // Store original messy description for internal reference
      price: aiData.price,
      category: aiData.category,
      media,
      colors: aiData.colors,
      sizes: aiData.sizes,
      fabric: aiData.fabric,
      highlights: aiData.highlights,
      views: 0
    });
    
    return NextResponse.json({ success: true, product: newProduct, aiData });
  } catch (error: any) {
    console.error('Create Product Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get products' }, { status: 500 });
  }
}

// Re-analyze existing product with AI
export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const { productId } = await request.json();
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Use rawDescription if available, else use current description
    const textToAnalyze = product.rawDescription || product.description;
    const firstImageUrl = product.media?.find((m: any) => m.type === 'image')?.url || product.media?.[0]?.url;
    
    const aiData = await parseProductFromDescription(textToAnalyze, firstImageUrl);

    const updated = await Product.findByIdAndUpdate(productId, {
      title: aiData.title,
      description: aiData.description, // Overwrite with cleaned description
      rawDescription: textToAnalyze,   // Ensure raw is preserved
      price: aiData.price,
      category: aiData.category,
      colors: aiData.colors,
      sizes: aiData.sizes,
      fabric: aiData.fabric,
      highlights: aiData.highlights,
    }, { new: true });

    return NextResponse.json({ success: true, product: updated, aiData });
  } catch (error: any) {
    console.error('Re-analyze Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to re-analyze' }, { status: 500 });
  }
}
