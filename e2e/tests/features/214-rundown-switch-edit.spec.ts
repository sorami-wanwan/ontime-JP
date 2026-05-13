import { expect, test } from '@playwright/test';

test('switching rundowns preserves edits per rundown', async ({ page }) => {
  const suffix = Date.now();
  const nameA = `Rundown A ${suffix}`;
  const nameB = `Rundown B ${suffix}`;

  await page.goto('/editor');

  await expect(page.getByTestId('editor-container')).toBeVisible();

  const editButton = page.getByRole('button', { name: /(Edit|編集)/ }).first();
  await editButton.click();

  // open manage rundowns and create Rundown A
  await page.getByRole('button', { name: /(Rundown menu|進行表の管理\.\.\.)/ }).click();
  await page.getByRole('menuitem', { name: /(Manage Rundowns\.\.\.|進行表の管理\.\.\.)/ }).click();

  await page.getByRole('heading', { name: 'Rundowns' }).getByRole('button', { name: /(New|新規)/ }).click();
  await page.getByPlaceholder('e.g., Main Stage, Morning Session').fill(nameA);
  await page.getByRole('button', { name: /(Create rundown|進行表を作成)/ }).click();
  await expect(page.getByRole('row', { name: nameA })).toBeVisible();

  // load Rundown A
  await page.getByRole('row', { name: nameA }).getByRole('button').click();
  await page.getByRole('menuitem', { name: /^(Load|読み込み)$/ }).click();
  await page.getByRole('button', { name: /(Load rundown|進行表を読み込む)/ }).click();
  await expect(page.getByRole('row', { name: nameA }).getByText(/(Loaded|読み込み済み|スタンバイ)/)).toBeVisible();

  // close settings and add an event to Rundown A
  await page.getByRole('button', { name: /(Close settings|設定を閉じる)/ }).click();
  await page.getByRole('button', { name: /(Create Event|イベントを作成)/ }).click();
  await page.getByTestId('entry-1').getByTestId('entry__title').fill('Event in rundown A');
  await page.getByTestId('entry-1').getByTestId('entry__title').press('Enter');

  // open manage rundowns and create Rundown B
  await page.getByRole('button', { name: /(Rundown menu|進行表の管理\.\.\.)/ }).click();
  await page.getByRole('menuitem', { name: /(Manage Rundowns\.\.\.|進行表の管理\.\.\.)/ }).click();

  await page.getByRole('heading', { name: 'Rundowns' }).getByRole('button', { name: /(New|新規)/ }).click();
  await page.getByPlaceholder('e.g., Main Stage, Morning Session').fill(nameB);
  await page.getByRole('button', { name: /(Create rundown|進行表を作成)/ }).click();
  await expect(page.getByRole('row', { name: nameB })).toBeVisible();

  // load Rundown B
  await page.getByRole('row', { name: nameB }).getByRole('button').click();
  await page.getByRole('menuitem', { name: /^(Load|読み込み)$/ }).click();
  await page.getByRole('button', { name: /(Load rundown|進行表を読み込む)/ }).click();
  await expect(page.getByRole('row', { name: nameB }).getByText(/(Loaded|読み込み済み|スタンバイ)/)).toBeVisible();

  // close settings and add an event to Rundown B
  await page.getByRole('button', { name: /(Close settings|設定を閉じる)/ }).click();
  await expect(page.getByTestId('rundown-event')).toHaveCount(0);
  await page.getByRole('button', { name: /(Create Event|イベントを作成)/ }).click();
  await page.getByTestId('entry-1').getByTestId('entry__title').fill('Event in rundown B');
  await page.getByTestId('entry-1').getByTestId('entry__title').press('Enter');

  // switch back to Rundown A and verify its event is preserved
  await page.getByRole('button', { name: /(Rundown menu|進行表の管理\.\.\.)/ }).click();
  await page.getByRole('menuitem', { name: /(Manage Rundowns\.\.\.|進行表の管理\.\.\.)/ }).click();
  await page.getByRole('row', { name: nameA }).getByRole('button').click();
  await page.getByRole('menuitem', { name: /^(Load|読み込み)$/ }).click();
  await page.getByRole('button', { name: /(Load rundown|進行表を読み込む)/ }).click();
  await page.getByRole('button', { name: /(Close settings|設定を閉じる)/ }).click();

  await expect(page.getByTestId('entry-1').getByTestId('entry__title')).toHaveValue('Event in rundown A');
  await expect(page.getByTestId('rundown-event')).toHaveCount(1);

  // switch back to Rundown B and verify its event is preserved
  await page.getByRole('button', { name: /(Rundown menu|進行表の管理\.\.\.)/ }).click();
  await page.getByRole('menuitem', { name: /(Manage Rundowns\.\.\.|進行表の管理\.\.\.)/ }).click();
  await page.getByRole('row', { name: nameB }).getByRole('button').click();
  await page.getByRole('menuitem', { name: /^(Load|読み込み)$/ }).click();
  await page.getByRole('button', { name: /(Load rundown|進行表を読み込む)/ }).click();
  await page.getByRole('button', { name: /(Close settings|設定を閉じる)/ }).click();

  await expect(page.getByTestId('entry-1').getByTestId('entry__title')).toHaveValue('Event in rundown B');
  await expect(page.getByTestId('rundown-event')).toHaveCount(1);
});
