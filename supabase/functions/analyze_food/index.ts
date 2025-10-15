import { serve } from "https://deno.land/std/http/server.ts";
import { getPriorsForLabel } from "./priors.ts";

interface AnalyzerRequest {
  imageUrl?: string;
  imageBase64?: string;
  region?: string;
}

interface AnalyzerItem {
  label: string;
  confidence: number;
  calories?: number;
  weightGrams?: number;
  volumeML?: number;
  priors?: {
    kcalPerG: { mu: number; sigma: number };
    density: { mu: number; sigma: number };
  };
  evidence?: string[];
}

interface AnalyzerResponse {
  items: AnalyzerItem[];
  meta?: { used: Array<"supabase" | "openai" | "stub">; latencyMs?: number };
}

// TODO: replace this section with your real analyzer logic.
// For now we return a fake "Apple" result so the pipeline stays intact.
const FAKE_LABEL = "Apple";
const FAKE_CONFIDENCE = 0.9;

serve(async (req) => {
  const start = performance.now();

  try {
    const { imageUrl, imageBase64 }: AnalyzerRequest = await req.json();

    if (!imageUrl && !imageBase64) {
      return new Response(JSON.stringify({ error: "Provide imageUrl or imageBase64" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const priors = await getPriorsForLabel(FAKE_LABEL);

    const calories =
      priors ? priors.kcalPerG.mu * priors.density.mu : undefined;

    const response: AnalyzerResponse = {
      items: [
        {
          label: FAKE_LABEL,
          confidence: FAKE_CONFIDENCE,
          calories,
          weightGrams: priors ? priors.density.mu : undefined,
          volumeML: priors ? priors.density.mu : undefined,
          priors,
          evidence: ["Analyzer"],
        },
      ],
      meta: {
        used: ["supabase"],
        latencyMs: performance.now() - start,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analyzer error", error);
    return new Response(JSON.stringify({ error: "Analyzer error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
