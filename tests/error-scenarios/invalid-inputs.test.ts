import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/analyze-food/route';
import { NextRequest } from 'next/server';
import { createImageFile, TEST_IMAGES } from '../utils/test-images';

describe('Invalid Input Handling', () => {
  describe('Empty or invalid image data', () => {
    it('should reject empty FormData', async () => {
      const formData = new FormData();
      // No image appended

      const request = new NextRequest('http://localhost:3000/api/analyze-food', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No image provided');
    });

    it('should reject invalid JSON body', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze-food', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      
      // Should handle JSON parse error
      expect(response.status).toBe(400);
    });
  });

  describe('Invalid image format', () => {
    it('should handle non-image files', async () => {
      // Use JSON with invalid base64 to test error handling
      const request = new NextRequest('http://localhost:3000/api/analyze-food', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: 'not-valid-base64!!!',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();
      
      // Should return error (invalid base64 or analyzer error)
      expect([400, 500]).toContain(response.status);
      expect(data.error || data.errorCode).toBeDefined();
    }, 5000);
  });

  describe('Missing required fields', () => {
    it('should handle missing imageBase64 in JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze-food', {
        method: 'POST',
        body: JSON.stringify({ region: 'test' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No image provided');
    });
  });
});

