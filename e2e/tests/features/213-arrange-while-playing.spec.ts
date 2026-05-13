import { expect, test } from '@playwright/test';

test('Rearrange while playing', async ({ page }) => {
  await page.goto('/rundown');
  await page.getByRole('button', { name: /(Edit|編集)/ }).click();

  // clear rundown
  await page.getByRole('button', { name: /(Rundown menu|進行表の管理\.\.\.)/ }).click();
  await page.getByRole('menuitem', { name: /(Clear all|すべてクリア)/ }).click();
  await page.getByRole('button', { name: /(Delete all|すべて削除)/ }).click();

  // create events
  await page.getByRole('button', { name: /(Create Event|イベントを作成)/ }).click();
  await page
    .getByRole('button', { name: /(Event|イベント)/ })
    .nth(4)
    .click();
  await page
    .getByRole('button', { name: /^(Event|イベント)$/ })
    .nth(1)
    .click();

  // start event 2
  await page
    .getByTestId('entry-2')
    .getByRole('button', { name: /(Start event|イベントを開始)/ })
    .click();
  await expect(page.getByTestId('entry-2').getByTestId('rundown-event')).toHaveAttribute('data-running');

  // move event 2 up
  await page.getByTestId('entry-2').getByTestId('rundown-event').locator('div').filter({ hasText: '2' }).click();
  await page
    .getByTestId('entry-2')
    .getByTestId('rundown-event')
    .locator('div')
    .filter({ hasText: '2' })
    .press('Alt+Control+ArrowUp');

  // event CUE1 should new be entry 2
  await expect(page.getByTestId('entry-2').getByTestId('rundown-event')).toContainText('1');
  // but entry 1 should be the one playing (it will be unlinked as it will be the first event)
  await expect(page.getByTestId('entry-1').getByTestId('rundown-event')).toHaveAttribute('data-running');
});

test('flag and unflag an event while playing', async ({ page }) => {
  await page.goto('/editor/');
  await page.getByRole('button', { name: /(Edit|編集)/ }).click();

  await page.getByRole('button', { name: /(Rundown menu|進行表の管理\.\.\.)/ }).click();
  await page.getByRole('menuitem', { name: /(Clear all|すべてクリア)/ }).click();
  await page.getByRole('button', { name: /(Delete all|すべて削除)/ }).click();
  await page.getByRole('button', { name: /(Create Event|イベントを作成)/ }).click();
  await page
    .getByRole('button', { name: /(Event|イベント)/ })
    .nth(4)
    .click();

  //start the the first event
  await page
    .getByTestId('entry-1')
    .getByRole('button', { name: /(Start event|イベントを開始)/ })
    .click();

  // there should be no flag times
  await expect(page.getByTestId('flag-plannedStart')).toContainText('––:––:––');
  await expect(page.getByTestId('flag-expectedStart')).toContainText('––:––:––');

  // set the flag
  await page.getByTestId('entry-2').getByTestId('rundown-event').getByText('2').click({
    button: 'right',
  });
  await page.getByRole('menuitem', { name: /(Add flag|フラグの追加)/ }).click();

  // now there should be flag times
  await expect(page.getByTestId('flag-plannedStart')).not.toContainText('––:––:––');
  await expect(page.getByTestId('flag-expectedStart')).not.toContainText('––:––:––');

  // remove the flag again
  await page.getByTestId('entry-2').getByTestId('rundown-event').getByText('2').click({
    button: 'right',
  });
  await page.getByRole('menuitem', { name: /(Remove flag|フラグの削除)/ }).click();

  // there should be no flag times
  await expect(page.getByTestId('flag-plannedStart')).toContainText('––:––:––');
  await expect(page.getByTestId('flag-expectedStart')).toContainText('––:––:––');
});
