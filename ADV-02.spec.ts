
import { test } from '@playwright/test';

import { LoginPage } from '../../pages/LoginPage';
import { AdminUsersPage } from '../../pages/AdminUsersPage';
import { AdvancedAdminPage } from '../../pages/AdvancedAdminPage';

test('ADV-02 - Filter users by Status', async ({ page }) => {

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

  // Step 3: Select Enabled status
  await advanced.selectUserStatus('Enabled');

  // Step 4: Apply filter
  await advanced.clickSearch();

  // Step 5: Verify filtered results
  await advanced.expectUserStatus('Enabled');

});
