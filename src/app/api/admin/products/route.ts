import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { parseProductFromDescription, analyzeImage } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { description, media, override } = body;
    
    if (!description || !media || media.length === 0) {
      return NextResponse.json({ error: 'Description and media are required' }, { status: 400 });
    }
    
    // If override is provided (from confirmation modal), use those values directly
    if (override) {
      console.log('[POST] Using user-confirmed override data');
      const newProduct = await Product.create({
        title: override.title || 'Untitled Product',
        description: override.description || '',
        rawDescription: description,
        price: override.price || 0,
        category: override.category || 'dress',
        media,
        colors: override.colors || [],
        sizes: override.sizes || [],
        fabric: override.fabric || '',
        highlights: override.highlights || [],
        pageContent: override.pageContent || '',
        tags: override.tags || [],
        views: 0
      });
      return NextResponse.json({ success: true, product: newProduct });
    }

    // Otherwise run AI analysis (fallback for direct API calls)
    const allImageUrls: string[] = media
      .filter((m: any) => m.type === 'image' && m.url)
      .map((m: any) => m.url);
    
    const firstImageUrl = allImageUrls[0] || '';
    
    const [textData, imageData] = await Promise.allSettled([
      parseProductFromDescription(description, allImageUrls),
      firstImageUrl ? analyzeImage(firstImageUrl) : Promise.resolve(null),
    ]);
    
    const aiText = textData.status === 'fulfilled' ? textData.value : null;
    const aiImage = imageData.status === 'fulfilled' ? imageData.value : null;
    
    if (textData.status === 'rejected') console.error('[POST] Text parsing failed:', textData.reason);
    if (imageData.status === 'rejected') console.error('[POST] Image analysis failed:', imageData.reason);
    
    const mergedTitle = aiText?.title || aiImage?.title || 'Premium Ethnic Product';
    const mergedDescription = aiImage?.description || aiText?.description || description.slice(0, 200);
    const mergedCategory = aiText?.category || aiImage?.category || 'dress';
    
    const mergedTags = [
      ...new Set([
        ...(aiImage?.tags || []),
        ...(aiText?.tags || []),
      ]),
    ];
    
    const newProduct = await Product.create({
      title: mergedTitle,
      description: mergedDescription,
      rawDescription: description,
      price: aiText?.price || 0,
      category: mergedCategory,
      media,
      colors: aiText?.colors || [],
      sizes: aiText?.sizes || [],
      fabric: aiText?.fabric || '',
      highlights: aiText?.highlights || [],
      pageContent: aiText?.pageContent || '',
      tags: mergedTags,
      views: 0
    });
    
    return NextResponse.json({ success: true, product: newProduct });
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
    
    // Collect ALL image URLs from the product
    const allImageUrls: string[] = (product.media || [])
      .filter((m: any) => m.type === 'image' && m.url)
      .map((m: any) => m.url);
    
    const firstImageUrl = allImageUrls[0] || '';
    
    // Run text parsing (with all images for color extraction) and image analysis in parallel
    const [textData, imageData] = await Promise.allSettled([
      parseProductFromDescription(textToAnalyze, allImageUrls),
      firstImageUrl ? analyzeImage(firstImageUrl) : Promise.resolve(null),
    ]);
    
    const aiText = textData.status === 'fulfilled' ? textData.value : null;
    const aiImage = imageData.status === 'fulfilled' ? imageData.value : null;
    
    if (textData.status === 'rejected') console.error('[PATCH] Text parsing failed:', textData.reason);
    if (imageData.status === 'rejected') console.error('[PATCH] Image analysis failed:', imageData.reason);
    
    // Merge results
    const mergedTitle = aiText?.title || aiImage?.title || product.title;
    const mergedDescription = aiImage?.description || aiText?.description || product.description;
    const mergedCategory = aiText?.category || aiImage?.category || product.category;
    const mergedTags = [
      ...new Set([
        ...(aiImage?.tags || []),
        ...(aiText?.tags || []),
      ]),
    ];

    console.log('[PATCH AI] Colors from all images:', aiText?.colors);

    const updated = await Product.findByIdAndUpdate(productId, {
      title: mergedTitle,
      description: mergedDescription,
      rawDescription: textToAnalyze,
      price: aiText?.price || product.price,
      category: mergedCategory,
      colors: aiText?.colors || product.colors,
      sizes: aiText?.sizes || product.sizes,
      fabric: aiText?.fabric || product.fabric,
      highlights: aiText?.highlights || product.highlights,
      pageContent: aiText?.pageContent || product.pageContent,
      tags: mergedTags,
    }, { new: true });

    return NextResponse.json({ success: true, product: updated, aiData: { text: aiText, image: aiImage } });
  } catch (error: any) {
    console.error('Re-analyze Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to re-analyze' }, { status: 500 });
  }
}
