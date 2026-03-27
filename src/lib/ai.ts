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
  description: string; // The cleaned, professional version
}

// ─────────────────────────────────────────────────────────────
//  OpenRouter Vision (google/gemma-3-27b-it:free)
// ─────────────────────────────────────────────────────────────
async function extractColorsFromImage(imageUrl: string): Promise<string[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !imageUrl) return [];

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://fbt-shopping.vercel.app',
        'X-Title': 'FBT Shopping',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it:free',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Identify the main garment colors. Reply with ONLY a comma-separated list of color names. Example: "Red, Gold". Max 4 colors.',
              },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 60,
      }),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content?.trim() || '';
    return raw.split(',').map(c => c.trim()).filter(Boolean);
  } catch (err) {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
//  Main AI extraction using Groq
// ─────────────────────────────────────────────────────────────
export async function parseProductFromDescription(
  rawInput: string,
  imageUrl?: string
): Promise<AIProductData> {

  const textPrompt = `You are a professional e-commerce content strategist for a luxury Indian textile brand.

TASK: Analyze the provided messy product details and transform them into structured data and a premium, SEO-optimized product description.

INPUT TEXT:
"${rawInput}"

RULES FOR OUTPUT JSON:
1. "title": A catchy, elegant product name (max 8 words).
2. "price": Extract numeric INR value.
3. "category": "saree" or "dress".
4. "sizes": Clean list of labels like ["M", "L", "XL"]. Expand "M to 3XL" to ["M", "L", "XL", "2XL", "3XL"].
5. "fabric": The primary material (e.g., "Silk", "Rayon Cotton").
6. "highlights": 3-5 premium bullet points. Include fit details (e.g., "A-Line silhouette", "Elasticated comfort waist"), design accents (e.g., "Heavy embroidery work", "Matching dupatta"), and fabric qualities.
7. "description": Write a 2-3 sentence professional marketing description for a premium shopper. 
   - CRITICAL: DO NOT include price, "Rate", "Rs", "INR", catalogue numbers, or raw size charts/numeric lists in this text.
   - Focus on style, comfort, and the overall aesthetic (e.g. "Pinteresty look", "Perfect for ethnic elegance").
   - Mention how the elements (top, bottom, dupatta) come together as a set.
   - DO NOT mention catalogue numbers or "Catalogue no".

JSON STRUCTURE:
{
  "title": "",
  "price": 0,
  "category": "saree" | "dress",
  "sizes": [],
  "fabric": "",
  "highlights": [],
  "description": ""
}

Return ONLY the JSON.`;

  const [textResult, visionResult] = await Promise.allSettled([
    groq.chat.completions.create({
      messages: [{ role: 'user', content: textPrompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 1000,
    }),
    imageUrl ? extractColorsFromImage(imageUrl) : Promise.resolve([] as string[]),
  ]);

  let parsed: any = null;
  if (textResult.status === 'fulfilled') {
    const raw = textResult.value.choices[0]?.message?.content?.trim() || '';
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try { parsed = JSON.parse(match[0]); } catch { console.error('JSON Parse failed'); }
    }
  }

  const visionColors = visionResult.status === 'fulfilled' ? (visionResult.value as string[]) : [];
  
  if (!parsed) {
    // Basic fallback logic
    return {
      title: "Premium Ethnic Wear",
      price: 0,
      category: rawInput.toLowerCase().includes('saree') ? 'saree' : 'dress',
      colors: visionColors,
      sizes: [],
      fabric: "",
      highlights: [],
      description: rawInput.slice(0, 100) + "..."
    };
  }

  return {
    title: String(parsed.title),
    price: Number(parsed.price),
    category: parsed.category === 'saree' ? 'saree' : 'dress',
    colors: Array.from(new Set([...visionColors])),
    sizes: Array.isArray(parsed.sizes) ? parsed.sizes : [],
    fabric: String(parsed.fabric),
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
    description: String(parsed.description)
  };
}
