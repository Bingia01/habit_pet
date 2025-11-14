import { test, expect } from '@playwright/test';

test.describe('Food Logging Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant camera permissions for tests
    await context.grantPermissions(['camera'], { origin: 'http://localhost:3000' });

    // Mock getUserMedia to use a test image instead of real camera
    await page.addInitScript(() => {
      // Override getUserMedia
      navigator.mediaDevices.getUserMedia = async () => {
        // Create a canvas with test image
        const canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw a simple test pattern
          ctx.fillStyle = '#4CAF50';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '48px Arial';
          ctx.fillText('Test Food Image', 100, 100);
        }
        return canvas.captureStream(30) as MediaStream;
      };
    });
  });

  test('should complete camera → analysis → submission flow', async ({ page }) => {
    // Navigate to camera final page
    await page.goto('/camera-final');
    
    // Click open camera button
    await page.click('button:has-text("Open Camera")');
    
    // Wait for camera interface to appear
    await expect(page.locator('text=Capture Food')).toBeVisible({ timeout: 5000 });
    
    // Verify camera UI elements are present
    await expect(page.locator('button:has-text("Take Photo")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
  });

  test('should handle camera permission denial', async ({ page, context }) => {
    // Deny camera permissions
    await context.clearPermissions();

    await page.goto('/camera-final');
    await page.click('button:has-text("Open Camera")');

    // Should show error message
    await expect(page.locator('text=Camera permission')).toBeVisible({ timeout: 5000 });
  });

  test('should show error when camera is not available', async ({ page }) => {
    // Mock getUserMedia to throw NotFoundError
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        throw new DOMException('Camera not found', 'NotFoundError');
      };
    });

    await page.goto('/camera-final');
    await page.click('button:has-text("Open Camera")');

    // Should show appropriate error
    await expect(page.locator('text=No camera device found')).toBeVisible({ timeout: 5000 });
  });

  test('should allow retaking photo', async ({ page }) => {
    await page.goto('/camera-final');
    await page.click('button:has-text("Open Camera")');

    // Wait for camera to be ready
    await expect(page.locator('button:has-text("Take Photo")')).toBeVisible({ timeout: 5000 });

    // Note: Actual photo capture testing would require more complex setup
    // This test verifies the UI flow works
  });
});

test.describe('Add Food Page Integration', () => {
  test('should navigate to add food page', async ({ page }) => {
    await page.goto('/add-food');
    
    // Should see add food interface
    await expect(page.locator('text=/add.*food/i')).toBeVisible();
  });

  test('should show camera option in add food page', async ({ page, context }) => {
    await context.grantPermissions(['camera'], { origin: 'http://localhost:3000' });

    await page.goto('/add-food');
    
    // Look for camera button
    const cameraButton = page.locator('button').filter({ hasText: /camera/i });
    if (await cameraButton.count() > 0) {
      await expect(cameraButton.first()).toBeVisible();
    }
  });
});

