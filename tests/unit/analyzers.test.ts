import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stubAnalyzer } from '@/lib/analyzers/stub';
import { supabaseAnalyzer } from '@/lib/analyzers/supabase';
import { openAIAnalyzer } from '@/lib/analyzers/openai';
import type { AnalyzeInput } from '@/lib/types/analyzer';

describe('Analyzers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('Stub Analyzer', () => {
    it('should return mock data', async () => {
      const result = await stubAnalyzer.analyze({
        imageBase64: 'test',
      });

      expect(result.items).toBeDefined();
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0].label).toBeDefined();
      expect(result.items[0].calories).toBeGreaterThan(0);
      expect(result.meta?.used).toContain('stub');
    });

    it('should return valid response structure', async () => {
      const result = await stubAnalyzer.analyze({
        imageBase64: 'test',
      });

      const item = result.items[0];
      expect(item).toHaveProperty('label');
      expect(item).toHaveProperty('calories');
      expect(item).toHaveProperty('weightGrams');
      expect(item).toHaveProperty('volumeML');
      expect(item).toHaveProperty('priors');
    });
  });

  describe('Supabase Analyzer', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should throw error if credentials missing', async () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_ANON_KEY;

      await expect(
        supabaseAnalyzer.analyze({ imageBase64: 'test' })
      ).rejects.toThrow('Supabase credentials missing');
    });

    it('should throw error if URL is invalid', async () => {
      process.env.SUPABASE_URL = 'not-a-valid-url';
      process.env.SUPABASE_ANON_KEY = 'test-key';

      await expect(
        supabaseAnalyzer.analyze({ imageBase64: 'test' })
      ).rejects.toThrow('Invalid SUPABASE_URL format');
    });

    it('should handle network errors', async () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-key';

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        supabaseAnalyzer.analyze({ imageBase64: 'test' })
      ).rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-key';

      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AbortError')), 100)
        )
      );

      await expect(
        supabaseAnalyzer.analyze({ imageBase64: 'test' })
      ).rejects.toThrow();
    });

    it('should handle 401/403 authentication errors', async () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-key';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      } as Response);

      await expect(
        supabaseAnalyzer.analyze({ imageBase64: 'test' })
      ).rejects.toThrow('Supabase authentication failed');
    });

    it('should handle 404 function not found errors', async () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-key';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      } as Response);

      await expect(
        supabaseAnalyzer.analyze({ imageBase64: 'test' })
      ).rejects.toThrow('Supabase function not found');
    });

    it('should validate response structure', async () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-key';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }), // Empty items
      } as Response);

      await expect(
        supabaseAnalyzer.analyze({ imageBase64: 'test' })
      ).rejects.toThrow('empty items array');
    });
  });

  describe('OpenAI Analyzer', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should throw error if API key missing', async () => {
      delete process.env.OPENAI_API_KEY;

      await expect(
        openAIAnalyzer.analyze({ imageBase64: 'test' })
      ).rejects.toThrow('OPENAI_API_KEY not configured');
    });

    it('should handle network errors', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        openAIAnalyzer.analyze({ imageBase64: 'test' })
      ).rejects.toThrow('Network error');
    });

    it('should handle 401 authentication errors', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'Invalid API key',
      } as Response);

      await expect(
        openAIAnalyzer.analyze({ imageBase64: 'test' })
      ).rejects.toThrow('OpenAI API key invalid');
    });

    it('should handle 429 rate limit errors', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      } as Response);

      await expect(
        openAIAnalyzer.analyze({ imageBase64: 'test' })
      ).rejects.toThrow('rate limit exceeded');
    });

    it('should handle timeout errors', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';

      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AbortError')), 100)
        )
      );

      await expect(
        openAIAnalyzer.analyze({ imageBase64: 'test' })
      ).rejects.toThrow();
    });
  });
});

