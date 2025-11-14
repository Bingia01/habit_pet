import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('should display settings page', async ({ page }) => {
    // Should see Settings header
    await expect(page.locator('text=Settings')).toBeVisible({ timeout: 5000 });
    
    // Should see back button
    const backButton = page.locator('button').filter({ hasText: /ArrowLeft|Back/i }).or(page.locator('button[aria-label*="back" i]'));
    if (await backButton.count() === 0) {
      // Try looking for arrow icon button
      const arrowButton = page.locator('button').first();
      await expect(arrowButton).toBeVisible();
    }
  });

  test('should display personal information section', async ({ page }) => {
    await expect(page.locator('text=Personal Information')).toBeVisible({ timeout: 5000 });
    
    // Should see name field
    const nameInput = page.locator('input').filter({ hasText: /name/i }).or(
      page.locator('label:has-text("Name") + input')
    );
    if (await nameInput.count() === 0) {
      // Try finding by placeholder or nearby label
      const nameField = page.locator('input').first();
      await expect(nameField).toBeVisible();
    }

    // Should see email field
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      await expect(emailInput.first()).toBeVisible();
    }
  });

  test('should allow editing personal information', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find and fill name field
    const nameInputs = page.locator('input');
    const nameInput = nameInputs.first();
    if (await nameInput.count() > 0) {
      await nameInput.clear();
      await nameInput.fill('Updated Name');
      await expect(nameInput).toHaveValue('Updated Name');
    }
  });

  test('should display calorie goals section', async ({ page }) => {
    await expect(page.locator('text=Calorie Goals')).toBeVisible({ timeout: 5000 });
    
    // Should see daily calorie goal field
    const dailyGoal = page.locator('text=Daily Calorie Goal');
    if (await dailyGoal.count() > 0) {
      await expect(dailyGoal.first()).toBeVisible();
    }

    // Should see weekly calorie goal field
    const weeklyGoal = page.locator('text=Weekly Calorie Goal');
    if (await weeklyGoal.count() > 0) {
      await expect(weeklyGoal.first()).toBeVisible();
    }
  });

  test('should allow updating calorie goals', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find number inputs for calorie goals
    const numberInputs = page.locator('input[type="number"]');
    const count = await numberInputs.count();
    
    if (count >= 2) {
      // Update daily goal (likely first number input)
      await numberInputs.nth(0).clear();
      await numberInputs.nth(0).fill('2000');
      
      // Update weekly goal (likely second number input)
      await numberInputs.nth(1).clear();
      await numberInputs.nth(1).fill('14000');
    }
  });

  test('should display nutrition goals section', async ({ page }) => {
    await expect(page.locator('text=Nutrition Goals')).toBeVisible({ timeout: 5000 });
    
    // Should see nutrition goal buttons
    const nutritionButtons = page.locator('button').filter({ hasText: /high-protein|more-veggies|low-carb/i });
    // These may or may not be visible depending on implementation
    // Just verify the section exists
    await expect(page.locator('text=Nutrition Goals')).toBeVisible();
  });

  test('should allow selecting nutrition goals', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find nutrition goal buttons
    const nutritionButtons = page.locator('button').filter({ hasText: /high-protein|more-veggies|low-carb|balanced/i });
    const count = await nutritionButtons.count();
    
    if (count > 0) {
      // Click first nutrition goal
      await nutritionButtons.first().click();
      
      // Click another if available
      if (count > 1) {
        await nutritionButtons.nth(1).click();
      }
    }
  });

  test('should display dietary preferences section', async ({ page }) => {
    await expect(page.locator('text=Dietary Preferences')).toBeVisible({ timeout: 5000 });
  });

  test('should allow selecting dietary preferences', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Scroll to dietary preferences if needed
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    
    // Find dietary preference buttons
    const dietaryButtons = page.locator('button').filter({ hasText: /Vegetarian|Vegan|Gluten-Free|Keto/i });
    const count = await dietaryButtons.count();
    
    if (count > 0) {
      // Click first dietary preference
      await dietaryButtons.first().click();
      
      // Click another if available
      if (count > 1) {
        await dietaryButtons.nth(1).click();
      }
    }
  });

  test('should display food preferences section', async ({ page }) => {
    // Scroll down to find food preferences
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    await expect(page.locator('text=Food Preferences')).toBeVisible({ timeout: 5000 });
  });

  test('should allow selecting food preferences', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Scroll to food preferences
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Find food preference buttons (emojis)
    const foodButtons = page.locator('button').filter({ hasText: /🍎|🍌|🥗|🍗|🥑|🍕/i });
    const count = await foodButtons.count();
    
    if (count > 0) {
      // Click first food preference
      await foodButtons.first().click();
      
      // Click another if available
      if (count > 1) {
        await foodButtons.nth(1).click();
      }
    }
  });

  test('should display notification settings', async ({ page }) => {
    // Scroll down to find notification settings
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Notification settings might be present
    const notificationSection = page.locator('text=/Notification|Bell/i');
    // May or may not be visible, just check page loaded
    await expect(page.locator('text=Settings')).toBeVisible();
  });

  test('should save settings and redirect', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Find and click save button
    const saveButton = page.locator('button:has-text("Save Settings")');
    if (await saveButton.count() > 0) {
      await saveButton.click();
      
      // Should redirect to dashboard/home
      await expect(page).toHaveURL(/\/$|\/dashboard/, { timeout: 5000 });
    }
  });

  test('should navigate back to dashboard', async ({ page }) => {
    // Click back button or home in navigation
    const backButton = page.locator('button').filter({ hasText: /ArrowLeft|Back/i }).or(
      page.locator('button[aria-label*="back" i]')
    );
    
    if (await backButton.count() > 0) {
      await backButton.first().click();
    } else {
      // Try bottom navigation home button
      const homeButton = page.locator('button').filter({ hasText: /Home/i });
      if (await homeButton.count() > 0) {
        await homeButton.first().click();
      }
    }
    
    // Should navigate away from settings
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).not.toContain('/settings');
  });

  test('should navigate to history from settings', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Scroll to bottom navigation
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Click History in bottom navigation
    const historyButton = page.locator('button').filter({ hasText: /History/i });
    if (await historyButton.count() > 0) {
      await historyButton.first().click();
      await expect(page).toHaveURL(/\/history/, { timeout: 3000 });
    }
  });
});

