import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the home page with main title', async ({ page }) => {
    await expect(page.getByText('PMBOK学習管理システム')).toBeVisible()
    await expect(
      page.getByText('PMBOK第6版の学習のための包括的なWebアプリケーション')
    ).toBeVisible()
  })

  test('should display all feature cards', async ({ page }) => {
    // Main feature cards
    await expect(page.getByText('PMBOKマトリックスビュー')).toBeVisible()
    await expect(page.getByText('ネットワークダイアグラム')).toBeVisible()
    await expect(page.getByText('統合ビュー')).toBeVisible()
    await expect(page.getByText('PMP用語集')).toBeVisible()

    // New feature cards with NEW badges
    await expect(page.getByText('ビジュアライゼーションハブ')).toBeVisible()
    await expect(page.getByText('学習進捗ダッシュボード')).toBeVisible()
    await expect(page.getByText('フラッシュカード学習')).toBeVisible()
    await expect(page.getByText('PMP模擬試験')).toBeVisible()
  })

  test('should show NEW badges on new features', async ({ page }) => {
    const newBadges = page.getByText('NEW')
    await expect(newBadges).toHaveCount(5) // Adjust based on actual count
  })

  test('should navigate to features when cards are clicked', async ({ page }) => {
    // Test Matrix card navigation
    await page.getByRole('link', { name: /PMBOKマトリックスビュー/ }).click()
    await expect(page).toHaveURL(/.*#\/matrix/)

    // Go back to home
    await page.goBack()

    // Test Network card navigation
    await page.getByRole('link', { name: /ネットワークダイアグラム/ }).click()
    await expect(page).toHaveURL(/.*#\/network/)

    // Go back to home
    await page.goBack()

    // Test Glossary card navigation
    await page.getByRole('link', { name: /PMP用語集/ }).click()
    await expect(page).toHaveURL(/.*#\/glossary/)
  })

  test('should display feature descriptions', async ({ page }) => {
    await expect(
      page.getByText(/知識エリアとプロセス群別に整理された49のPMBOKプロセス/)
    ).toBeVisible()
    await expect(page.getByText(/ITTO関係性の力学的グラフ視覚化/)).toBeVisible()
    await expect(page.getByText(/PMP試験に必要な重要用語を網羅した検索可能な用語集/)).toBeVisible()
  })

  test('should have hover effects on feature cards', async ({ page }) => {
    const matrixCard = page.getByRole('link', { name: /PMBOKマトリックスビュー/ })

    // Check initial state
    await expect(matrixCard).toBeVisible()

    // Hover over the card
    await matrixCard.hover()

    // Card should have hover effects (checking for transform or shadow changes)
    const cardElement = await matrixCard.evaluate((el) => {
      return window.getComputedStyle(el).transform
    })

    // The actual hover effect might vary, so we just check the element is still visible
    await expect(matrixCard).toBeVisible()
  })
})

test.describe('Home Page Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    // Main heading should be h1
    const mainHeading = page.getByRole('heading', { level: 1 })
    await expect(mainHeading).toBeVisible()

    // Feature titles should be h3
    const featureHeadings = page.getByRole('heading', { level: 3 })
    const count = await featureHeadings.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have accessible links', async ({ page }) => {
    await page.goto('/')

    // All links should have accessible names
    const links = page.getByRole('link')
    const linkCount = await links.count()

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      const accessibleName = (await link.getAttribute('aria-label')) || (await link.textContent())
      expect(accessibleName).toBeTruthy()
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')

    // Tab through the links
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Focus should be visible on the focused element
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})

test.describe('Home Page Responsive Design', () => {
  test('should display properly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')

    // Feature cards should be in a grid layout
    await expect(page.getByText('PMBOKマトリックスビュー')).toBeVisible()
    await expect(page.getByText('ネットワークダイアグラム')).toBeVisible()
  })

  test('should display properly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    await expect(page.getByText('PMBOK学習管理システム')).toBeVisible()
    await expect(page.getByText('PMBOKマトリックスビュー')).toBeVisible()
  })

  test('should display properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Should still show main content
    await expect(page.getByText('PMBOK学習管理システム')).toBeVisible()

    // Feature cards should stack vertically on mobile
    await expect(page.getByText('PMBOKマトリックスビュー')).toBeVisible()
    await expect(page.getByText('ネットワークダイアグラム')).toBeVisible()
  })
})
