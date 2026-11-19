
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { AdminUsersPage } from '../../pages/AdminUsersPage';

test('ADM-01 - Authorized administrator opens Admin module', async ({ page }) => {
  const login = new LoginPage(page);
  const admin = new AdminUsersPage(page);

  // Open OrangeHRM login page
  await login.goto();

  // Login as administrator
  await login.login(
    process.env.ORANGE_USERNAME!,
    process.env.ORANGE_PASSWORD!
  );

  // Verify successful login
  await login.expectDashboard();

  // Open Admin module
  await admin.openAdmin();

  // Verify Admin user management page
  await admin.expectUserList();

  // Verify correct page URL
  await expect(page).toHaveURL(/admin\/viewSystemUsers/);
});
