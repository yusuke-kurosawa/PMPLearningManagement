import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main navigation', async ({ page }) => {
    // Check that the main navigation is visible
    await expect(page.getByText('PMBOK学習システム')).toBeVisible();
    
    // Check navigation items are present
    await expect(page.getByRole('link', { name: 'ホーム' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'マトリックス' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ネットワーク図' })).toBeVisible();
    await expect(page.getByRole('link', { name: '用語集' })).toBeVisible();
  });

  test('should navigate to different pages', async ({ page }) => {
    // Navigate to Matrix page
    await page.getByRole('link', { name: 'マトリックス' }).click();
    await expect(page).toHaveURL(/.*#\/matrix/);
    
    // Navigate to Network page
    await page.getByRole('link', { name: 'ネットワーク図' }).click();
    await expect(page).toHaveURL(/.*#\/network/);
    
    // Navigate to Glossary page
    await page.getByRole('link', { name: '用語集' }).click();
    await expect(page).toHaveURL(/.*#\/glossary/);
    
    // Navigate back to Home
    await page.getByRole('link', { name: 'ホーム' }).click();
    await expect(page).toHaveURL(/.*#\//);
  });

  test('should highlight active navigation item', async ({ page }) => {
    // Home should be active initially
    const homeLink = page.getByRole('link', { name: 'ホーム' });
    await expect(homeLink).toHaveClass(/bg-blue-500/);
    
    // Click Matrix link and check it becomes active
    await page.getByRole('link', { name: 'マトリックス' }).click();
    const matrixLink = page.getByRole('link', { name: 'マトリックス' });
    await expect(matrixLink).toHaveClass(/bg-blue-500/);
  });

  test('should toggle dark mode', async ({ page }) => {
    // Find and click the dark mode toggle
    const darkModeToggle = page.getByRole('button', { name: /ダークモードに切り替え|ライトモードに切り替え/ });
    await darkModeToggle.click();
    
    // Check that dark mode classes are applied
    await expect(page.locator('nav')).toHaveClass(/dark:bg-gray-800/);
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should show mobile menu button on small screens', async ({ page }) => {
    await page.goto('/');
    
    // Mobile menu button should be visible
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();
  });

  test('should toggle mobile menu', async ({ page }) => {
    await page.goto('/');
    
    // Click menu button to open mobile menu
    const menuButton = page.getByRole('button', { name: /menu/i });
    await menuButton.click();
    
    // Mobile menu should be visible
    const mobileMenu = page.locator('.md\\:hidden').filter({ hasText: 'マトリックス' });
    await expect(mobileMenu).toBeVisible();
    
    // Click X button to close menu
    const closeButton = page.getByRole('button', { name: /menu/i });
    await closeButton.click();
  });

  test('should navigate using mobile menu', async ({ page }) => {
    await page.goto('/');
    
    // Open mobile menu
    const menuButton = page.getByRole('button', { name: /menu/i });
    await menuButton.click();
    
    // Click on Matrix link in mobile menu
    await page.getByRole('link', { name: 'マトリックス' }).click();
    
    // Should navigate to matrix page
    await expect(page).toHaveURL(/.*#\/matrix/);
    
    // Mobile menu should be closed after navigation
    const mobileMenu = page.locator('.md\\:hidden').filter({ hasText: 'マトリックス' });
    await expect(mobileMenu).not.toBeVisible();
  });
});