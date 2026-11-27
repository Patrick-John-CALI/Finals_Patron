import { test } from '@playwright/test';

import { LoginPage } from '../../pages/LoginPage';
import { AdminUsersPage } from '../../pages/AdminUsersPage';
import { AdvancedAdminPage } from '../../pages/AdvancedAdminPage';

test('ADV-04 - Select employee using autocomplete', async ({ page }) => {

  const login = new LoginPage(page);
  const admin = new AdminUsersPage(page);
  const advanced = new AdvancedAdminPage(page);

  // Employee must exist and be eligible for user creation
  const employeeName = process.env.ORANGE_EMPLOYEE_NAME;

  test.skip(
    !employeeName,
    'Set ORANGE_EMPLOYEE_NAME in .env before running this test.'
  );

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

  // Step 3: Open Add User form
  await admin.openAddUser();

  // Step 4: Select employee using autocomplete
  await advanced.selectEmployeeName(employeeName!);

});