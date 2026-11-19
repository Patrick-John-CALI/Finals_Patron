import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import process from 'process';

test('ADM-06 - Create a valid user account', async ({ page }) => {
  const login = new LoginPage(page);

  const username = `week2_${Date.now()}`;
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

  // Step 6: Enter a unique username
  const usernameGroup = page.locator('.oxd-input-group').filter({
    has: page.getByText('Username', { exact: true })
  });

  await usernameGroup.locator('input').fill(username);

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

  // Step 9: Save the new user
  await page.getByRole('button', { name: 'Save' }).click();

  // Step 10: Verify successful creation
  await expect(
    page.getByText('Successfully Saved', { exact: false })
  ).toBeVisible({ timeout: 15000 });

  // Step 11: Verify return to System Users list
  await expect(
    page.getByRole('heading', { name: 'System Users' })
  ).toBeVisible();

  // Step 12: Search for the newly created account
  const searchUsernameGroup = page.locator('.oxd-input-group').filter({
    has: page.getByText('Username', { exact: true })
  });

  await searchUsernameGroup.locator('input').fill(username);

  await page.getByRole('button', { name: 'Search' }).click();

  // Step 13: Verify the new account appears in the results
  const createdUserRow = page.getByRole('row').filter({
    hasText: username
  });

  await expect(createdUserRow).toBeVisible({
    timeout: 15000
  });
});