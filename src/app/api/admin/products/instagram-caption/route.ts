import { NextResponse } from 'next/server';
import { groq } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, category, colors, fabric, price, tags } = body;

    if (!title) {
      return NextResponse.json({ error: 'Product title is required' }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 800,
      messages: [
        {
          role: 'system',
          content: `You are an expert Instagram content creator for a premium Indian ethnic wear brand called "FBT Shopping". Your job is to write viral-worthy Instagram captions with high-impact hashtags that drive engagement and sales.

RULES:
1. Caption must be catchy, emotional, and create FOMO (fear of missing out)
2. Use emojis strategically (not too many)
3. Include a call-to-action (DM to order, Link in bio, etc.)
4. Hashtags: exactly 30 hashtags, mix of:
   - High volume: #saree #indianfashion #ethnicwear #fashion #ootd #instagood #trending #viral #reels #shopping
   - Medium volume: #sareelove #indianwear #ethnicstyle #traditionalwear #desifashion #handloom #sareefashion #dressmaterial #lehenga
   - Niche/branded: #fbtshopping #ethniccollection #premiumethnic #indianbride #weddingseason #festivewear #partywear #sareenotsorry
   - Color-specific if colors provided
   - Category-specific (saree or dress related)
5. Format: Caption paragraph, then blank line, then hashtags grouped together
6. For REEL format: Make the first line a HOOK that stops the scroll

RESPOND WITH ONLY the caption text, no JSON, no explanation.`
        },
        {
          role: 'user',
          content: `Write an Instagram REEL caption for this product:

Title: ${title}
Category: ${category || 'ethnic wear'}
Description: ${description || 'No description'}
Fabric: ${fabric || 'not specified'}
Colors: ${(colors || []).join(', ') || 'not specified'}
Price: ₹${price || 'DM for price'}
Tags: ${(tags || []).join(', ') || 'none'}

Make it feel exclusive and premium. Drive DMs and website visits.`
        }
      ],
    });

    const caption = completion.choices[0]?.message?.content?.trim() || '';

    return NextResponse.json({ success: true, caption });
  } catch (error: any) {
    console.error('Instagram caption generation failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate caption' }, { status: 500 });
  }
}
