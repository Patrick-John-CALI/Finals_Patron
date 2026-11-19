
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { AdminUsersPage } from '../../pages/AdminUsersPage';

test('ADM-05 - Search for an exact username', async ({ page }) => {
  const login = new LoginPage(page);
  const admin = new AdminUsersPage(page);

  // Open login page
  await login.goto();

  // Login as administrator
  await login.login(
    process.env.ORANGE_USERNAME!,
    process.env.ORANGE_PASSWORD!
  );

  // Verify dashboard
  await login.expectDashboard();

  // Open Admin module
  await admin.openAdmin();

  // Verify user management page
  await admin.expectUserList();

  // Search for existing username
  await admin.searchUsername('Admin');

  // Verify matching username appears
  await admin.expectUsername('Admin');

  // Verify search results contain the expected username
  await expect(
    page.getByRole('row').filter({ hasText: 'Admin' }).first()
  ).toBeVisible();
});
