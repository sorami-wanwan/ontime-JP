import { randomUUID } from 'crypto';
import { readFile, unlink } from 'fs/promises';

import { expect, test } from '@playwright/test';

const fileToUpload = 'e2e/tests/fixtures/e2e-test-db.json';
const fileToDownload = 'e2e/tests/fixtures/tmp/';

test('project file upload', async ({ page }) => {
  await page.goto('/editor');

  // Try to close welcome modal if it appears (times out silently if not present)
  // Note: modal text is in Japanese as the app defaults to 'ja' before the test DB is loaded.
  // We use a 5000ms timeout (up from 1000ms) to handle slow WebSocket initialization in CI,
  // where the server's 'welcome' dialog message can arrive later than expected.
  // After closing, we wait for the modal to be fully hidden to prevent it from intercepting
  // subsequent clicks (race condition with modal closing animation).
  try {
    const welcomeText = page.getByText(/(Welcome to Ontime|Ontimeへようこそ)/);
    await welcomeText.waitFor({ state: 'visible', timeout: 5000 });
    await page.getByRole('button', { name: /(close welcome modal|ウェルカムモーダルを閉じる)/i }).click();
    await welcomeText.waitFor({ state: 'hidden', timeout: 5000 });
  } catch {
    // Modal wasn't shown, continue with the test
  }

  // Note: UI is in Japanese (ja) until the test DB (language: en) is loaded below.
  // We use regex to support both English and Japanese environments.
  await page.getByRole('button', { name: /(Edit|編集)/ }).click();
  await page.getByRole('button', { name: /(Rundown menu|進行表の管理\.\.\.)/ }).click();
  await page.getByRole('menuitem', { name: /(Clear all|すべてクリア)/ }).click();
  await page.getByRole('button', { name: /(Delete all|すべて削除)/ }).click();

  await page.getByRole('button', { name: 'toggle settings' }).click();
  await page.getByRole('button', { name: /(Manage projects|プロジェクトの管理)/ }).click();

  // workaround to upload file on hidden input
  // https://playwright.dev/docs/api/class-filechooser
  const fileChooserPromise = page.waitForEvent('filechooser');
  // 'インポート' is correctly translated via 'settings.project.import'
  await page.getByRole('button', { name: /(Import|インポート)/, exact: true }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(fileToUpload);

  // Note: The modal close button is hardcoded in English ('Close settings')
  await page.getByRole('button', { name: 'Close settings' }).click();

  // asset test events
  const firstTitle = page.getByTestId('entry-1').getByTestId('entry__title');
  await expect(firstTitle).toHaveValue('Albania');

  const secondTitle = page.getByTestId('entry-2').getByTestId('entry__title');
  await expect(secondTitle).toHaveValue('Latvia');

  const thirdTitle = page.getByTestId('entry-3').getByTestId('entry__title');
  await expect(thirdTitle).toHaveValue('Lithuania');
});

//TODO: this works when testing locally, but not in github actions
test.fixme('project file download', async ({ page }) => {
  await page.goto('/editor/?settings=project__manage');

  await page
    .getByRole('row', { name: /.*currently loaded/i })
    .getByLabel('Options')
    .click();
  // workaround to download
  // https://playwright.dev/docs/api/class-download
  const downloadPromise = page.waitForEvent('download', { timeout: 10_000 });
  await page.getByRole('menuitem', { name: 'Download' }).click();

  const download = await downloadPromise;

  // Wait for the download process to complete and save the downloaded file somewhere.
  const uniqFileToDownload = fileToDownload + randomUUID() + '.json';
  await download.saveAs(uniqFileToDownload);
  expect(download.failure()).toMatchObject({});

  const original = JSON.parse(await readFile(fileToUpload, { encoding: 'utf-8' }));
  const fromServer = JSON.parse(await readFile(uniqFileToDownload, { encoding: 'utf-8' }));

  await unlink(uniqFileToDownload);

  // when a file is parsed, the server will write the version number to the project file
  original.settings.version = 'not-important';
  fromServer.settings.version = 'not-important';
  expect(original).toMatchObject(fromServer);
});
