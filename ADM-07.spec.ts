import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test('ADM-07 - Required fields prevent incomplete user creation', async ({ page }) => {
  const login = new LoginPage(page);

  await login.goto();

  await login.login(
    process.env.ORANGE_USERNAME!,
    process.env.ORANGE_PASSWORD!
  );

  await page.getByRole('link', { name: 'Admin' }).click();

  await page.getByRole('button', { name: 'Add' }).click();

  // Submit without filling required fields
  await page.getByRole('button', {
    name: 'Save'
  }).click();

  // Check required-field validation
  await expect(
    page.getByText('Required').first()
  ).toBeVisible();

  // Verify that the Add User form remains visible
  await expect(
    page.getByRole('button', { name: 'Save' })
  ).toBeVisible();
});