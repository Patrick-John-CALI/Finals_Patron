import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { AdminUsersPage } from '../../pages/AdminUsersPage';

test('ADM-04 - User list and filters are displayed', async ({ page }) => {
  const login = new LoginPage(page);
  const admin = new AdminUsersPage(page);

  await login.goto();

  await login.login(
    process.env.ORANGE_USERNAME!,
    process.env.ORANGE_PASSWORD!
  );

  await admin.openAdmin();
  await admin.expectUserList();

  await expect(page.getByRole('button', {
    name: 'Search'
  })).toBeVisible();

  await expect(page.getByRole('button', {
    name: 'Reset'
  })).toBeVisible();
});