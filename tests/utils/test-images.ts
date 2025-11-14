/**
 * Test images for camera testing
 * Base64 encoded test images for use in tests
 */

// Minimal valid PNG (1x1 pixel, transparent) - for basic testing
export const TEST_IMAGES = {
  minimal: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  
  // Placeholder for actual food images (you can add real base64 encoded images here)
  apple: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  banana: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
};

/**
 * Create a blob from base64 string
 */
export function createImageBlob(base64: string, type = 'image/png'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type });
}

/**
 * Create a File object from base64 (for FormData)
 */
export function createImageFile(base64: string, filename = 'test-image.png', type = 'image/png'): File {
  const blob = createImageBlob(base64, type);
  return new File([blob], filename, { type });
}

/**
 * Simulate camera capture with test image
 * This creates a canvas with the test image that can be used to simulate photo capture
 */
export async function simulateCameraCapture(
  canvas: HTMLCanvasElement,
  imageBase64: string
): Promise<Blob> {
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }
  
  // Load test image onto canvas
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width || 1920;
      canvas.height = img.height || 1080;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/jpeg', 0.8);
    };
    img.onerror = reject;
    img.src = `data:image/png;base64,${imageBase64}`;
  });
}

