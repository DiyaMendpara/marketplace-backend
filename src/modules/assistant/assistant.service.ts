import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';

@Injectable()
export class AssistantService {
  constructor(private readonly products: ProductsService) {}
  async chat(message: string) {
    const { data: all } = await this.products.findAll({});
    const catalog = all.map((p) => p.toObject());
    const matches = catalog.filter((p) => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(message.toLowerCase().split(/\s+/).find((word) => word.length > 3) ?? '')).slice(0, 3);
    const key = process.env.HUGGINGFACE_API_KEY;
    const context = catalog.slice(0, 12).map((p) => `ID: ${p._id}, ${p.name}: ${p.category}, ₹${p.pricePerMeter}/m, ${p.description}`).join('\n');

    if (key) {
      try {
        const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.HUGGINGFACE_MODEL ?? 'meta-llama/Llama-3.1-8B-Instruct:featherless-ai',
            messages: [
              {
                role: 'system',
                content: `You are a B2B textile sourcing assistant. You MUST respond ONLY in valid JSON format. Do not include markdown code blocks, just raw JSON.
Format:
{
  "reply": "Your short conversational message without listing products.",
  "productIds": ["ID1", "ID2"]
}

Available Catalog:
${context}`,
              },
              { role: 'user', content: message },
            ],
            max_tokens: 240,
            temperature: 0.1,
          }),
        });

        const result = (await response.json()) as { choices?: { message?: { content?: string } }[] };
        const rawContent = result.choices?.[0]?.message?.content?.trim() || '{}';
        
        // Strip markdown code blocks if the model still includes them
        const jsonStr = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
        
        const parsed = JSON.parse(jsonStr);
        if (parsed.reply) {
          const recommendedProducts = parsed.productIds
            ? catalog.filter((p) => parsed.productIds.includes(p._id.toString()))
            : matches;
          return { reply: parsed.reply, products: recommendedProducts };
        }
      } catch (e) {
        // Fallback
      }
    }

    const reply = matches.length
      ? `I found ${matches.length} option${matches.length === 1 ? '' : 's'}. Compare them below:`
      : 'Tell me the fabric type, intended use, and target price. I will narrow the catalog.';
    return { reply, products: matches };
  }
}
