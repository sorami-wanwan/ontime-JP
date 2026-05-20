import { expect, test } from '@playwright/test';

test('show warning when event crosses midnight', async ({ page }) => {
  await page.goto('/editor');

  await page.getByRole('button', { name: /(Edit|編集)/ }).click();
  await page.getByRole('button', { name: /(Absolute|絶対時間)/ }).click();

  await page.getByRole('button', { name: /(Rundown menu|進行表の管理\.\.\.)/ }).click();
  await page.getByRole('menuitem', { name: /(Clear all|すべてクリア)/ }).click();
  await page.getByRole('button', { name: /(Delete all|すべて削除)/ }).click();
  await expect(page.getByRole('dialog')).toBeHidden();

  await page.getByRole('button', { name: /(Create Event|イベントを作成)/ }).click();
  await page.getByTestId('entry-1').getByTestId('rundown-event').press('Alt+E');
  await page.getByTestId('entry-2').getByTestId('lock__end').getByRole('img').click();
  await page.getByTestId('entry-2').getByTestId('time-input-timeEnd').click();
  await page.getByTestId('entry-2').getByTestId('time-input-timeEnd').fill('23h');
  await page.getByTestId('entry-2').getByTestId('time-input-timeEnd').press('Enter');
  await page.getByTestId('entry-2').getByTestId('rundown-event').press('Alt+E');
  await page.getByTestId('entry-3').getByTestId('lock__start').click();
  await page.getByTestId('entry-3').getByTestId('time-input-duration').click();
  await page.getByTestId('entry-3').getByTestId('time-input-duration').fill('2h');
  await page.getByTestId('entry-3').getByTestId('time-input-duration').press('Enter');

  await expect(page.getByTestId('entry-3').getByTestId('event-warning')).toBeVisible();
});

test('show warning when event starts next day midnight', async ({ page }) => {
  await page.goto('/editor');

  await page.getByRole('button', { name: /(Edit|編集)/ }).click();
  await page.getByRole('button', { name: /(Absolute|絶対時間)/ }).click();

  await page.getByRole('button', { name: /(Rundown menu|進行表の管理\.\.\.)/ }).click();
  await page.getByRole('menuitem', { name: /(Clear all|すべてクリア)/ }).click();
  await page.getByRole('button', { name: /(Delete all|すべて削除)/ }).click();
  await expect(page.getByRole('dialog')).toBeHidden();

  await page.getByRole('button', { name: /(Create Event|イベントを作成)/ }).click();
  await page.getByTestId('entry-1').getByTestId('rundown-event').press('Alt+E');
  await page.getByTestId('entry-2').getByTestId('lock__end').click();
  await page.getByTestId('entry-2').getByTestId('time-input-timeEnd').click();
  await page.getByTestId('entry-2').getByTestId('time-input-timeEnd').fill('0');
  await page.getByTestId('entry-2').getByTestId('time-input-timeEnd').press('Enter');
  await page.getByTestId('entry-2').getByTestId('rundown-event').press('Alt+E');

  await expect(page.getByText('(next day)')).toBeVisible();
});
