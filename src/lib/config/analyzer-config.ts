/**
 * Analyzer Configuration Validator
 * 
 * Validates and manages analyzer configuration, checking for required
 * environment variables and returning availability status.
 */

export type AnalyzerType = 'stub' | 'supabase' | 'openai';

export interface AnalyzerConfig {
  type: AnalyzerType;
  available: boolean;
  warnings: string[];
  errors: string[];
}

export interface AnalyzerAvailability {
  stub: boolean;
  supabase: boolean;
  openai: boolean;
}

/**
 * Validates analyzer configuration and returns status
 */
export function validateAnalyzerConfig(): AnalyzerConfig {
  const analyzerChoice = (process.env.ANALYZER_CHOICE ?? 'stub').toLowerCase();
  const warnings: string[] = [];
  const errors: string[] = [];
  let available = true;

  // Validate analyzer choice
  if (!['stub', 'supabase', 'openai'].includes(analyzerChoice)) {
    warnings.push(`Invalid ANALYZER_CHOICE: ${analyzerChoice}. Defaulting to 'stub'`);
    return {
      type: 'stub',
      available: true,
      warnings,
      errors,
    };
  }

  // Check Supabase configuration if needed
  if (analyzerChoice === 'supabase') {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      errors.push(
        'Supabase analyzer selected but credentials missing. Set SUPABASE_URL and SUPABASE_ANON_KEY',
      );
      available = false;
    } else {
      // Validate URL format
      try {
        new URL(supabaseUrl);
      } catch {
        errors.push(`Invalid SUPABASE_URL format: ${supabaseUrl}`);
        available = false;
      }
    }
  }

  // Check OpenAI configuration if needed
  if (analyzerChoice === 'openai') {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      errors.push('OpenAI analyzer selected but OPENAI_API_KEY not set');
      available = false;
    }
  }

  // Check for Supabase function requirements (CLASSIFIER_API_KEY)
  // This is needed for the Supabase edge function to work
  const classifierApiKey = process.env.CLASSIFIER_API_KEY;
  if (analyzerChoice === 'supabase' && !classifierApiKey) {
    warnings.push(
      'CLASSIFIER_API_KEY not set. Supabase function may fail without it. The function needs OpenAI API key to analyze images.',
    );
  }

  return {
    type: analyzerChoice as AnalyzerType,
    available,
    warnings,
    errors,
  };
}

/**
 * Gets availability status for all analyzers
 */
export function getAnalyzerAvailability(): AnalyzerAvailability {
  return {
    stub: true, // Always available
    supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
    openai: !!process.env.OPENAI_API_KEY,
  };
}

/**
 * Determines fallback chain based on availability
 */
export function getFallbackChain(): AnalyzerType[] {
  const availability = getAnalyzerAvailability();
  const chain: AnalyzerType[] = [];

  // Debug logging to understand why analyzers aren't available
  if (typeof window === 'undefined') {
    // Server-side only
    console.log('[getFallbackChain] Analyzer availability check:', {
      supabase: availability.supabase,
      openai: availability.openai,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    });
  }

  // Try Supabase first if available
  if (availability.supabase) {
    chain.push('supabase');
  }

  // Then try OpenAI
  if (availability.openai) {
    chain.push('openai');
  }

  // Always fall back to stub
  chain.push('stub');

  if (typeof window === 'undefined' && chain.length === 1) {
    console.warn('[getFallbackChain] ⚠️ Only stub analyzer available. Check environment variables:');
    console.warn('  - SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
    console.warn('  - SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
    console.warn('  - OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Missing');
  }

  return chain;
}

/**
 * Logs configuration status (server-side only)
 */
export function logAnalyzerConfig(): void {
  if (typeof window !== 'undefined') {
    return; // Only log on server
  }

  const config = validateAnalyzerConfig();
  const availability = getAnalyzerAvailability();

  console.log('[Analyzer Config]');
  console.log(`  Selected: ${config.type}`);
  console.log(`  Available: ${config.available}`);
  console.log(`  Supabase: ${availability.supabase ? '✓' : '✗'}`);
  console.log(`  OpenAI: ${availability.openai ? '✓' : '✗'}`);

  if (config.warnings.length > 0) {
    console.warn('[Analyzer Warnings]');
    config.warnings.forEach((w) => console.warn(`  ⚠️ ${w}`));
  }

  if (config.errors.length > 0) {
    console.error('[Analyzer Errors]');
    config.errors.forEach((e) => console.error(`  ❌ ${e}`));
  }
}



