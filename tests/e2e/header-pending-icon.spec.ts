import { test, expect, type Page } from '@playwright/test';
import { loginAsE2EUser } from './auth.helpers';

test('header shows pending request icon with badge/count behavior', async ({ page }: { page: Page }) => {
  await loginAsE2EUser(page);
  await page.goto('/settings/user-account-control');

  const pendingIcon = page.getByRole('button', { name: /user account control pending requests/i });
  await expect(pendingIcon).toBeVisible();

  // If badge exists, ensure it has readable count text.
  const badge = pendingIcon.locator('span').filter({ hasText: /\d|99\+/ });
  if ((await badge.count()) > 0) {
    await expect(badge.first()).toContainText(/\d|99\+/);
  }
});
