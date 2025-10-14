import type { Analyzer, AnalyzeInput, AnalyzeOutput } from '@/lib/types/analyzer';

const FUNCTION_PATH = '/functions/v1/analyze_food';

export class SupabaseAnalyzer implements Analyzer {
  async analyze(input: AnalyzeInput): Promise<AnalyzeOutput> {
    const baseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;

    if (!baseUrl || !anonKey) {
      throw new Error('Supabase credentials missing');
    }

    const endpoint = new URL(FUNCTION_PATH, baseUrl).toString();
    const payload = {
      imageUrl: input.imageUrl,
      imageBase64: input.imageBase64,
      region: input.region,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase analyzer failed: ${response.status} - ${text}`);
    }

    const data = (await response.json()) as AnalyzeOutput;
    if (!data?.items?.length) {
      throw new Error('Supabase analyzer returned empty payload');
    }

    return {
      ...data,
      meta: {
        used: ['supabase'],
        ...data.meta,
      },
    };
  }
}

export const supabaseAnalyzer = new SupabaseAnalyzer();
