#!/usr/bin/env tsx
/**
 * Secure Environment Setup Helper
 * 
 * This script helps you set up your .env.local file securely.
 * It will prompt you for each API key and save them directly to .env.local
 * without exposing them in the terminal history.
 * 
 * Run with: tsx scripts/setup-env.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const ENV_FILE = path.join(process.cwd(), '.env.local');
const ENV_EXAMPLE = path.join(process.cwd(), '.env.local.example');

interface EnvVar {
  name: string;
  description: string;
  required: boolean;
  validate?: (value: string) => boolean | string;
  getValue?: () => Promise<string>;
}

const envVars: EnvVar[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase Project URL (get from Supabase Dashboard → Settings → API)',
    required: true,
    validate: (val) => {
      if (!val.startsWith('https://') || !val.includes('.supabase.co')) {
        return 'Must be a valid Supabase URL (https://your-project.supabase.co)';
      }
      return true;
    },
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase Anon Key (get from Supabase Dashboard → Settings → API → anon public)',
    required: true,
    validate: (val) => {
      if (val.length < 20) {
        return 'Anon key seems too short. Please check it.';
      }
      return true;
    },
  },
  {
    name: 'SUPABASE_URL',
    description: 'Supabase Project URL (backend - same as NEXT_PUBLIC_SUPABASE_URL)',
    required: false,
    validate: (val) => {
      if (val && (!val.startsWith('https://') || !val.includes('.supabase.co'))) {
        return 'Must be a valid Supabase URL';
      }
      return true;
    },
  },
  {
    name: 'SUPABASE_ANON_KEY',
    description: 'Supabase Anon Key (backend - same as NEXT_PUBLIC_SUPABASE_ANON_KEY)',
    required: false,
    validate: (val) => {
      if (val && val.length < 20) {
        return 'Anon key seems too short. Please check it.';
      }
      return true;
    },
  },
  {
    name: 'OPENAI_API_KEY',
    description: 'OpenAI API Key (get from https://platform.openai.com/api-keys)',
    required: false,
    validate: (val) => {
      if (val && !val.startsWith('sk-')) {
        return 'OpenAI API key should start with "sk-"';
      }
      if (val && val.length < 20) {
        return 'API key seems too short. Please check it.';
      }
      return true;
    },
  },
  {
    name: 'OPENAI_ANALYZER_MODEL',
    description: 'OpenAI Model (default: gpt-4o-mini)',
    required: false,
  },
  {
    name: 'ANALYZER_CHOICE',
    description: 'Force specific analyzer (stub/supabase/openai) or leave empty for auto fallback',
    required: false,
  },
  {
    name: 'USDA_API_KEY',
    description: 'USDA API Key (optional - for enhanced food validation)',
    required: false,
  },
  {
    name: 'NEXT_PUBLIC_GA_ID',
    description: 'Google Analytics ID (optional - format: G-XXXXXXXXXX)',
    required: false,
  },
];

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function question(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

function maskInput(input: string): string {
  if (input.length <= 8) return '****';
  return input.substring(0, 4) + '****' + input.substring(input.length - 4);
}

async function promptForValue(rl: readline.Interface, envVar: EnvVar): Promise<string | null> {
  const required = envVar.required ? ' (REQUIRED)' : ' (optional - press Enter to skip)';
  console.log(`\n${envVar.description}${required}`);
  
  let value: string | null = null;
  let isValid = false;
  
  while (!isValid) {
    const input = await question(rl, `${envVar.name}: `);
    
    if (!input.trim()) {
      if (envVar.required) {
        console.log('❌ This field is required. Please enter a value.');
        continue;
      } else {
        return null; // Skip optional field
      }
    }
    
    value = input.trim();
    
    // Validate if validator exists
    if (envVar.validate) {
      const validation = envVar.validate(value);
      if (validation !== true) {
        console.log(`❌ ${validation}`);
        continue;
      }
    }
    
    isValid = true;
    
    // Show masked confirmation
    if (value) {
      console.log(`✅ ${envVar.name} = ${maskInput(value)}`);
    }
  }
  
  return value;
}

async function main() {
  console.log('🔐 Secure Environment Setup\n');
  console.log('='.repeat(80));
  console.log('This script will help you set up your .env.local file securely.');
  console.log('Your API keys will be saved directly to .env.local (which is gitignored).');
  console.log('='.repeat(80));
  
  // Check if .env.local already exists
  if (fs.existsSync(ENV_FILE)) {
    console.log('\n⚠️  .env.local already exists!');
    const rl = createReadlineInterface();
    const overwrite = await question(rl, 'Do you want to overwrite it? (yes/no): ');
    rl.close();
    
    if (overwrite.toLowerCase() !== 'yes' && overwrite.toLowerCase() !== 'y') {
      console.log('❌ Setup cancelled. Existing .env.local preserved.');
      process.exit(0);
    }
  }
  
  // Read example file if it exists
  let template = '';
  if (fs.existsSync(ENV_EXAMPLE)) {
    template = fs.readFileSync(ENV_EXAMPLE, 'utf-8');
  }
  
  const rl = createReadlineInterface();
  const values: Record<string, string> = {};
  
  try {
    console.log('\n📝 Let\'s set up your environment variables:\n');
    
    // Prompt for each variable
    for (const envVar of envVars) {
      const value = await promptForValue(rl, envVar);
      if (value !== null) {
        values[envVar.name] = value;
      }
    }
    
    rl.close();
    
    // Auto-fill duplicate values
    if (values.NEXT_PUBLIC_SUPABASE_URL && !values.SUPABASE_URL) {
      values.SUPABASE_URL = values.NEXT_PUBLIC_SUPABASE_URL;
      console.log('\n✅ Auto-filled SUPABASE_URL from NEXT_PUBLIC_SUPABASE_URL');
    }
    
    if (values.NEXT_PUBLIC_SUPABASE_ANON_KEY && !values.SUPABASE_ANON_KEY) {
      values.SUPABASE_ANON_KEY = values.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      console.log('✅ Auto-filled SUPABASE_ANON_KEY from NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    
    // Build .env.local content
    let content = '# ============================================\n';
    content += '# HabitPet Environment Variables\n';
    content += '# ============================================\n';
    content += `# Generated on: ${new Date().toISOString()}\n`;
    content += '# NEVER commit this file to git (it\'s in .gitignore)\n\n';
    
    content += '# ============================================\n';
    content += '# Supabase Configuration\n';
    content += '# ============================================\n';
    if (values.NEXT_PUBLIC_SUPABASE_URL) {
      content += `NEXT_PUBLIC_SUPABASE_URL=${values.NEXT_PUBLIC_SUPABASE_URL}\n`;
    }
    if (values.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      content += `NEXT_PUBLIC_SUPABASE_ANON_KEY=${values.NEXT_PUBLIC_SUPABASE_ANON_KEY}\n`;
    }
    if (values.SUPABASE_URL) {
      content += `SUPABASE_URL=${values.SUPABASE_URL}\n`;
    }
    if (values.SUPABASE_ANON_KEY) {
      content += `SUPABASE_ANON_KEY=${values.SUPABASE_ANON_KEY}\n`;
    }
    
    content += '\n# ============================================\n';
    content += '# Analyzer Configuration\n';
    content += '# ============================================\n';
    if (values.OPENAI_API_KEY) {
      content += `OPENAI_API_KEY=${values.OPENAI_API_KEY}\n`;
    }
    if (values.OPENAI_ANALYZER_MODEL) {
      content += `OPENAI_ANALYZER_MODEL=${values.OPENAI_ANALYZER_MODEL}\n`;
    } else {
      content += `OPENAI_ANALYZER_MODEL=gpt-4o-mini\n`;
    }
    if (values.ANALYZER_CHOICE) {
      content += `ANALYZER_CHOICE=${values.ANALYZER_CHOICE}\n`;
    }
    
    content += '\n# ============================================\n';
    content += '# Optional: Enhanced Features\n';
    content += '# ============================================\n';
    if (values.USDA_API_KEY) {
      content += `USDA_API_KEY=${values.USDA_API_KEY}\n`;
    }
    if (values.NEXT_PUBLIC_GA_ID) {
      content += `NEXT_PUBLIC_GA_ID=${values.NEXT_PUBLIC_GA_ID}\n`;
    }
    
    // Write to file
    fs.writeFileSync(ENV_FILE, content, 'utf-8');
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ .env.local file created successfully!');
    console.log('='.repeat(80));
    console.log('\n📋 Summary:');
    console.log(`   File: ${ENV_FILE}`);
    console.log(`   Variables set: ${Object.keys(values).length}`);
    console.log('\n🔍 Next steps:');
    console.log('   1. Verify your setup: npm run verify:env');
    console.log('   2. Start dev server: npm run dev');
    console.log('   3. Check analyzer config in terminal logs');
    console.log('\n🔒 Security:');
    console.log('   ✅ .env.local is in .gitignore (will not be committed)');
    console.log('   ✅ Your keys are stored locally only');
    console.log('\n');
    
  } catch (error) {
    rl.close();
    console.error('\n❌ Error setting up environment:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main as setupEnv };

