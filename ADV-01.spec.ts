import { test } from '@playwright/test';

import { LoginPage } from '../../pages/LoginPage';
import { AdminUsersPage } from '../../pages/AdminUsersPage';
import { AdvancedAdminPage } from '../../pages/AdvancedAdminPage';

test('ADV-01 - Filter users by User Role', async ({ page }) => {

  const login = new LoginPage(page);
  const admin = new AdminUsersPage(page);
  const advanced = new AdvancedAdminPage(page);

  // Step 1: Login
  await login.goto();

  await login.login(
    process.env.ORANGE_USERNAME!,
    process.env.ORANGE_PASSWORD!
  );

  await login.expectDashboard();

  // Step 2: Open Admin module
  await admin.openAdmin();

  await admin.expectUserList();

  // Step 3: Select Admin role
  await advanced.selectUserRole('Admin');

  // Step 4: Apply filter
  await advanced.clickSearch();

  // Step 5: Verify filtered results
  await advanced.expectUserRole('Admin');

});
