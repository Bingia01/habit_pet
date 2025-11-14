import { describe, it, expect } from 'vitest';
import type { AnalyzeItem } from '@/lib/types/analyzer';

// Helper functions that mirror the logic from the API route
function calculateCaloriesFromPriors(item: AnalyzeItem): { calories: number; method: string } {
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
    const calculated = item.volumeML * item.priors.density.mu * item.priors.kcalPerG.mu;
    return {
      calories: Math.round(calculated),
      method: 'volume×density×kcalPerG',
    };
  }

  return { calories: 0, method: 'lidar-required' };
}

function validateCalories(
  calories: number,
  item: AnalyzeItem,
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
    ? item.volumeML * (item.priors?.density?.mu || 1) * (item.priors?.kcalPerG?.mu || 5) * 3
    : 5000;

  if (calories > maxExpectedCalories) {
    return {
      isValid: false,
      reason: `Calories (${calories}) exceed max expected (${maxExpectedCalories})`,
    };
  }

  return { isValid: true };
}

describe('Calorie Calculation Logic', () => {
  describe('Weight-based calculation', () => {
    it('should calculate calories from weight and kcalPerG', () => {
      const item: AnalyzeItem = {
        label: 'apple',
        confidence: 0.9,
        weightGrams: 150,
        volumeML: 0,
        priors: {
          kcalPerG: { mu: 0.52, sigma: 0.05 },
        },
      };

      const result = calculateCaloriesFromPriors(item);
      expect(result.calories).toBeGreaterThanOrEqual(70);
      expect(result.calories).toBeLessThanOrEqual(85);
      expect(result.method).toBe('weight×kcalPerG');
    });

    it('should prefer weight-based over volume-based', () => {
      const item: AnalyzeItem = {
        label: 'apple',
        confidence: 0.9,
        weightGrams: 150,
        volumeML: 200,
        priors: {
          density: { mu: 0.7, sigma: 0.1 },
          kcalPerG: { mu: 0.52, sigma: 0.05 },
        },
      };

      const result = calculateCaloriesFromPriors(item);
      // Should use weight-based (more accurate)
      expect(result.method).toBe('weight×kcalPerG');
    });
  });

  describe('Volume-based calculation', () => {
    it('should calculate calories from volume when weight not available', () => {
      const item: AnalyzeItem = {
        label: 'banana',
        confidence: 0.85,
        weightGrams: 0,
        volumeML: 120,
        priors: {
          density: { mu: 0.9, sigma: 0.1 },
          kcalPerG: { mu: 0.89, sigma: 0.05 },
        },
      };

      const result = calculateCaloriesFromPriors(item);
      expect(result.calories).toBeGreaterThanOrEqual(90);
      expect(result.calories).toBeLessThanOrEqual(130);
      expect(result.method).toBe('volume×density×kcalPerG');
    });
  });

  describe('Calorie validation', () => {
    it('should validate calories are in reasonable range', () => {
      const item: AnalyzeItem = {
        label: 'apple',
        confidence: 0.9,
        weightGrams: 150,
        volumeML: 0,
        priors: {
          kcalPerG: { mu: 0.52, sigma: 0.05 },
        },
      };

      const validation = validateCalories(95, item);
      expect(validation.isValid).toBe(true);
    });

    it('should reject calories that are too high', () => {
      const item: AnalyzeItem = {
        label: 'apple',
        confidence: 0.9,
        weightGrams: 150,
        volumeML: 0,
        priors: {
          kcalPerG: { mu: 0.52, sigma: 0.05 },
        },
      };

      // Test with value > 5000 (should return "Calories must be <= 5000")
      const validation = validateCalories(40000, item);
      expect(validation.isValid).toBe(false);
      expect(validation.reason).toBe('Calories must be <= 5000');
    });

    it('should reject calories that exceed max expected', () => {
      const item: AnalyzeItem = {
        label: 'apple',
        confidence: 0.9,
        weightGrams: 150,
        volumeML: 0,
        priors: {
          kcalPerG: { mu: 0.52, sigma: 0.05 },
        },
      };

      // Test with value > maxExpected (150 * 0.52 * 3 = 234) but < 5000
      // This should trigger "exceed max expected" message
      const validation = validateCalories(500, item); // 500 > 234 but < 5000
      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('exceed max expected');
    });

    it('should reject calories that are too low', () => {
      const item: AnalyzeItem = {
        label: 'apple',
        confidence: 0.9,
        weightGrams: 150,
        volumeML: 0,
        priors: {
          kcalPerG: { mu: 0.52, sigma: 0.05 },
        },
      };

      const validation = validateCalories(0, item);
      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('must be >= 1');
    });

    it('should reject calories above 5000', () => {
      const item: AnalyzeItem = {
        label: 'apple',
        confidence: 0.9,
        weightGrams: 150,
        volumeML: 0,
        priors: {
          kcalPerG: { mu: 0.52, sigma: 0.05 },
        },
      };

      const validation = validateCalories(6000, item);
      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('must be <= 5000');
    });
  });

  describe('Invalid OpenAI estimate handling', () => {
    it('should recalculate from priors when OpenAI estimate is too high', () => {
      const item: AnalyzeItem = {
        label: 'apple',
        confidence: 0.9,
        calories: 40000, // Invalid: too high
        weightGrams: 150,
        volumeML: 0,
        priors: {
          density: { mu: 0.7, sigma: 0.1 },
          kcalPerG: { mu: 0.52, sigma: 0.05 },
        },
      };

      const validation = validateCalories(item.calories!, item);
      expect(validation.isValid).toBe(false);

      // Should recalculate from priors
      const recalculated = calculateCaloriesFromPriors(item);
      expect(recalculated.calories).toBeLessThan(120);
      expect(recalculated.method).toBe('weight×kcalPerG');
    });

    it('should use valid OpenAI estimate when within bounds', () => {
      const item: AnalyzeItem = {
        label: 'apple',
        confidence: 0.9,
        calories: 95, // Valid
        weightGrams: 150,
        volumeML: 0,
        priors: {
          density: { mu: 0.7, sigma: 0.1 },
          kcalPerG: { mu: 0.52, sigma: 0.05 },
        },
      };

      const validation = validateCalories(item.calories!, item);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Missing data handling', () => {
    it('should calculate from weight when calories not provided', () => {
      const item: AnalyzeItem = {
        label: 'apple',
        confidence: 0.9,
        weightGrams: 150,
        volumeML: 0,
        priors: {
          density: { mu: 0.7, sigma: 0.1 },
          kcalPerG: { mu: 0.52, sigma: 0.05 },
        },
      };

      const result = calculateCaloriesFromPriors(item);
      expect(result.calories).toBeGreaterThanOrEqual(70);
      expect(result.calories).toBeLessThanOrEqual(85);
      expect(result.method).toBe('weight×kcalPerG');
    });

    it('should return 0 when no data available (signals LiDAR required)', () => {
      const item: AnalyzeItem = {
        label: 'unknown food',
        confidence: 0.5,
        // No weight, volume, or priors
      };

      const result = calculateCaloriesFromPriors(item);
      expect(result.calories).toBe(0);
      expect(result.method).toBe('lidar-required');
    });
  });
});
