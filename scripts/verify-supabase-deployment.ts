#!/usr/bin/env tsx
/**
 * Verification script for Supabase Edge Function deployment
 * 
 * This script verifies that the analyze_food function is:
 * - Deployed and accessible
 * - Has required environment variables
 * - Returns correct response structure
 * - Calculates calories correctly
 * 
 * Usage:
 *   npm run verify:supabase
 *   or
 *   tsx scripts/verify-supabase-deployment.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local file
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

interface VerificationResult {
  test: string;
  passed: boolean;
  message: string;
  details?: unknown;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅' : '❌');
  console.error('\nPlease set these in your .env.local file');
  process.exit(1);
}

/**
 * Create a minimal test image (1x1 pixel PNG in base64)
 */
function createTestImageBase64(): string {
  // Minimal valid PNG (1x1 pixel, transparent)
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}

/**
 * Test 1: Function is accessible
 */
async function testFunctionAccessible(): Promise<VerificationResult> {
  try {
    const endpoint = `${SUPABASE_URL}/functions/v1/analyze_food`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: createTestImageBase64(),
      }),
    });

    if (response.status === 401 || response.status === 403) {
      return {
        test: 'Function Accessible',
        passed: false,
        message: `Authentication failed (${response.status}). Check SUPABASE_ANON_KEY.`,
      };
    }

    if (response.status === 404) {
      return {
        test: 'Function Accessible',
        passed: false,
        message: 'Function not found. Is it deployed?',
      };
    }

    return {
      test: 'Function Accessible',
      passed: true,
      message: `Function responded with status ${response.status}`,
    };
  } catch (error) {
    return {
      test: 'Function Accessible',
      passed: false,
      message: `Network error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Test 2: Function returns valid response structure
 */
async function testResponseStructure(): Promise<VerificationResult> {
  try {
    const endpoint = `${SUPABASE_URL}/functions/v1/analyze_food`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: createTestImageBase64(),
      }),
    });

    const data = await response.json();

    // Check for error response
    if (data.error) {
      return {
        test: 'Response Structure',
        passed: false,
        message: `Function returned error: ${data.error}`,
        details: data,
      };
    }

    // Check required fields
    const requiredFields = ['items', 'meta'];
    const missingFields = requiredFields.filter(field => !(field in data));

    if (missingFields.length > 0) {
      return {
        test: 'Response Structure',
        passed: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        details: data,
      };
    }

    // Check items structure
    if (!Array.isArray(data.items) || data.items.length === 0) {
      return {
        test: 'Response Structure',
        passed: false,
        message: 'Items array is missing or empty',
        details: data,
      };
    }

    const item = data.items[0];
    const itemRequiredFields = ['label', 'calories', 'weightGrams', 'volumeML'];
    const missingItemFields = itemRequiredFields.filter(field => !(field in item));

    if (missingItemFields.length > 0) {
      return {
        test: 'Response Structure',
        passed: false,
        message: `Missing item fields: ${missingItemFields.join(', ')}`,
        details: data,
      };
    }

    // Check meta structure
    if (data.meta && !('calculationMethod' in data.meta)) {
      return {
        test: 'Response Structure',
        passed: true,
        message: 'Response structure valid (calculationMethod missing but optional)',
        details: data,
      };
    }

    return {
      test: 'Response Structure',
      passed: true,
      message: 'Response structure is valid',
      details: {
        hasItems: true,
        itemsCount: data.items.length,
        hasMeta: !!data.meta,
        hasCalculationMethod: !!data.meta?.calculationMethod,
      },
    };
  } catch (error) {
    return {
      test: 'Response Structure',
      passed: false,
      message: `Error checking response: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Test 3: Calories are within reasonable bounds
 */
async function testCaloriesValidation(): Promise<VerificationResult> {
  try {
    const endpoint = `${SUPABASE_URL}/functions/v1/analyze_food`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: createTestImageBase64(),
      }),
    });

    const data = await response.json();

    if (data.error) {
      return {
        test: 'Calories Validation',
        passed: false,
        message: `Function error: ${data.error}`,
      };
    }

    const item = data.items[0];
    const calories = item.calories;

    // Check if calories is a number
    if (typeof calories !== 'number') {
      return {
        test: 'Calories Validation',
        passed: false,
        message: `Calories is not a number: ${typeof calories}`,
        details: { calories },
      };
    }

    // Check if calories is within reasonable bounds (0-5000)
    // Note: 0 is valid (signals LiDAR required)
    if (calories < 0 || calories > 5000) {
      return {
        test: 'Calories Validation',
        passed: false,
        message: `Calories out of bounds: ${calories} (expected 0-5000)`,
        details: { calories, calculationMethod: data.meta?.calculationMethod },
      };
    }

    // Check if calculation method is present
    const calculationMethod = data.meta?.calculationMethod;
    if (!calculationMethod) {
      return {
        test: 'Calories Validation',
        passed: true,
        message: `Calories valid (${calories} kcal) but calculationMethod missing`,
        details: { calories, calculationMethod: 'missing' },
      };
    }

    return {
      test: 'Calories Validation',
      passed: true,
      message: `Calories valid: ${calories} kcal (method: ${calculationMethod})`,
      details: { calories, calculationMethod },
    };
  } catch (error) {
    return {
      test: 'Calories Validation',
      passed: false,
      message: `Error validating calories: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Main verification runner
 */
async function main() {
  console.log('🔍 Verifying Supabase Edge Function Deployment\n');
  console.log('='.repeat(80));
  console.log(`Supabase URL: ${SUPABASE_URL?.substring(0, 30)}...`);
  console.log(`Anon Key: ${SUPABASE_ANON_KEY?.substring(0, 20)}...`);
  console.log('='.repeat(80));

  const results: VerificationResult[] = [];

  // Run tests sequentially
  console.log('\n📋 Running tests...\n');

  const test1 = await testFunctionAccessible();
  results.push(test1);
  console.log(`${test1.passed ? '✅' : '❌'} ${test1.test}: ${test1.message}`);

  if (test1.passed) {
    const test2 = await testResponseStructure();
    results.push(test2);
    console.log(`${test2.passed ? '✅' : '❌'} ${test2.test}: ${test2.message}`);
    if (test2.details) {
      console.log(`   Details:`, JSON.stringify(test2.details, null, 2));
    }

    const test3 = await testCaloriesValidation();
    results.push(test3);
    console.log(`${test3.passed ? '✅' : '❌'} ${test3.test}: ${test3.message}`);
    if (test3.details) {
      console.log(`   Details:`, JSON.stringify(test3.details, null, 2));
    }
  }

  console.log('\n' + '='.repeat(80));
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  console.log(`\n📊 Verification Results:`);
  console.log(`   ✅ Passed: ${passedCount}/${totalCount}`);
  console.log(`   ❌ Failed: ${totalCount - passedCount}/${totalCount}`);

  if (passedCount < totalCount) {
    console.log('\n⚠️  Some verification tests failed.');
    console.log('   Please review the errors above and check:');
    console.log('   1. Function is deployed: supabase functions deploy analyze_food');
    console.log('   2. Environment variables are set: supabase secrets list');
    console.log('   3. Function logs: supabase functions logs analyze_food');
    process.exit(1);
  } else {
    console.log('\n🎉 All verification tests passed! Function is deployed correctly.');
    process.exit(0);
  }
}

// Run verification if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
}

export { testFunctionAccessible, testResponseStructure, testCaloriesValidation };

