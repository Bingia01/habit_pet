import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface Priors {
  kcalPerG: { mu: number; sigma: number };
  density: { mu: number; sigma: number };
}

export async function getPriorsForLabel(label: string): Promise<Priors | null> {
  const { data } = await supabase
    .from("food_priors")
    .select("kcal_per_g_mu, kcal_per_g_sigma, density_mu, density_sigma")
    .ilike("label", label)
    .maybeSingle();

  if (!data) return null;

  return {
    kcalPerG: { mu: data.kcal_per_g_mu, sigma: data.kcal_per_g_sigma },
    density: { mu: data.density_mu, sigma: data.density_sigma },
  };
}
