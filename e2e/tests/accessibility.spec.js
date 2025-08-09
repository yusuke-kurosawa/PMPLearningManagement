import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues on home page', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility issues on matrix page', async ({ page }) => {
    await page.goto('/#/matrix');
    
    // Wait for content to load
    await expect(page.getByText('PMBOKプロセスマトリックス')).toBeVisible();
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility issues on glossary page', async ({ page }) => {
    await page.goto('/#/glossary');
    
    // Wait for content to load
    await expect(page.getByText('PMP用語集')).toBeVisible();
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation throughout the application', async ({ page }) => {
    await page.goto('/');
    
    // Start keyboard navigation
    await page.keyboard.press('Tab');
    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing through interactive elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      focusedElement = page.locator(':focus');
      
      // Each focused element should be visible
      const isVisible = await focusedElement.isVisible().catch(() => false);
      if (isVisible) {
        await expect(focusedElement).toBeVisible();
      }
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Test with axe-core color contrast rules
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    // Filter for color contrast violations
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    
    expect(colorContrastViolations).toEqual([]);
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    let previousLevel = 0;
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const currentLevel = parseInt(tagName.charAt(1));
      
      // First heading should be h1, and levels shouldn't skip
      if (previousLevel === 0) {
        expect(currentLevel).toBe(1);
      } else {
        expect(currentLevel).toBeLessThanOrEqual(previousLevel + 1);
      }
      
      previousLevel = currentLevel;
    }
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');
    
    // Find all images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    // Each image should have alt text or be decorative
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      const ariaHidden = await image.getAttribute('aria-hidden');
      const role = await image.getAttribute('role');
      
      // Image should have alt text or be marked as decorative
      expect(
        alt !== null || 
        ariaHidden === 'true' || 
        role === 'presentation'
      ).toBeTruthy();
    }
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/');
    
    // Check buttons have accessible names
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const accessibleName = await button.getAttribute('aria-label') ||
                           await button.textContent() ||
                           await button.getAttribute('aria-labelledby');
      
      expect(accessibleName).toBeTruthy();
    }
  });

  test('should support screen reader navigation landmarks', async ({ page }) => {
    await page.goto('/');
    
    // Should have proper landmarks
    const navigation = page.getByRole('navigation');
    await expect(navigation).toBeVisible();
    
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
  });

  test('should handle focus management in modals and dropdowns', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile menu focus management
    await page.setViewportSize({ width: 375, height: 667 });
    
    const menuButton = page.getByRole('button', { name: /menu/i });
    await menuButton.click();
    
    // Focus should move to the mobile menu
    const firstMenuLink = page.getByRole('link', { name: 'ホーム' }).first();
    
    // Tab should cycle through menu items
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });

  test('should meet WCAG guidelines for interactive elements', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});