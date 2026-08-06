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
    const context = catalog.slice(0, 12).map((p) => `${p.name}: ${p.category}, ₹${p.pricePerMeter}/m, Minimum order ${p.moq}m, ${p.description}`).join('\n');
    if (key) {
      try {
        const response = await fetch('https://router.huggingface.co/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: process.env.HUGGINGFACE_MODEL ?? 'meta-llama/Llama-3.1-8B-Instruct:featherless-ai', messages: [{ role: 'system', content: `You are a concise B2B textile sourcing assistant. Only recommend from this catalog:\n${context}` }, { role: 'user', content: message }], max_tokens: 240, temperature: 0.35 }) });
        const result = await response.json() as { choices?: { message?: { content?: string } }[] };
        const reply = result.choices?.[0]?.message?.content;
        if (reply) return { reply, products: matches };
      } catch { /* Product-aware fallback remains available. */ }
    }
    const reply = matches.length ? `I found ${matches.length} relevant option${matches.length === 1 ? '' : 's'} in the catalog. Compare price, minimum order, and availability below; tell me your target use, budget, and order size for a narrower shortlist.` : 'Tell me the fabric type, intended use, target price per meter, and minimum quantity. I will narrow the current catalog for you.';
    return { reply, products: matches };
  }
}
