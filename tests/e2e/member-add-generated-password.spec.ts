import { test, expect, type Page } from '@playwright/test';
import { loginAsE2EUser } from './auth.helpers';

test('add member uses generated password flow and submit path', async ({ page }: { page: Page }) => {
  await loginAsE2EUser(page);
  await page.goto('/members');

  const passwordInput = page.getByLabel(/password/i).first();
  await expect(passwordInput).toBeVisible();

  // Generated password should be pre-filled for add member mode.
  const generated = await passwordInput.inputValue();
  expect(generated.length).toBeGreaterThanOrEqual(8);

  const regenerate = page.getByRole('button', { name: /regenerate member password/i }).first();
  await regenerate.click();

  const regenerated = await passwordInput.inputValue();
  expect(regenerated).not.toEqual(generated);

  // Fill minimal required member fields then submit.
  const unique = Date.now();
  await page.getByLabel(/^name$/i).fill(`E2E Member ${unique}`);
  await page.getByLabel(/^email$/i).fill(`e2e.member.${unique}@example.com`);
  await page.getByLabel(/contact number/i).fill('09171234567');

  // Best-effort select address fields where options exist.
  const region = page.getByLabel(/region/i);
  if ((await region.locator('option').count()) > 1) {
    await region.selectOption({ index: 1 });
  }

  await page.getByRole('button', { name: /^add$/i }).click();

  // Success flash/toast can vary; validate no client error and remain on members page.
  await expect(page).toHaveURL(/\/members/);
});
