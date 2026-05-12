import { expect, test } from '@playwright/test';

test('View params configures timer view', async ({ page }) => {
  await page.goto('/timer');

  // Implement a robust waiting strategy:
  // The application starts with the default Japanese ('ja') localization, rendering '現在時刻'.
  // However, the test fixtures (applied asynchronously) use 'en', which eventually changes it to 'TIME NOW'.
  // We use a regex to wait for either state, ensuring the UI has loaded before proceeding.
  await expect(page.getByText(/TIME NOW|現在時刻/i)).toBeInViewport({ timeout: 10000 });

  // Ensure the application environment has finished applying test fixtures (language: 'en')
  // before the test performs further interactions.
  await expect(page.getByText(/TIME NOW/i)).toBeInViewport({ timeout: 10000 });

  await page.mouse.move(Math.random() * 100, Math.random() * 100);
  await page.getByTestId('navigation__toggle-settings').click();
  await page.locator('label').filter({ hasText: 'Hide Time NowHides the Time' }).locator('span').nth(2).click();
  await page.getByTestId('apply-view-params').click();

  await expect(page.getByText(/TIME NOW|現在時刻/i)).not.toBeInViewport();
  await expect(page).toHaveURL(/.*hideClock=true/);
});
