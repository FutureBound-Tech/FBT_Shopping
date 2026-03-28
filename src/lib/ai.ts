import Groq from "groq-sdk";

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface AIProductData {
  title: string;
  price: number;
  category: 'saree' | 'dress';
  colors: string[];
  sizes: string[];
  fabric: string;
  highlights: string[];
  description: string;
  pageContent: string;
  tags: string[];
}

export interface AIImageData {
  title: string;
  description: string;
  tags: string[];
  category: 'saree' | 'dress';
}

// ─────────────────────────────────────────────────────────────
//  Image Analysis Engine (Multimodal - from AI Brain)
// ─────────────────────────────────────────────────────────────
export async function analyzeImage(imageUrl: string): Promise<AIImageData | null> {
  if (!imageUrl) return null;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional fashion e-commerce catalog expert. You must provide product analysis in valid JSON format only.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this clothing/textile product image and provide:
              1. A catchy professional product title.
              2. A detailed, premium product description highlighting possible fabric, style, and occasions.
              3. A list of relevant tags (color, category, style, material).
              
              Return the response ONLY as a JSON object with the keys: "title", "description", "tags" (array of strings), and "category" (either "saree" or "dress").`
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.5,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    });

    const raw = chatCompletion.choices[0]?.message?.content?.trim() || '';
    const parsed = JSON.parse(raw);

    return {
      title: String(parsed.title || ''),
      description: String(parsed.description || ''),
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      category: parsed.category === 'saree' ? 'saree' : 'dress',
    };
  } catch (err) {
    console.error('[AI] Image analysis failed:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
//  Color extraction from MULTIPLE images using Groq Vision
// ─────────────────────────────────────────────────────────────
async function extractColorsFromImage(imageUrl: string): Promise<string[]> {
  if (!imageUrl) return [];

  try {
    const completion = await groq.chat.completions.create({
      // Use the same Groq multimodal model as the AI Brain reference
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a professional color analyst for Indian ethnic fashion. Analyze this garment image carefully.

TASK: Identify ONLY the single most dominant base color of the saree body (the main fabric color).

RULES:
- Use precise Indian fashion color names where applicable: Rani Pink, Royal Yellow, Peacock Teal, Mehendi Green, Mustard, Saffron, Magenta, Bottle Green, Navy Blue, Wine, Maroon, Turquoise, Lavender, Coral, Peach, Ivory, Cream, Beige, Charcoal
- IGNORE border, blouse piece, embroidery, piping, zari, motifs/prints, and background
- If the saree is clearly multi-color but has one dominant base, return ONLY that base
- Return exactly 1 color

RESPOND WITH ONLY JSON:
{"colors":["Royal Yellow"]}`,
            },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 80,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '';
    let colors: string[] = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        colors = parsed;
      } else if (Array.isArray(parsed?.colors)) {
        colors = parsed.colors;
      }
    } catch {
      // Fallback to comma-separated parsing if JSON parsing fails
      colors = raw.split(',').map(c => c.trim());
    }

    // Keep only the most dominant color (first)
    const cleaned = colors.map(c => String(c).trim()).filter(Boolean);
    return cleaned.length ? [cleaned[0]] : [];
  } catch (err) {
    console.error('[AI] Vision color extraction failed:', err);
    return [];
  }
}

export async function extractColorsFromAllImages(imageUrls: string[]): Promise<string[]> {
  if (!imageUrls.length) return [];

  // Filter only image URLs (skip videos)
  const imageOnlyUrls = imageUrls.filter(url =>
    !url.match(/\.(mp4|mov|avi|webm|mkv)(\?|$)/i) &&
    !url.includes('/video/')
  );

  if (!imageOnlyUrls.length) return [];

  // Analyze ALL images in parallel
  const results = await Promise.allSettled(
    imageOnlyUrls.map(url => extractColorsFromImage(url))
  );

  // Collect only the dominant color from each image
  const allColors: string[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      if (result.value.length > 0) allColors.push(result.value[0]);
    }
  }

  // Deduplicate with case-insensitive comparison, preserve first occurrence casing
  const seen = new Map<string, string>();
  for (const color of allColors) {
    const key = color.toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.set(key, color.trim());
    }
  }

  const uniqueColors = Array.from(seen.values());
  console.log(`[AI] Extracted ${uniqueColors.length} unique colors from ${imageOnlyUrls.length} images:`, uniqueColors);
  return uniqueColors;
}

