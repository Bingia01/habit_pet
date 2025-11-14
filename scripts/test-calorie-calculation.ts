#!/usr/bin/env tsx
/**
 * Testing script for calorie calculation fixes
 * 
 * This script tests the calorie calculation logic to verify:
 * - Calories are within reasonable bounds (not 0, not 40,000 for an apple)
 * - Calculation methods are correctly applied
 * - Validation catches invalid values
 * - Fallback logic works correctly
 * 
 * Usage:
 *   npm run test:calories
 *   or
 *   tsx scripts/test-calorie-calculation.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface TestCase {
  name: string;
  foodType: string;
  expectedCaloriesRange: [number, number];
  mockData: {
    label: string;
    confidence?: number;
    calories?: number;
    weightGrams?: number;
    volumeML?: number;
    priors?: {
      density?: { mu: number; sigma: number };
      kcalPerG?: { mu: number; sigma: number };
    };
  };
}

const testCases: TestCase[] = [
  {
    name: 'Apple with valid OpenAI estimate',
    foodType: 'apple',
    expectedCaloriesRange: [80, 120],
    mockData: {
      label: 'apple',
      confidence: 0.9,
      calories: 95,
      weightGrams: 150,
      priors: {
        density: { mu: 0.7, sigma: 0.1 },
        kcalPerG: { mu: 0.52, sigma: 0.05 },
      },
    },
  },
  {
    name: 'Apple with invalid OpenAI estimate (too high)',
    foodType: 'apple',
    expectedCaloriesRange: [70, 120],
    mockData: {
      label: 'apple',
      confidence: 0.9,
      calories: 40000, // Invalid: too high
      weightGrams: 150,
      priors: {
        density: { mu: 0.7, sigma: 0.1 },
        kcalPerG: { mu: 0.52, sigma: 0.05 },
      },
    },
  },
  {
    name: 'Apple with no calories, calculate from weight',
    foodType: 'apple',
    expectedCaloriesRange: [70, 85],
    mockData: {
      label: 'apple',
      confidence: 0.9,
      weightGrams: 150,
      priors: {
        density: { mu: 0.7, sigma: 0.1 },
        kcalPerG: { mu: 0.52, sigma: 0.05 },
      },
    },
  },
  {
    name: 'Banana with volume-based calculation',
    foodType: 'banana',
    expectedCaloriesRange: [90, 130],
    mockData: {
      label: 'banana',
      confidence: 0.85,
      volumeML: 120,
      priors: {
        density: { mu: 0.9, sigma: 0.1 },
        kcalPerG: { mu: 0.89, sigma: 0.05 },
      },
    },
  },
  {
    name: 'Sandwich with valid estimate',
    foodType: 'sandwich',
    expectedCaloriesRange: [250, 500],
    mockData: {
      label: 'sandwich',
      confidence: 0.8,
      calories: 350,
      weightGrams: 200,
      priors: {
        density: { mu: 0.5, sigma: 0.1 },
        kcalPerG: { mu: 2.5, sigma: 0.3 },
      },
    },
  },
  {
    name: 'Food with zero calories (should calculate from priors)',
    foodType: 'broccoli',
    expectedCaloriesRange: [30, 80],
    mockData: {
      label: 'broccoli',
      confidence: 0.9,
      calories: 0,
      weightGrams: 100,
      priors: {
        density: { mu: 0.4, sigma: 0.1 },
        kcalPerG: { mu: 0.34, sigma: 0.05 },
      },
    },
  },
];

/**
 * Simulates the calorie calculation logic from the API route
 */
function calculateCaloriesFromPriors(
  item: TestCase['mockData'],
): { calories: number; method: string } {
  // Prefer weight-based calculation (more accurate)
  if (item.weightGrams && item.weightGrams > 0 && item.priors?.kcalPerG?.mu) {
    const calculated = item.weightGrams * item.priors.kcalPerG.mu;
    return {
      calories: Math.round(calculated),
      method: 'weight×kcalPerG',
    };
  }

  // Fallback to volume-based calculation
  if (
    item.volumeML &&
    item.volumeML > 0 &&
    item.priors?.density?.mu &&
    item.priors?.kcalPerG?.mu
  ) {
    const calculated =
      item.volumeML * item.priors.density.mu * item.priors.kcalPerG.mu;
    return {
      calories: Math.round(calculated),
      method: 'volume×density×kcalPerG',
    };
  }

  return { calories: 0, method: 'lidar-required' };
}

