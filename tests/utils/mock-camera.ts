/**
 * Mock camera utilities for testing
 * Allows testing camera functionality without a physical camera
 */

/**
 * Create a mock video stream from a test image or canvas
 */
export function createMockVideoStream(imageUrl?: string): MediaStream {
  // Create a canvas with test image
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Draw a test pattern or load an image
    if (imageUrl) {
      // Load image if provided
      const img = new Image();
      img.src = imageUrl;
      ctx.drawImage(img, 0, 0);
    } else {
      // Draw a simple test pattern (green background with text)
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '48px Arial';
      ctx.fillText('Test Food Image', 100, 100);
    }
  }
  
  // Create a video track from canvas
  const stream = canvas.captureStream(30); // 30 FPS
  return stream;
}

/**
 * Mock getUserMedia to return a fake video stream
 */
export function mockGetUserMedia() {
  const originalGetUserMedia = navigator.mediaDevices?.getUserMedia;
  
  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      console.log('[TEST] Mock getUserMedia called with:', constraints);
      return createMockVideoStream();
    };
  }
  
  return () => {
    if (originalGetUserMedia && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = originalGetUserMedia;
    }
  };
}

/**
 * Mock getUserMedia with error
 */
export function mockGetUserMediaError(
  errorType: 'NotAllowedError' | 'NotFoundError' | 'NotReadableError' = 'NotAllowedError'
) {
  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia = async () => {
      const error = new DOMException('Mock camera error', errorType);
      throw error;
    };
  }
}

/**
 * Restore original getUserMedia
 */
export function restoreGetUserMedia() {
  // This would restore the original, but in tests we typically mock it
  if (navigator.mediaDevices) {
    delete (navigator.mediaDevices as any).getUserMedia;
  }
}

