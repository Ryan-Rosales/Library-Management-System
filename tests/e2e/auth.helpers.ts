import { Page, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export async function loginAsE2EUser(page: Page): Promise<void> {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set for browser tests.');
  }

  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();

  await expect(page).not.toHaveURL(/\/login$/);
}
