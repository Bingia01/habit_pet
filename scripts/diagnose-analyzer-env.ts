/**
 * Diagnostic script to check analyzer environment variables
 * Run with: npx tsx scripts/diagnose-analyzer-env.ts
 */

const checkEnv = () => {
  console.log('🔍 Analyzer Environment Variable Diagnostic\n');
  console.log('='.repeat(60));

  const checks = [
    {
      name: 'SUPABASE_URL',
      value: process.env.SUPABASE_URL,
      required: true,
      validator: (v: string | undefined) => {
        if (!v) return { valid: false, reason: 'Missing' };
        try {
          new URL(v);
          return { valid: true };
        } catch {
          return { valid: false, reason: 'Invalid URL format' };
        }
      },
    },
    {
      name: 'SUPABASE_ANON_KEY',
      value: process.env.SUPABASE_ANON_KEY,
      required: true,
      validator: (v: string | undefined) => {
        if (!v) return { valid: false, reason: 'Missing' };
        if (v.length < 50) return { valid: false, reason: 'Too short (should be ~200+ chars)' };
        return { valid: true };
      },
    },
    {
      name: 'OPENAI_API_KEY',
      value: process.env.OPENAI_API_KEY,
      required: false,
      validator: (v: string | undefined) => {
        if (!v) return { valid: false, reason: 'Missing (optional)' };
        if (!v.startsWith('sk-')) return { valid: false, reason: 'Should start with sk-' };
        return { valid: true };
      },
    },
  ];

  let allValid = true;
  for (const check of checks) {
    const validation = check.validator(check.value);
    const status = validation.valid ? '✅' : check.required ? '❌' : '⚠️';
    const displayValue = check.value
      ? `${check.value.substring(0, 20)}...${check.value.substring(check.value.length - 4)}`
      : 'NOT SET';

    console.log(`\n${status} ${check.name}`);
    console.log(`   Value: ${displayValue}`);
    if (!validation.valid) {
      console.log(`   Issue: ${validation.reason}`);
      if (check.required) allValid = false;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Analyzer Availability:');
  const availability = {
    supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
    openai: !!process.env.OPENAI_API_KEY,
    stub: true,
  };

  console.log(`   Supabase: ${availability.supabase ? '✅ Available' : '❌ Not Available'}`);
  console.log(`   OpenAI: ${availability.openai ? '✅ Available' : '⚠️ Not Available (optional)'}`);
  console.log(`   Stub: ✅ Always Available`);

  console.log('\n🔗 Expected Fallback Chain:');
  const chain: string[] = [];
  if (availability.supabase) chain.push('supabase');
  if (availability.openai) chain.push('openai');
  chain.push('stub');
  console.log(`   ${chain.join(' → ')}`);

  if (chain.length === 1) {
    console.log('\n⚠️  WARNING: Only stub analyzer available!');
    console.log('   This means Supabase and OpenAI analyzers will not be used.');
    console.log('   Make sure:');
    console.log('   1. .env.local file exists in project root');
    console.log('   2. Environment variables are set correctly');
    console.log('   3. Dev server was restarted after adding env vars');
  }

  console.log('\n' + '='.repeat(60));
  return allValid;
};

// Run check
const isValid = checkEnv();
process.exit(isValid ? 0 : 1);

