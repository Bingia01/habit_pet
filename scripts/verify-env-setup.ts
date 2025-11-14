#!/usr/bin/env tsx
/**
 * Environment Setup Verification Script
 * 
 * Verifies that all required environment variables are set correctly.
 * Run with: npm run verify:env (add to package.json) or tsx scripts/verify-env-setup.ts
 */

interface EnvCheck {
  name: string;
  required: boolean;
  set: boolean;
  value?: string;
  clientSide?: boolean;
  description: string;
}

const checks: EnvCheck[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    value: process.env.NEXT_PUBLIC_SUPABASE_URL,
    clientSide: true,
    description: 'Supabase project URL (frontend)',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    clientSide: true,
    description: 'Supabase anon key (frontend)',
  },
  {
    name: 'SUPABASE_URL',
    required: false,
    set: !!process.env.SUPABASE_URL,
    value: process.env.SUPABASE_URL,
    description: 'Supabase project URL (backend, for Supabase analyzer)',
  },
  {
    name: 'SUPABASE_ANON_KEY',
    required: false,
    set: !!process.env.SUPABASE_ANON_KEY,
    value: process.env.SUPABASE_ANON_KEY,
    description: 'Supabase anon key (backend, for Supabase analyzer)',
  },
  {
    name: 'OPENAI_API_KEY',
    required: false,
    set: !!process.env.OPENAI_API_KEY,
    value: process.env.OPENAI_API_KEY,
    description: 'OpenAI API key (for OpenAI analyzer or Supabase function)',
  },
  {
    name: 'OPENAI_ANALYZER_MODEL',
    required: false,
    set: !!process.env.OPENAI_ANALYZER_MODEL,
    value: process.env.OPENAI_ANALYZER_MODEL || 'gpt-4o-mini (default)',
    description: 'OpenAI model name',
  },
  {
    name: 'ANALYZER_CHOICE',
    required: false,
    set: !!process.env.ANALYZER_CHOICE,
    value: process.env.ANALYZER_CHOICE || 'fallback chain (default)',
    description: 'Force specific analyzer (stub/supabase/openai)',
  },
  {
    name: 'USDA_API_KEY',
    required: false,
    set: !!process.env.USDA_API_KEY,
    value: process.env.USDA_API_KEY,
    description: 'USDA API key (optional, for enhanced validation)',
  },
  {
    name: 'NEXT_PUBLIC_GA_ID',
    required: false,
    set: !!process.env.NEXT_PUBLIC_GA_ID,
    value: process.env.NEXT_PUBLIC_GA_ID,
    clientSide: true,
    description: 'Google Analytics ID (optional)',
  },
];

function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('https://') && url.includes('.supabase.co');
  } catch {
    return false;
  }
}

function validateOpenAIKey(key: string): boolean {
  return key.startsWith('sk-') && key.length > 20;
}

function main() {
  console.log('🔍 Verifying Environment Setup\n');
  console.log('='.repeat(80));

  let hasErrors = false;
  let hasWarnings = false;

  // Check required variables
  console.log('\n📋 Required Variables:\n');
  for (const check of checks.filter((c) => c.required)) {
    const status = check.set ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
    if (!check.set) {
      console.log(`   Missing: ${check.description}`);
      hasErrors = true;
    } else {
      // Validate format
      if (check.name.includes('SUPABASE_URL') && check.value) {
        if (!validateUrl(check.value)) {
          console.log(`   ⚠️  Invalid URL format: ${check.value}`);
          hasWarnings = true;
        }
      }
      if (check.name === 'OPENAI_API_KEY' && check.value) {
        if (!validateOpenAIKey(check.value)) {
          console.log(`   ⚠️  Invalid OpenAI key format (should start with sk-)`);
          hasWarnings = true;
        }
      }
    }
  }

  // Check optional variables
  console.log('\n📋 Optional Variables:\n');
  for (const check of checks.filter((c) => !c.required)) {
    const status = check.set ? '✅' : '⚪';
    console.log(`${status} ${check.name}`);
    if (check.set) {
      console.log(`   Value: ${check.value?.substring(0, 20)}...`);
    } else {
      console.log(`   Not set: ${check.description}`);
    }
  }

  // Analyzer availability
  console.log('\n📊 Analyzer Availability:\n');
  const supabaseAvailable = !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_ANON_KEY &&
    validateUrl(process.env.SUPABASE_URL)
  );
  const openaiAvailable = !!(
    process.env.OPENAI_API_KEY && validateOpenAIKey(process.env.OPENAI_API_KEY)
  );

  console.log(`✅ Stub: Always available (fallback)`);
  console.log(`${supabaseAvailable ? '✅' : '❌'} Supabase: ${supabaseAvailable ? 'Available' : 'Not configured'}`);
  console.log(`${openaiAvailable ? '✅' : '❌'} OpenAI: ${openaiAvailable ? 'Available' : 'Not configured'}`);

  // Fallback chain
  console.log('\n🔗 Fallback Chain:\n');
  const chain: string[] = [];
  if (supabaseAvailable) chain.push('supabase');
  if (openaiAvailable) chain.push('openai');
  chain.push('stub');
  console.log(`   ${chain.join(' → ')}`);

  // Client-side variables warning
  const clientSideVars = checks.filter((c) => c.clientSide && c.set);
  if (clientSideVars.length > 0) {
    console.log('\n⚠️  Client-Side Variables (exposed to browser):\n');
    clientSideVars.forEach((check) => {
      console.log(`   - ${check.name}`);
    });
    console.log('   Note: These are safe to expose (public keys)');
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Summary:\n');

  if (hasErrors) {
    console.log('❌ Errors found: Required variables are missing');
    console.log('   Fix: Set missing variables in .env.local');
    console.log('   See: .env.local.example for reference');
  } else {
    console.log('✅ All required variables are set');
  }

  if (hasWarnings) {
    console.log('⚠️  Warnings: Some variables may have invalid format');
    console.log('   Review the values above');
  }

  if (!hasErrors && !hasWarnings) {
    console.log('✅ Environment setup is correct!');
  }

  // Recommendations
  console.log('\n💡 Recommendations:\n');
  if (!supabaseAvailable && !openaiAvailable) {
    console.log('   ⚠️  No analyzers configured - will use stub (mock data)');
    console.log('   → Set SUPABASE_URL/SUPABASE_ANON_KEY or OPENAI_API_KEY for real analysis');
  } else if (supabaseAvailable && !process.env.CLASSIFIER_API_KEY) {
    console.log('   ⚠️  Supabase analyzer configured but CLASSIFIER_API_KEY not set');
    console.log('   → Set via: supabase secrets set CLASSIFIER_API_KEY=your-key');
    console.log('   → This is needed for the Supabase Edge Function');
  }

  console.log('\n' + '='.repeat(80));

  // Exit code
  process.exit(hasErrors ? 1 : 0);
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main as verifyEnvSetup };

