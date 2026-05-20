import { expect, test } from '@playwright/test';

test('delays add time to events', async ({ page }) => {
  await page.goto('/editor');

  // delete all events and add a new one
  await page.getByRole('button', { name: /(Edit|編集)/ }).click();
  await page.getByRole('button', { name: /(Rundown menu|進行表の管理\.\.\.)/ }).click();
  await page.getByRole('menuitem', { name: /(Clear all|すべてクリア)/ }).click();
  await page.getByRole('button', { name: /(Delete all|すべて削除)/ }).click();
  await page.getByRole('button', { name: /(Create event|イベントを作成)/i }).click();

  // add data to new event
  await page
    .getByTestId('rundown')
    .getByPlaceholder(/(Start|開始)/)
    .click();
  await page
    .getByTestId('rundown')
    .getByPlaceholder(/(Start|開始)/)
    .fill('10m');
  await page
    .getByTestId('rundown')
    .getByPlaceholder(/(Start|開始)/)
    .press('Enter');
  await page
    .getByTestId('rundown')
    .getByPlaceholder(/(Duration|予定所要時間)/)
    .click();
  await page
    .getByTestId('rundown')
    .getByPlaceholder(/(Duration|予定所要時間)/)
    .fill('20m');
  await page
    .getByTestId('rundown')
    .getByPlaceholder(/(Duration|予定所要時間)/)
    .press('Enter');

  // add delay
  await page
    .getByRole('button', { name: /(Delay|ディレイ)/ })
    .nth(0)
    .click();

  // fill positive delay
  await page.getByTestId('delay-input').click();
  await page.getByTestId('delay-input').fill('2m');
  await page.getByTestId('delay-input').press('Enter');
  await page.getByText(/(New start|新しい開始時間).*00:12/).click();

  // make negative delay
  await page.getByText(/(Subtract time|時間を減らす)/).click();
  await page.getByText(/(New start|新しい開始時間).*00:08/).click();

  // apply delay
  await page.getByRole('button', { name: /(Make permanent|反映する)/ }).click();
  await expect(page.getByTestId('rundown').getByTestId('time-input-timeStart')).toHaveValue('00:08:00');

  // add new delay
  await page
    .getByTestId('rundown')
    .getByPlaceholder(/(Start|開始)/)
    .click();
  await page
    .getByRole('button', { name: /(Delay|ディレイ)/ })
    .nth(0)
    .click();
  await page.getByTestId('delay-input').click();
  await page.getByTestId('delay-input').fill('10m');
  await page.getByTestId('delay-input').press('Enter');
  await page.getByText(/(New start|新しい開始時間).*00:18/).click();

  // cancel delay
  await page.getByRole('button', { name: /(Cancel|キャンセル)/ }).click();
  await expect(page.getByTestId('rundown').getByTestId('time-input-timeStart')).toHaveValue('00:08:00');
  await expect(page.getByText(/(New start|新しい開始時間).*00:18/)).toHaveCount(0);
});

test('delays are show correctly', async ({ page }) => {
  await page.goto('/editor');

  // add a test event
  await page.getByRole('button', { name: /(Edit|編集)/ }).click();
  await page.getByRole('button', { name: /(Rundown menu|進行表の管理\.\.\.)/ }).click();
  await page.getByRole('menuitem', { name: /(Clear all|すべてクリア)/ }).click();
  await page.getByRole('button', { name: /(Delete all|すべて削除)/ }).click();
  await page.getByRole('button', { name: /(Create Event|イベントを作成)/ }).click();

  await page.getByTestId('time-input-timeStart').click();
  await page.getByTestId('rundown').getByTestId('time-input-timeStart').click();
  await page.getByTestId('rundown').getByTestId('time-input-timeStart').fill('10');
  await page.getByTestId('rundown').getByTestId('time-input-timeStart').press('Enter');
  await page.getByTestId('rundown').getByTestId('time-input-duration').click();
  await page.getByTestId('rundown').getByTestId('time-input-duration').fill('10');
  await page.getByTestId('rundown').getByTestId('time-input-duration').press('Enter');
  await page.getByTestId('entry__title').click();
  await page.getByTestId('entry__title').fill('test');
  await page.getByTestId('entry__title').press('Enter');
  await expect(page.getByTestId('entry-1').locator('#entry-status')).toHaveAttribute('data-timerType', 'count-down');

  // add a delay
  await page
    .getByRole('button', { name: /(Delay|ディレイ)/ })
    .nth(0)
    .click();
  await page.getByTestId('delay-input').click();
  await page.getByTestId('delay-input').fill('1');
  await page.getByTestId('delay-input').press('Enter');

  // delay is shown in the editor
  await page.getByText(/(New start|新しい開始時間).*00:11/).click();

  // delay is shown in the cuesheet
  await page.goto('/cuesheet');
  await page.getByRole('cell', { name: 'Delayed by 1 min' }).click();

  // delay is shown in the backstage view
  await page.goto('/backstage');
  await page.getByText('00:11→00:21').click();
});
