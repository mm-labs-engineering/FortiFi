import { test, expect } from '@playwright/test';

test.describe('FortiFi Demo - Article Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display article list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('FortiFi Demo');
    await expect(page.locator('.article-card')).toHaveCount(2);
  });

  test('should navigate to article page', async ({ page }) => {
    await page.click('text=The Future of Web Security');
    await expect(page).toHaveURL(/\/article\/article-1/);
    await expect(page.locator('h1')).toContainText('The Future of Web Security');
  });

  test('should show premium content teaser', async ({ page }) => {
    await page.goto('/article/article-1');
    
    // Should show premium badge
    await expect(page.locator('.premium-badge')).toBeVisible();
    
    // Should show teaser content
    await expect(page.locator('.article-content')).toContainText('In this comprehensive guide');
    
    // Should show unlock button
    await expect(page.locator('#unlock-btn')).toBeVisible();
  });

  test('should unlock premium content', async ({ page }) => {
    await page.goto('/article/article-1');
    
    // Click unlock button
    await page.click('#unlock-btn');
    
    // Should show loading state
    await expect(page.locator('text=Unlocking...')).toBeVisible();
    
    // Wait for content to load
    await page.waitForSelector('text=Introduction', { timeout: 10000 });
    
    // Should show full content
    await expect(page.locator('.article-content')).toContainText('Web security has evolved dramatically');
    await expect(page.locator('.article-content')).toContainText('Current Threats');
    await expect(page.locator('.article-content')).toContainText('Modern Security Practices');
  });

  test('should display free content without paywall', async ({ page }) => {
    await page.goto('/article/article-2');
    
    // Should not show premium badge
    await expect(page.locator('.premium-badge')).not.toBeVisible();
    
    // Should show full content immediately
    await expect(page.locator('.article-content')).toContainText('What are Generics?');
    await expect(page.locator('.article-content')).toContainText('Basic Generic Function');
  });

  test('should handle invalid article ID', async ({ page }) => {
    await page.goto('/article/invalid-id');
    
    // Should show error message
    await expect(page.locator('text=Article not found')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('/api/token', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('/article/article-1');
    await page.click('#unlock-btn');
    
    // Should show error message
    await expect(page.locator('text=Failed to unlock article')).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Should display articles in mobile layout
    await expect(page.locator('.article-card')).toHaveCount(2);
    
    // Should be able to navigate to article
    await page.click('text=The Future of Web Security');
    await expect(page).toHaveURL(/\/article\/article-1/);
  });

  test('should maintain state across page refreshes', async ({ page }) => {
    await page.goto('/article/article-1');
    await page.click('#unlock-btn');
    
    // Wait for content to load
    await page.waitForSelector('text=Introduction', { timeout: 10000 });
    
    // Refresh page
    await page.reload();
    
    // Should still show unlocked content (if token is stored)
    await expect(page.locator('.article-content')).toContainText('Web security has evolved dramatically');
  });
});
