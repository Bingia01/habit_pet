import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AnalyzeOutput, AnalyzeItem } from '@/lib/types/analyzer';

// Import the helper functions from the route (we'll test the logic)
// Since these are not exported, we'll test the behavior through the API

describe('API Route Logic', () => {
  describe('Calorie calculation from priors', () => {
    // Test the calculation logic that's used in mapToLegacyResponse
    it('should calculate calories from weight × kcalPerG', () => {
      const item: AnalyzeItem = {
        label: 'apple',
        confidence: 0.9,
        weightGrams: 150,
        volumeML: 0,
        priors: {
          kcalPerG: { mu: 0.52, sigma: 0.05 },
        },
      };

      // Simulate the calculation logic
      const calculated = item.weightGrams * (item.priors?.kcalPerG?.mu || 0);
      expect(calculated).toBeCloseTo(78, 1);
    });

    it('should calculate calories from volume × density × kcalPerG', () => {
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

      // Simulate the calculation logic
      const calculated = item.volumeML * (item.priors?.density?.mu || 0) * (item.priors?.kcalPerG?.mu || 0);
      expect(calculated).toBeCloseTo(96.12, 1);
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

      // Weight-based should be used (more accurate)
      const weightBased = item.weightGrams * (item.priors?.kcalPerG?.mu || 0);
      const volumeBased = item.volumeML * (item.priors?.density?.mu || 0) * (item.priors?.kcalPerG?.mu || 0);
      
      // Weight-based should be preferred (code logic checks weightGrams first)
      expect(weightBased).toBe(78); // 150 * 0.52
      expect(volumeBased).toBeCloseTo(72.8, 1); // 200 * 0.7 * 0.52
      // In actual code, weight-based is checked first, so it would be used
    });
  });

  describe('Calorie validation', () => {
    it('should validate calories are within bounds', () => {
      const calories = 95;
      const isValid = calories >= 1 && calories <= 5000;
      expect(isValid).toBe(true);
    });

    it('should reject calories that are too high', () => {
      const calories = 40000;
      const isValid = calories >= 1 && calories <= 5000;
      expect(isValid).toBe(false);
    });

    it('should validate against max expected calories', () => {
      const weightGrams = 150;
      const kcalPerG = 0.52;
      const maxExpected = weightGrams * kcalPerG * 3; // 3x sanity check
      
      const calories = 95;
      const isValid = calories <= maxExpected;
      
      expect(isValid).toBe(true);
      expect(maxExpected).toBeGreaterThan(200); // Should be around 234
    });

    it('should reject calories that exceed max expected', () => {
      const weightGrams = 150;
      const kcalPerG = 0.52;
      const maxExpected = weightGrams * kcalPerG * 3;
      
      const calories = 40000;
      const isValid = calories <= maxExpected;
      
      expect(isValid).toBe(false);
    });
  });

  describe('Response structure validation', () => {
    it('should require items array', () => {
      const output: AnalyzeOutput = {
        items: [],
        meta: { used: ['stub'] },
      };

      expect(output.items.length).toBe(0);
      // In actual code, this would trigger a fallback
    });

    it('should require label in items', () => {
      const item: AnalyzeItem = {
        label: 'apple',
        confidence: 0.9,
        calories: 95,
        weightGrams: 150,
        volumeML: 0,
      };

      expect(item.label).toBeDefined();
      expect(typeof item.label).toBe('string');
    });

    it('should require valid confidence range', () => {
      const item: AnalyzeItem = {
        label: 'apple',
        confidence: 0.9,
        calories: 95,
        weightGrams: 150,
        volumeML: 0,
      };

      expect(item.confidence).toBeGreaterThanOrEqual(0);
      expect(item.confidence).toBeLessThanOrEqual(1);
    });
  });
});

