import type { Analyzer, AnalyzeInput, AnalyzeOutput } from '@/lib/types/analyzer';

interface OpenAIChoice {
  message?: {
    content?: Array<
      | { type: 'text'; text: string }
      | { type: 'tool_result'; tool_call_id: string; content: { type: 'output_text'; text: string }[] }
    >;
  };
}

interface OpenAIResponse {
  choices?: OpenAIChoice[];
}

const MODEL = process.env.OPENAI_ANALYZER_MODEL ?? 'gpt-4o-mini';

export class OpenAIAnalyzer implements Analyzer {
  async analyze(input: AnalyzeInput): Promise<AnalyzeOutput> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const payload = {
      model: MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a nutrition assistant. Return JSON with { "items": [ { "label": string, "confidence": number (0-1), "calories": number (kcal), "weightGrams": number, "volumeML": number, "priors": { "kcalPerG": { "mu": number, "sigma": number }, "density": { "mu": number, "sigma": number } }, "evidence": string[] } ] }.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this food image and respond with the JSON payload described.',
            },
            ...(input.imageUrl
              ? [
                  {
                    type: 'image_url' as const,
                    image_url: {
                      url: input.imageUrl,
                    },
                  },
                ]
              : []),
            ...(input.imageBase64
              ? [
                  {
                    type: 'image_url' as const,
                    image_url: {
                      url: `data:image/jpeg;base64,${input.imageBase64}`,
                    },
                  },
                ]
              : []),
          ],
        },
      ],
      temperature: 0,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI analyzer failed: ${response.status} - ${text}`);
    }

    const data = (await response.json()) as OpenAIResponse;
    const content =
      data.choices?.[0]?.message?.content?.find((entry) => entry.type === 'text') ??
      data.choices?.[0]?.message?.content?.find(
        (entry): entry is Extract<typeof entry, { type: 'tool_result' }> =>
          entry.type === 'tool_result',
      );

    let parsed: AnalyzeOutput | null = null;

    if (content && content.type === 'text') {
      parsed = this.safeParseJSON(content.text);
    } else if (content && content.type === 'tool_result') {
      const combined = content.content.map((c) => c.text).join('\n');
      parsed = this.safeParseJSON(combined);
    }

    if (!parsed || !parsed.items?.length) {
      throw new Error('OpenAI analyzer returned unparseable payload');
    }

    return {
      ...parsed,
      meta: {
        used: ['openai'],
        ...parsed.meta,
      },
    };
  }

  private safeParseJSON(text: string | undefined): AnalyzeOutput | null {
    if (!text) return null;
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    try {
      const json = text.slice(start, end + 1);
      const parsed = JSON.parse(json);
      if (typeof parsed !== 'object' || parsed === null || !Array.isArray(parsed.items)) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}

export const openAIAnalyzer = new OpenAIAnalyzer();
