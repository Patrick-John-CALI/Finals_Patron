import { test } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { AdminUsersPage } from '../../pages/AdminUsersPage';
import { AdvancedAdminPage } from '../../pages/AdvancedAdminPage';

test('ADV-01 - Filter users by User Role', async ({ page }) => {
  test.skip(
    !process.env.ORANGE_USERNAME || !process.env.ORANGE_PASSWORD,
    'Set ORANGE_USERNAME and ORANGE_PASSWORD in .env'
  );

  const login = new LoginPage(page);
  const admin = new AdminUsersPage(page);
  const advanced = new AdvancedAdminPage(page);

  await login.goto();
  await login.login(process.env.ORANGE_USERNAME!, process.env.ORANGE_PASSWORD!);
  await login.expectDashboard();

  await admin.openAdmin();
  await admin.expectUserList();

  await advanced.selectUserRole('Admin');
  await advanced.clickSearch();
  await advanced.expectUserRole('Admin');
});
