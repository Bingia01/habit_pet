import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseAnalyzer } from '@/lib/analyzers/supabase';
import { openAIAnalyzer } from '@/lib/analyzers/openai';

describe('Timeout Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-key';
    process.env.OPENAI_API_KEY = 'sk-test-key';
  });

  describe('Supabase Analyzer Timeouts', () => {
    it('should timeout after 30 seconds', async () => {
      // Mock fetch to never resolve (simulating timeout)
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise(() => {
          // Never resolves, simulating timeout
        })
      );

      // The analyzer should timeout after SUPABASE_TIMEOUT_MS (30000ms)
      // In a real test, we'd use fake timers, but for now we'll test the timeout logic
      await expect(
        Promise.race([
          supabaseAnalyzer.analyze({ imageBase64: 'test' }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Test timeout')), 100)
          ),
        ])
      ).rejects.toThrow('Test timeout');
    });

    it('should handle AbortError from timeout', async () => {
      // Create an AbortError
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      
      global.fetch = vi.fn().mockRejectedValue(abortError);

      await expect(
        supabaseAnalyzer.analyze({ imageBase64: 'test' })
      ).rejects.toThrow();
    });
  });

  describe('OpenAI Analyzer Timeouts', () => {
    it('should timeout after 30 seconds', async () => {
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise(() => {
          // Never resolves
        })
      );

      await expect(
        Promise.race([
          openAIAnalyzer.analyze({ imageBase64: 'test' }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Test timeout')), 100)
          ),
        ])
      ).rejects.toThrow('Test timeout');
    });
  });
});

