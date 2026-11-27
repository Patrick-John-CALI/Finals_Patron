import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { AdminUsersPage } from '../../pages/AdminUsersPage';

test('ADV-06 - Verify System Users table responsiveness', async ({ page }) => {
  const login = new LoginPage(page);
  const admin = new AdminUsersPage(page);

  // Step 1: Login
  await login.goto();

  await login.login(
    process.env.ORANGE_USERNAME!,
    process.env.ORANGE_PASSWORD!
  );

  // Step 2: Open Admin page
  await admin.openAdmin();

  // Step 3: Verify System Users page
  await expect(
    page.getByRole('heading', { name: 'System Users' })
  ).toBeVisible();

  const table = page.locator('.oxd-table');

  await expect(table).toBeVisible();

  // Step 4: Check desktop viewport
  await page.setViewportSize({
    width: 1280,
    height: 800
  });

  await expect(table).toBeVisible();

  const desktopSize = await table.boundingBox();

  expect(desktopSize).not.toBeNull();

  if (desktopSize) {
    expect(desktopSize.width).toBeGreaterThan(0);
  }

  // Step 5: Check mobile viewport
  await page.setViewportSize({
    width: 390,
    height: 844
  });

  await expect(
    page.getByRole('heading', { name: 'System Users' })
  ).toBeVisible();

  await expect(table).toBeVisible();

  const mobileSize = await table.boundingBox();

  expect(mobileSize).not.toBeNull();

  if (mobileSize) {
    expect(mobileSize.width).toBeGreaterThan(0);
  }

  // Step 6: Return to desktop viewport
  await page.setViewportSize({
    width: 1280,
    height: 800
  });

  await expect(table).toBeVisible();
});