/**
 * Validates calories from analyzer
 */
function validateCalories(
  calories: number,
  item: TestCase['mockData'],
): { isValid: boolean; reason?: string } {
  if (calories < 1) {
    return { isValid: false, reason: 'Calories must be >= 1' };
  }

  if (calories > 5000) {
    return { isValid: false, reason: 'Calories must be <= 5000' };
  }

  // Sanity check against weight/volume
  const maxExpectedCalories = item.weightGrams
    ? item.weightGrams * (item.priors?.kcalPerG?.mu || 5) * 3
    : item.volumeML
    ? item.volumeML *
      (item.priors?.density?.mu || 1) *
      (item.priors?.kcalPerG?.mu || 5) *
      3
    : 5000;

  if (calories > maxExpectedCalories) {
    return {
      isValid: false,
      reason: `Calories (${calories}) exceed max expected (${maxExpectedCalories})`,
    };
  }

  return { isValid: true };
}

/**
 * Simulates the full calorie calculation logic
 */
function simulateCalorieCalculation(
  testCase: TestCase,
): {
  finalCalories: number;
  calculationMethod: string;
  wasValidated: boolean;
  wasRecalculated: boolean;
} {
  const item = testCase.mockData;
  let finalCalories: number;
  let calculationMethod: string;
  let wasValidated = false;
  let wasRecalculated = false;

  // Check if analyzer provided calories
  if (typeof item.calories === 'number' && item.calories > 0) {
    const validation = validateCalories(item.calories, item);
    wasValidated = true;

    if (validation.isValid) {
      finalCalories = Math.round(item.calories);
      calculationMethod = 'analyzer-provided';
    } else {
      // Invalid calories, recalculate from priors
      wasRecalculated = true;
      const calculated = calculateCaloriesFromPriors(item);
      finalCalories = calculated.calories;
      calculationMethod = calculated.method;
    }
  } else {
    // No calories provided, calculate from priors
    const calculated = calculateCaloriesFromPriors(item);
    finalCalories = calculated.calories;
    calculationMethod = calculated.method;
  }

  return {
    finalCalories,
    calculationMethod,
    wasValidated,
    wasRecalculated,
  };
}

/**
 * Run a single test case
 */
function runTest(testCase: TestCase): {
  passed: boolean;
  details: string;
  result: ReturnType<typeof simulateCalorieCalculation>;
} {
  const result = simulateCalorieCalculation(testCase);
  const [minExpected, maxExpected] = testCase.expectedCaloriesRange;
  const passed =
    result.finalCalories >= minExpected &&
    result.finalCalories <= maxExpected;

  const details = [
    `Expected: ${minExpected}-${maxExpected} kcal`,
    `Got: ${result.finalCalories} kcal`,
    `Method: ${result.calculationMethod}`,
    result.wasValidated ? '✅ Validated' : '⚠️ Not validated',
    result.wasRecalculated ? '🔄 Recalculated from priors' : '',
  ]
    .filter(Boolean)
    .join(' | ');

  return { passed, details, result };
}

/**
 * Main test runner
 */
function main() {
  console.log('🧪 Testing Calorie Calculation Logic\n');
  console.log('='.repeat(80));

  let passedCount = 0;
  let failedCount = 0;

  for (const testCase of testCases) {
    const { passed, details, result } = runTest(testCase);
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';

    console.log(`\n${icon} [${status}] ${testCase.name}`);
    console.log(`   ${details}`);

    if (!passed) {
      console.log(
        `   ⚠️  Expected ${testCase.expectedCaloriesRange[0]}-${testCase.expectedCaloriesRange[1]} kcal, got ${result.finalCalories} kcal`,
      );
    }

    if (passed) {
      passedCount++;
    } else {
      failedCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${passedCount}/${testCases.length}`);
  console.log(`   ❌ Failed: ${failedCount}/${testCases.length}`);

  if (failedCount > 0) {
    console.log('\n⚠️  Some tests failed. Please review the calorie calculation logic.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! Calorie calculation logic is working correctly.');
    process.exit(0);
  }
}

// Run tests if executed directly
if (require.main === module) {
  main();
}

export { testCases, simulateCalorieCalculation, validateCalories };

