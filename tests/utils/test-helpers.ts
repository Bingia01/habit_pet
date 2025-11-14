/**
 * Test helpers and utilities
 */

import { vi } from 'vitest';

/**
 * Create a mock NextRequest for API route testing
 */
export function createMockNextRequest(
  body?: FormData | string | object,
  headers: Record<string, string> = {}
): any {
  const request = {
    headers: new Headers({
      'Content-Type': 'application/json',
      ...headers,
    }),
    json: async () => {
      if (typeof body === 'string') {
        return JSON.parse(body);
      }
      return body || {};
    },
    formData: async () => {
      if (body instanceof FormData) {
        return body;
      }
      return new FormData();
    },
  };

  return request as any;
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error('Condition not met within timeout');
}

/**
 * Mock fetch with a response
 */
export function mockFetch(response: any, ok = true) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => response,
    text: async () => JSON.stringify(response),
    headers: new Headers(),
  } as Response);
}

/**
 * Mock fetch with an error
 */
export function mockFetchError(error: Error) {
  global.fetch = vi.fn().mockRejectedValue(error);
}

/**
 * Create a mock MediaStream for camera testing
 */
export function createMockMediaStream(): MediaStream {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  return canvas.captureStream(30) as MediaStream;
}

