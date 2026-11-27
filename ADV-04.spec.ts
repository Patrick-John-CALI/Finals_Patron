
import { test } from '@playwright/test';

import { LoginPage } from '../../pages/LoginPage';
import { AdminUsersPage } from '../../pages/AdminUsersPage';
import { AdvancedAdminPage } from '../../pages/AdvancedAdminPage';

test.setTimeout(90000);

test('ADV-04 - Select employee using autocomplete', async ({ page }) => {
  const username = process.env.ORANGE_USERNAME;
  const password = process.env.ORANGE_PASSWORD;
  const employeeName = process.env.ORANGE_EMPLOYEE_NAME?.trim();

  test.skip(
    !username || !password,
    'Set ORANGE_USERNAME and ORANGE_PASSWORD in .env.'
  );

  test.skip(
    !employeeName,
    'Set ORANGE_EMPLOYEE_NAME in .env.'
  );

  const login = new LoginPage(page);
  const admin = new AdminUsersPage(page);
  const advanced = new AdvancedAdminPage(page);

  // Step 1: Login
  await login.goto();
  await login.login(username!, password!);
  await login.expectDashboard();

  // Step 2: Open Admin
  await admin.openAdmin();
  await admin.expectUserList();

  // Step 3: Open Add User form
  await admin.openAddUser();

  // Step 4: Confirm the form is ready
  await page.getByText('Employee Name', {
    exact: true
  }).waitFor({ state: 'visible', timeout: 15000 });

  // Step 5: Select employee using autocomplete
  await advanced.selectEmployeeName(employeeName!);
});
