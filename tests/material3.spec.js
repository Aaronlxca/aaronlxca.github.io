const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

test('Material 3 local package loads and supports keyboard and form controls', async ({ page }, info) => {
  test.skip(Boolean(process.env.AUDIT_BASE_URL), 'Development fixture uses local node_modules; not part of the deployed site');
  const errors = [];
  const external = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', request => {
    if (new URL(request.url()).hostname !== '127.0.0.1') external.push(request.url());
  });
  await page.goto('/_dev/material3.html');
  await expect(page.locator('html')).toHaveAttribute('data-material-ready', 'true');
  const action = page.getByRole('button', { name: 'Test action', exact: true });
  await action.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#result')).toHaveText('Action count: 1');
  const option = page.getByRole('checkbox', { name: 'Preview option', exact: true });
  await option.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('md-checkbox')).toHaveJSProperty('checked', true);
  const note = page.getByRole('textbox', { name: 'Preview note', exact: true });
  await note.fill('Local package verified');
  await expect(note).toHaveValue('Local package verified');
  await expect(page.locator('md-outlined-text-field')).toHaveJSProperty('value', 'Local package verified');
  await note.blur();
  await page.locator('md-outlined-text-field').evaluate(element => element.updateComplete);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
  const output = process.env.QA_OUTPUT_DIR ? path.resolve(process.env.QA_OUTPUT_DIR) : path.resolve(__dirname, '../test-results/evidence');
  fs.mkdirSync(path.join(output, 'screenshots'), { recursive: true });
  await page.screenshot({ path: path.join(output, 'screenshots', `${info.project.name}-material3-preview.png`), fullPage: true });
  await page.getByRole('button', { name: 'Reset preview', exact: true }).click();
  await expect(page.locator('#result')).toHaveText('Ready.');
  await expect(page.locator('md-checkbox')).toHaveJSProperty('checked', false);
  await expect(page.locator('md-outlined-text-field')).toHaveJSProperty('value', '');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
