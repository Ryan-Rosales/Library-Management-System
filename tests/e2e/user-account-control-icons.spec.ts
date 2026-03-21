import { test, expect, type Page } from '@playwright/test';
import { loginAsE2EUser } from './auth.helpers';

test('user account control icon interactions work', async ({ page }: { page: Page }) => {
  await loginAsE2EUser(page);
  await page.goto('/settings/user-account-control');

  const panelToggle = page.getByRole('button', { name: /minimize forgot-password panel|maximize forgot-password panel/i });
  await expect(panelToggle).toBeVisible();

  await panelToggle.click();
  await expect(page.getByText(/forgot-password panel is minimized/i)).toBeVisible();

  await panelToggle.click();
  await expect(page.getByText(/pending request/i)).toBeVisible();

  const autoGenerateButton = page.getByRole('button', { name: /auto-generate member password/i }).first();
  if (await autoGenerateButton.isVisible()) {
    const passwordInput = page.locator('#password');
    const oldValue = await passwordInput.inputValue();
    await autoGenerateButton.click();
    const newValue = await passwordInput.inputValue();
    expect(newValue).not.toEqual(oldValue);
  }
});
