import { expect, test, type Page } from '@playwright/test';

const fileToUpload = 'e2e/tests/fixtures/Ontime rundown template v4.xlsx';

test('imports spreadsheet and applies imported rundown to editor', async ({ page }) => {
  await page.goto('/editor');
  await page.getByRole('button', { name: /(Edit|編集)/ }).click();

  // clear the rundown
  await page.getByRole('button', { name: /(Rundown menu|進行表の管理\.\.\.)/ }).click();
  await page.getByRole('menuitem', { name: /(Clear all|すべてクリア)/ }).click();
  await page.getByRole('button', { name: /(Delete all|すべて削除)/ }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByTestId('rundown-event')).toHaveCount(0);

  // open the spreadsheet
  await page.getByTestId('navigation__toggle-settings').click();
  await page.getByRole('button', { name: /(Project settings|プロジェクト)/ }).click();
  await page
    .getByRole('button', { name: /(Import spreadsheet|スプレッドシートのインポート)/ })
    .first()
    .click();
  await expect(page.getByRole('heading', { name: /(Sources|ソース)/ })).toBeVisible();

  // upload the spreadsheet
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /(Start import|インポートを開始)/, exact: true }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(fileToUpload);
  const worksheetSelect = page.getByRole('combobox', { name: /(Worksheet|ワークシート)/, exact: true });
  await expect(worksheetSelect).toBeVisible();
  await worksheetSelect.click();
  await page.getByRole('option', { name: 'Event schedule advanced' }).click();
  await expect(worksheetSelect).toContainText('Event schedule advanced');

  // apply import
  await page.getByRole('button', { name: /(Preview import|インポートをプレビュー)/ }).click();
  await page.getByRole('button', { name: /(Apply import|インポートを適用)/ }).click();
  await expect(page.getByText(/(Import complete!|インポート完了！)/)).toBeVisible();
  await expect(
    page.getByText(
      /(Your imported data has been applied to the current rundown\.|インポートしたデータが現在の進行表に適用されました\。)/,
    ),
  ).toBeVisible();
  await page.getByRole('button', { name: /(Start new import|新しいインポートを開始)/ }).click();

  // verify the data in the rundown
  await page.getByRole('button', { name: /(Close settings|設定を閉じる)/ }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: /(Close settings|設定を閉じる)/ }).click();

  await expectGroupSummary(page, {
    title: 'Morning Sessions',
    entries: '5',
    start: '10:00:00',
    end: '12:00:00',
    duration: '2h',
  });
  await expectGroupSummary(page, {
    title: 'Lunch',
    entries: '1',
    start: '12:00:00',
    end: '13:00:00',
    duration: '1h',
  });
  await expectGroupSummary(page, {
    title: 'Afternoon Sessions',
    entries: '4',
    start: '13:00:00',
    end: '14:00:00',
    duration: '1h',
  });

  await expectInputValue(page, 'Lunch / Countdown to next session');

  await expectInputValue(page, '11:30 - House staff setup lunch in lobby');
});

async function expectGroupSummary(
  page: Page,
  {
    title,
    entries,
    start,
    end,
    duration,
  }: { title: string; entries: string; start: string; end: string; duration: string },
) {
  const group = page.getByTestId('rundown-group').filter({ has: page.locator(`input[value="${title}"]`) });

  await expect(group).toHaveCount(1);
  await expect(group).toContainText(/(Entries|エントリー数)/);
  await expect(group).toContainText(entries);
  await expect(group).toContainText(/(Start|開始)/);
  await expect(group).toContainText(start);
  await expect(group).toContainText(/(End|終了)/);
  await expect(group).toContainText(end);
  await expect(group).toContainText(/(Duration|所要時間)/);
  await expect(group).toContainText(duration);
}

async function expectInputValue(page: Page, value: string) {
  await expect(page.locator(`input[value="${value}"]`)).toHaveCount(1);
}
