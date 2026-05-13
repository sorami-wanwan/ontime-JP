import { expect, test } from '@playwright/test';

test('View params configures timer view', async ({ page }) => {
  await page.goto('/timer');

  // The application starts with the default Japanese ('ja') localization, rendering '現在時刻'.
  // The test DB fixture (language: 'en') is loaded asynchronously by the preceding 000-upload-showfile test,
  // which eventually changes the label to 'Time now'. We accept either localization here.
  // Note: We use anchors (^...$) to ensure exact match and avoid strict mode violations
  // caused by other text in the UI containing 'Time Now' (e.g. 'Hide Time Now').
  await expect(page.getByText(/^(TIME NOW|現在時刻)$/i)).toBeInViewport({ timeout: 10000 });

  await page.mouse.move(Math.random() * 100, Math.random() * 100);
  await page.getByTestId('navigation__toggle-settings').click();
  await page.locator('label').filter({ hasText: 'Hide Time NowHides the Time' }).locator('span').nth(2).click();
  await page.getByTestId('apply-view-params').click();

  await expect(page.getByText(/^(TIME NOW|現在時刻)$/i)).not.toBeInViewport();
  await expect(page).toHaveURL(/.*hideClock=true/);
});
