import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /PMBOK学習管理システム/i })).toBeVisible();
  });

  test('should show all main feature cards', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check for main feature cards
    await expect(page.getByText('PMBOKマトリックスビュー')).toBeVisible();
    await expect(page.getByText('ネットワークダイアグラム')).toBeVisible();
    await expect(page.getByText('統合ビュー')).toBeVisible();
    await expect(page.getByText('PMP用語集')).toBeVisible();
    await expect(page.getByText('ビジュアライゼーションハブ')).toBeVisible();
    await expect(page.getByText('学習進捗ダッシュボード')).toBeVisible();
  });

  test('should navigate to matrix view when clicked', async ({ page }) => {
    await page.getByRole('link', { name: /PMBOKマトリックスビュー/i }).click();
    await expect(page).toHaveURL(/#\/matrix/);
  });

  test('should navigate to network view when clicked', async ({ page }) => {
    await page.getByRole('link', { name: /ネットワークダイアグラム/i }).click();
    await expect(page).toHaveURL(/#\/network/);
  });

  test('should navigate to glossary when clicked', async ({ page }) => {
    await page.getByRole('link', { name: /PMP用語集/i }).click();
    await expect(page).toHaveURL(/#\/glossary/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that content is still visible and accessible on mobile
    await expect(page.getByRole('heading', { name: /PMBOK学習管理システム/i })).toBeVisible();
    await expect(page.getByText('PMBOKマトリックスビュー')).toBeVisible();
  });

  test('should have proper accessibility', async ({ page }) => {
    // Check for proper heading structure
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    
    // Check that all interactive elements have accessible names
    const buttons = page.getByRole('button');
    const links = page.getByRole('link');
    
    const buttonCount = await buttons.count();
    const linkCount = await links.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      await expect(button).toHaveAccessibleName();
    }
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      await expect(link).toHaveAccessibleName();
    }
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Allow some time for any async errors
    await page.waitForTimeout(2000);
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('React Router Future Flag Warning') &&
      !error.includes('non-passive event listener')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/PMP Learning Management/i);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /PMBOK/i);
    
    // Check viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/i);
  });
});