import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('/onboarding');
  });

  test('should display intro step', async ({ page }) => {
    // Should see intro content
    await expect(page.locator('text=Meet Your HabitPet')).toBeVisible();
    await expect(page.locator('text=I want to eat healthier')).toBeVisible();
    
    // Should have "Let's Get Started!" button
    await expect(page.locator('button:has-text("Let\'s Get Started!")')).toBeVisible();
  });

  test('should progress through all onboarding steps', async ({ page }) => {
    // Step 1: Intro
    await expect(page.locator('text=Meet Your HabitPet')).toBeVisible();
    await page.click('button:has-text("Let\'s Get Started!")');

    // Step 2: Signup
    await expect(page.locator('text=Tell us about yourself')).toBeVisible();
    await page.fill('input[placeholder="Your name"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    
    // Continue button should be enabled after filling required fields
    const continueButton = page.locator('button:has-text("Continue")');
    await expect(continueButton).toBeEnabled();
    await continueButton.click();

    // Step 3: Biometrics
    await expect(page.locator('text=Basic Info')).toBeVisible();
    await page.fill('input[placeholder="25"]', '25');
    await page.fill('input[placeholder="170"]', '170');
    await page.fill('input[placeholder="70"]', '70');
    
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    // Step 4: Dietary Preferences
    await expect(page.locator('text=Dietary Preferences')).toBeVisible();
    // Select at least one dietary preference (optional, but let's test it)
    const dietaryButtons = page.locator('button').filter({ hasText: /Vegetarian|Vegan|Gluten-Free|Keto/i });
    if (await dietaryButtons.count() > 0) {
      await dietaryButtons.first().click();
    }
    
    await page.click('button:has-text("Next")');

    // Step 5: Food Preferences
    await expect(page.locator('text=Food Preferences')).toBeVisible();
    // Select some food preferences
    const foodButtons = page.locator('button').filter({ hasText: /🍎|🍌|🥗/i });
    if (await foodButtons.count() > 0) {
      await foodButtons.first().click();
    }
    
    // Complete onboarding
    await page.click('button:has-text("Done! Start Journey")');

    // Should redirect to dashboard/home after completion
    await expect(page).toHaveURL(/\/$|\/dashboard/, { timeout: 5000 });
  });

  test('should validate required fields in signup step', async ({ page }) => {
    // Go to signup step
    await page.click('button:has-text("Let\'s Get Started!")');
    
    // Continue button should be disabled when fields are empty
    const continueButton = page.locator('button:has-text("Continue")');
    await expect(continueButton).toBeDisabled();

    // Fill name only - should still be disabled
    await page.fill('input[placeholder="Your name"]', 'Test User');
    await expect(continueButton).toBeDisabled();

    // Fill email - should now be enabled
    await page.fill('input[type="email"]', 'test@example.com');
    await expect(continueButton).toBeEnabled();
  });

  test('should validate required fields in biometrics step', async ({ page }) => {
    // Navigate to biometrics step
    await page.click('button:has-text("Let\'s Get Started!")');
    await page.fill('input[placeholder="Your name"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Continue")');

    // Next button should be disabled when fields are empty
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeDisabled();

    // Fill age only
    await page.fill('input[placeholder="25"]', '25');
    await expect(nextButton).toBeDisabled();

    // Fill height
    await page.fill('input[placeholder="170"]', '170');
    await expect(nextButton).toBeDisabled();

    // Fill weight - should now be enabled
    await page.fill('input[placeholder="70"]', '70');
    await expect(nextButton).toBeEnabled();
  });

  test('should allow selecting multiple dietary preferences', async ({ page }) => {
    // Navigate to dietary preferences step
    await page.click('button:has-text("Let\'s Get Started!")');
    await page.fill('input[placeholder="Your name"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Continue")');
    await page.fill('input[placeholder="25"]', '25');
    await page.fill('input[placeholder="170"]', '170');
    await page.fill('input[placeholder="70"]', '70');
    await page.click('button:has-text("Next")');

    // Should see dietary preferences
    await expect(page.locator('text=Dietary Preferences')).toBeVisible();

    // Click multiple preferences
    const preferenceButtons = page.locator('button').filter({ hasText: /Vegetarian|Vegan|Gluten-Free/i });
    const count = await preferenceButtons.count();
    
    if (count > 0) {
      // Click first preference
      await preferenceButtons.first().click();
      
      // Click another if available
      if (count > 1) {
        await preferenceButtons.nth(1).click();
      }
    }

    // Should be able to proceed
    await expect(page.locator('button:has-text("Next")')).toBeEnabled();
  });

  test('should allow selecting multiple food preferences', async ({ page }) => {
    // Navigate to food preferences step
    await page.click('button:has-text("Let\'s Get Started!")');
    await page.fill('input[placeholder="Your name"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Continue")');
    await page.fill('input[placeholder="25"]', '25');
    await page.fill('input[placeholder="170"]', '170');
    await page.fill('input[placeholder="70"]', '70');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")'); // Skip dietary preferences

    // Should see food preferences
    await expect(page.locator('text=Food Preferences')).toBeVisible();

    // Click multiple food preferences
    const foodButtons = page.locator('button').filter({ hasText: /🍎|🍌|🥗|🍗|🥑/i });
    const count = await foodButtons.count();
    
    if (count > 0) {
      // Click first food
      await foodButtons.first().click();
      
      // Click another if available
      if (count > 1) {
        await foodButtons.nth(1).click();
      }
    }

    // Should be able to complete onboarding
    await expect(page.locator('button:has-text("Done! Start Journey")')).toBeEnabled();
  });
});

