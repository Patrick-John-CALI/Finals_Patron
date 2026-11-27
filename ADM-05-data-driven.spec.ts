import { test, expect } from '@playwright/test';
import adminUsers from '../../data/admin-users.json';

import { LoginPage } from '../../pages/LoginPage';
import { AdminUsersPage } from '../../pages/AdminUsersPage';

test.describe('ADM-05 - Data-Driven Username Search', () => {

  for (const user of adminUsers) {

    test(`Search username: ${user.username}`, async ({ page }) => {

      const login = new LoginPage(page);
      const admin = new AdminUsersPage(page);

      // Step 1: Login
      await login.goto();

      await login.login(
        process.env.ORANGE_USERNAME!,
        process.env.ORANGE_PASSWORD!
      );

      await login.expectDashboard();

      // Step 2: Open Admin
      await admin.openAdmin();

      await admin.expectUserList();

      // Step 3: Search using external JSON data
      await admin.searchUsername(user.username);

      // Step 4: Verify matching account
      await admin.expectUsername(user.username);

      // Step 5: Verify the matching row
      const matchingRow = page
        .locator('.oxd-table-body .oxd-table-row')
        .filter({ hasText: user.username });

      await expect(matchingRow).toBeVisible();

    });
  }

});
