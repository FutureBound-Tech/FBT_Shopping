import { NextResponse } from 'next/server';
import { parseProductFromDescription, analyzeImage } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, media } = body;

    if (!description || !media || media.length === 0) {
      return NextResponse.json({ error: 'Description and media are required' }, { status: 400 });
    }

    const allImageUrls: string[] = media
      .filter((m: any) => m.type === 'image' && m.url)
      .map((m: any) => m.url);

    const firstImageUrl = allImageUrls[0] || '';

    // Run text parsing (with all images for color extraction) and image analysis in parallel
    const [textData, imageData] = await Promise.allSettled([
      parseProductFromDescription(description, allImageUrls),
      firstImageUrl ? analyzeImage(firstImageUrl) : Promise.resolve(null),
    ]);

    const aiText = textData.status === 'fulfilled' ? textData.value : null;
    const aiImage = imageData.status === 'fulfilled' ? imageData.value : null;

    if (textData.status === 'rejected') console.error('[ANALYZE] Text parsing failed:', textData.reason);
    if (imageData.status === 'rejected') console.error('[ANALYZE] Image analysis failed:', imageData.reason);

    // Merge results
    const mergedTitle = aiText?.title || aiImage?.title || '';
    const mergedDescription = aiImage?.description || aiText?.description || '';
    const mergedCategory = aiText?.category || aiImage?.category || 'dress';

    const mergedColors = aiText?.colors || [];
    const mergedTags = [
      ...new Set([
        ...(aiImage?.tags || []),
        ...(aiText?.tags || []),
      ]),
    ];

    console.log('[ANALYZE] Colors from all images:', mergedColors);

    return NextResponse.json({
      success: true,
      data: {
        title: mergedTitle,
        description: mergedDescription,
        rawDescription: description,
        price: aiText?.price || 0,
        category: mergedCategory,
        colors: mergedColors,
        sizes: aiText?.sizes || [],
        fabric: aiText?.fabric || '',
        highlights: aiText?.highlights || [],
        pageContent: aiText?.pageContent || '',
        tags: mergedTags,
        media,
      },
    });
  } catch (error: any) {
    console.error('Analyze Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze product' }, { status: 500 });
  }
}