// ─────────────────────────────────────────────────────────────
//  Main AI extraction using Groq
// ─────────────────────────────────────────────────────────────
export async function parseProductFromDescription(
  rawInput: string,
  imageUrls: string[] = []
): Promise<AIProductData> {

  const systemPrompt = `You are an expert e-commerce product analyst and copywriter for FBT Shopping — a premium Indian ethnic wear brand specializing in sarees, lehengas, and dresses.

YOUR JOB: Parse messy supplier/wholesale product descriptions and extract clean structured data.

YOU MUST DO THESE 3 THINGS PERFECTLY:

1. PRICE — Find the numeric INR price. Look for patterns like "₹1350", "Rate: ₹1499/-", "Rs 999", "INR 1200", "1350/-". Return ONLY the number.

2. SIZES or LENGTH — This is critical:
   - If the product is a SAREE → extract the LENGTH in meters (e.g., "Saree 5.5 Meters" → sizes: ["5.5 Meters"]). Also include blouse length if mentioned (e.g., "Blouse 1 Meter").
   - If the product is a DRESS / LEHENGA / GOWN → extract SIZE labels. Look for:
     * Size ranges like "M to 3XL" → expand to ["M", "L", "XL", "2XL", "3XL"]
     * Waist measurements like "supported up to 42 waist" → sizes: ["Up to 42"]
     * Numeric sizes like "38, 39, 40" → keep as-is
     * If only waist/flair is mentioned, use that: "3.80 Meter Flair" → note in highlights, not sizes

3. COLORS — Extract ALL colors mentioned in the description. Look for:
   - Explicit color lists like "Colors Available: Royal Yellow, Rani Pink, Festive Red"
   - Inline mentions like "available in Red, Blue and Green"
   - Color emojis like 💛 Royal Yellow, ❤️ Festive Red
   - Common Indian color names: Rani Pink, Royal Yellow, Peacock Teal, Mehendi Green, Mustard, Saffron, Magenta, etc.
   - Be VERY careful — return exact color names as mentioned. "Rani Pink" NOT just "Pink".

THEN:
4. Write a 2-3 sentence SUMMARY description that captures the essence — fabric, work, style, vibe. NO prices, NO catalogue numbers, NO size charts.
5. Suggest a catchy TITLE (max 8 words) that would work on Amazon/Flipkart/Myntra.
6. Write a full PRODUCT PAGE description like Amazon/Flipkart/Myntra — covering:
   - Material & Fabric details
   - Work/Embroidery/Print details  
   - What's included in the set (top, bottom, dupatta, blouse piece)
   - Measurements & fit info
   - Styling notes & occasions
   - Care instructions if mentioned
   Format it with clear sections using this style:
   ***
   **About this item**
   [1-2 sentence overview]
   
   **Fabric & Material**
   [Details about fabric quality, feel, weight]
   
   **Design & Work**
   [Embroidery, print, stitching details]
   
   **What's in the Box**
   [List of pieces included]
   
   **Size & Fit**
   [Measurements, fit type, support range]
   
   **Occasion & Styling**
   [When to wear, how to style]
   ***

RESPOND WITH ONLY THIS JSON — NO markdown fences, NO explanation:
{
  "title": "",
  "price": 0,
  "category": "saree" or "dress",
  "colors": [],
  "sizes": [],
  "fabric": "",
  "highlights": [],
  "description": "",
  "pageContent": ""
}`;

  const userPrompt = `Parse this product description and extract all data:

---
${rawInput}
---

Remember: 
- If it's a SAREE, sizes = length in meters
- If it's a DRESS/LEHENGA/GOWN, sizes = size labels or waist range
- Extract ALL colors carefully
- Return ONLY the JSON object`;

  // Run text extraction and vision color extraction in parallel
  const [textResult, visionResult] = await Promise.allSettled([
    groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.15,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    }),
    imageUrls.length ? extractColorsFromAllImages(imageUrls) : Promise.resolve([] as string[]),
  ]);

  // Parse text result
  let parsed: Record<string, unknown> | null = null;
  if (textResult.status === 'fulfilled') {
    const raw = textResult.value.choices[0]?.message?.content?.trim() || '';
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Fallback: try to extract JSON from markdown fences or inline
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch { console.error('[AI] JSON Parse failed'); }
      }
    }
  } else {
    console.error('[AI] Text extraction failed:', textResult.reason);
  }

  // Get vision colors
  const visionColors = visionResult.status === 'fulfilled' ? (visionResult.value as string[]) : [];
  if (visionResult.status === 'rejected') {
    console.error('[AI] Vision failed:', visionResult.reason);
  }

  // Merge colors: prioritize text-extracted colors, supplement with vision
  const textColors: string[] = Array.isArray(parsed?.colors) ? parsed.colors : [];
  const mergedColors = Array.from(new Set([...textColors, ...visionColors]));

  // Detect category from raw input
  const lowerInput = rawInput.toLowerCase();
  const detectedCategory: 'saree' | 'dress' =
    lowerInput.includes('saree') || lowerInput.includes('sari') ? 'saree' : 'dress';

  if (!parsed) {
    return {
      title: detectedCategory === 'saree' ? 'Premium Designer Saree' : 'Premium Ethnic Dress Set',
      price: 0,
      category: detectedCategory,
      colors: mergedColors,
      sizes: [],
      fabric: '',
      highlights: [],
      description: rawInput.slice(0, 200),
      pageContent: '',
      tags: [],
    };
  }

  return {
    title: String(parsed.title || (detectedCategory === 'saree' ? 'Premium Designer Saree' : 'Premium Ethnic Dress Set')),
    price: Number(parsed.price) || 0,
    category: parsed.category === 'saree' ? 'saree' : 'dress',
    colors: mergedColors,
    sizes: Array.isArray(parsed.sizes) ? parsed.sizes : [],
    fabric: String(parsed.fabric || ''),
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
    description: String(parsed.description || ''),
    pageContent: String(parsed.pageContent || ''),
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
  };
}
