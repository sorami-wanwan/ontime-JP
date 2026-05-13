import { test, expect } from '@playwright/test';

test('regex test', async ({ page }) => {
  await page.setContent('<div>Time now</div><div>現在時刻</div>');

  await expect(page.getByText(/TIME NOW|現在時刻/i).first()).toBeVisible();
});
