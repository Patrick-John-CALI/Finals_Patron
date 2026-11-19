import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test('ADM-08 - Reject duplicate username', async ({ page }) => {
  const login = new LoginPage(page);

  const existingUsername = 'Admin';
  const password = 'Week2_Test@2026';

  // Step 1: Login as administrator
  await login.goto();

  await login.login(
    process.env.ORANGE_USERNAME!,
    process.env.ORANGE_PASSWORD!
  );

  await login.expectDashboard();

  // Step 2: Open Admin module
  await page.getByRole('link', { name: 'Admin' }).click();

  await expect(
    page.getByRole('heading', { name: 'System Users' })
  ).toBeVisible();

  // Step 3: Open Add User form
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(
    page.getByText('Add User', { exact: true })
  ).toBeVisible();

  // Step 4: Select User Role - ESS
  const roleGroup = page.locator('.oxd-input-group').filter({
    has: page.getByText('User Role', { exact: true })
  });

  await roleGroup.locator('.oxd-select-text').click();

  await expect(
    page.getByRole('option', { name: 'ESS', exact: true })
  ).toBeVisible();

  await page.getByRole('option', {
    name: 'ESS',
    exact: true
  }).click();

  // Step 5: Select Employee Name
  const employeeInput = page.getByPlaceholder('Type for hints...');

  await employeeInput.fill('a');

  const employeeOptions = page.locator('.oxd-autocomplete-option');

  await expect(employeeOptions.first()).toBeVisible({
    timeout: 15000
  });

  await employeeOptions.first().click();

  // Step 6: Enter an existing username
  const usernameGroup = page.locator('.oxd-input-group').filter({
    has: page.getByText('Username', { exact: true })
  });

  await usernameGroup.locator('input').fill(existingUsername);

  // Step 7: Select Status - Enabled
  const statusGroup = page.locator('.oxd-input-group').filter({
    has: page.getByText('Status', { exact: true })
  });

  await statusGroup.locator('.oxd-select-text').click();

  await expect(
    page.getByRole('option', { name: 'Enabled', exact: true })
  ).toBeVisible();

  await page.getByRole('option', {
    name: 'Enabled',
    exact: true
  }).click();

  // Step 8: Enter Password and Confirm Password
  const passwordInputs = page.locator('input[type="password"]');

  await expect(passwordInputs).toHaveCount(2);

  await passwordInputs.nth(0).fill(password);
  await passwordInputs.nth(1).fill(password);

  // Step 9: Attempt to save the duplicate username
  await page.getByRole('button', { name: 'Save' }).click();

  // Step 10: Verify that the duplicate username is rejected
  const duplicateError = page.getByText('Already exists', {
    exact: false
  });

  await expect(duplicateError).toBeVisible({
    timeout: 15000
  });

  // Verify that the Add User form remains visible
  await expect(
    page.getByText('Add User', { exact: true })
  ).toBeVisible();
});