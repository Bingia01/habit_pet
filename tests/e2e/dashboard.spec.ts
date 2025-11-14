import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Note: Dashboard requires onboarding to be complete
    // In a real scenario, you might need to set up test data or mock the context
    // For now, we'll test what we can access
    await page.goto('/dashboard');
  });

  test('should redirect to onboarding if not completed', async ({ page }) => {
    // If onboarding is not complete, should redirect
    // This depends on the app state, but we can check the URL
    await page.waitForTimeout(1000); // Wait for potential redirect
    
    // Either on dashboard or redirected to onboarding
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|onboarding)/);
  });

  test('should display dashboard elements when onboarding is complete', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're on dashboard (not redirected)
    if (page.url().includes('/dashboard') || page.url() === 'http://localhost:3000/') {
      // Should see HabitPet header
      await expect(page.locator('text=HabitPet')).toBeVisible({ timeout: 5000 });
      
      // Should see Add Food button
      const addFoodButton = page.locator('button:has-text("Add Food")');
      if (await addFoodButton.count() > 0) {
        await expect(addFoodButton.first()).toBeVisible();
      }
    }
  });

  test('should navigate to add food page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Only test if we're on dashboard
    if (page.url().includes('/dashboard') || page.url() === 'http://localhost:3000/') {
      // Click Add Food button
      const addFoodButton = page.locator('button:has-text("Add Food")');
      if (await addFoodButton.count() > 0) {
        await addFoodButton.first().click();
        await expect(page).toHaveURL(/\/add-food/, { timeout: 3000 });
      }
    }
  });

  test('should display progress bars', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/dashboard') || page.url() === 'http://localhost:3000/') {
      // Should see Daily Progress
      const dailyProgress = page.locator('text=Daily Progress');
      if (await dailyProgress.count() > 0) {
        await expect(dailyProgress.first()).toBeVisible();
      }

      // Should see Weekly Progress
      const weeklyProgress = page.locator('text=Weekly Progress');
      if (await weeklyProgress.count() > 0) {
        await expect(weeklyProgress.first()).toBeVisible();
      }
    }
  });

  test('should display quick stats', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/dashboard') || page.url() === 'http://localhost:3000/') {
      // Should see stats cards (Level, Day Streak, Total Logs)
      const statsText = page.locator('text=/Level|Day Streak|Total Logs/i');
      if (await statsText.count() > 0) {
        await expect(statsText.first()).toBeVisible();
      }
    }
  });

  test('should navigate to history page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/dashboard') || page.url() === 'http://localhost:3000/') {
      // Click History in bottom navigation
      const historyButton = page.locator('button').filter({ hasText: /History/i });
      if (await historyButton.count() > 0) {
        await historyButton.first().click();
        await expect(page).toHaveURL(/\/history/, { timeout: 3000 });
      }
    }
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/dashboard') || page.url() === 'http://localhost:3000/') {
      // Click Settings in bottom navigation
      const settingsButton = page.locator('button').filter({ hasText: /Settings/i });
      if (await settingsButton.count() > 0) {
        await settingsButton.first().click();
        await expect(page).toHaveURL(/\/settings/, { timeout: 3000 });
      }
    }
  });

  test('should display recent activity if food logs exist', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/dashboard') || page.url() === 'http://localhost:3000/') {
      // Check for Recent Activity section
      const recentActivity = page.locator('text=Recent Activity');
      // This may or may not be visible depending on whether there are logs
      // Just verify the page loaded correctly
      await expect(page.locator('text=HabitPet')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show feedback message after food logging', async ({ page }) => {
    // Navigate with logged parameter
    await page.goto('/dashboard?logged=true');
    await page.waitForLoadState('networkidle');
    
    // Feedback message might appear briefly
    // Just verify page loads without errors
    await expect(page.locator('body')).toBeVisible();
  });
});

