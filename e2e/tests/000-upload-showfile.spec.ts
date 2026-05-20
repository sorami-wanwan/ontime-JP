import { join } from 'path';
import { homedir } from 'os';
import { randomUUID } from 'crypto';
import { readFile, unlink } from 'fs/promises';

import { expect, test } from '@playwright/test';

const fileToUpload = 'e2e/tests/fixtures/e2e-test-db.json';
const fileToDownload = 'e2e/tests/fixtures/tmp/';

test.beforeAll(async () => {
  try {
    const projectFilePath = join(homedir(), '.Ontime', 'projects', 'e2e-test-db.json');
    await unlink(projectFilePath);
  } catch (error) {
    // Ignore if file doesn't exist
  }
});

test('project file upload', async ({ page }) => {
  await page.goto('/editor');

  // Welcome modal is now disabled globally during E2E tests via E2E_SKIP_WELCOME

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
  await page
    .locator('button')
    .filter({ hasText: /^(Import|インポート)$/ })
    .click();
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
