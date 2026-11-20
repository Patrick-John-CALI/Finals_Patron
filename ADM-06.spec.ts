import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.setTimeout(90000);

test('ADM-06 - Create a valid user account', async ({ page }) => {

  const login = new LoginPage(page);

  const username = `week2_${Date.now()}`;
  const password = 'Week2_Test@2026';

  // STEP 1: Login as administrator
  await login.goto();

  await login.login(
    process.env.ORANGE_USERNAME!,
    process.env.ORANGE_PASSWORD!
  );

  await login.expectDashboard();

  // STEP 2: Open Admin module
  await page.getByRole('link', {
    name: 'Admin',
    exact: true
  }).click();

  await expect(
    page.getByRole('heading', {
      name: 'System Users'
    })
  ).toBeVisible({ timeout: 20000 });

  // STEP 3: Open Add User form
  const addButton = page.getByRole('button', {
    name: 'Add',
    exact: false
  });

  await expect(addButton).toBeVisible();
  await addButton.click();

  // Verify Add User page
  await expect(
    page.getByRole('heading', {
      name: 'Add User',
      exact: true
    })
  ).toBeVisible({ timeout: 15000 });

  const form = page.locator('.oxd-form');

  await expect(form).toBeVisible();

  // STEP 4: Select User Role - ESS
  const roleGroup = form.locator('.oxd-input-group').filter({
    has: page.locator('label', {
      hasText: /^User Role$/
    })
  });

  await expect(roleGroup).toHaveCount(1);

  await roleGroup.locator('.oxd-select-text').click();

  await page.getByRole('option', {
    name: 'ESS',
    exact: true
  }).click();

  // Verify selected role
  await expect(
    roleGroup.locator('.oxd-select-text')
  ).toContainText('ESS');

  // STEP 5: Select Employee Name
  const employeeInput = form.getByPlaceholder(
    'Type for hints...'
  );

  await expect(employeeInput).toBeVisible();

  await employeeInput.fill('a');

  const employeeOptions = page.locator(
    '.oxd-autocomplete-option'
  );

  const employeeSuggestion = employeeOptions.filter({
    hasNotText: 'Searching'
  }).filter({
    hasNotText: 'No Employees Found'
  }).first();

  await expect(employeeSuggestion).toBeVisible({
    timeout: 15000
  });

  const employeeName = (await employeeSuggestion.innerText()).trim();
  await employeeSuggestion.click();

  await expect(employeeInput).toHaveValue(employeeName);

  // STEP 6: Enter unique Username
  const usernameGroup = form.locator('.oxd-input-group').filter({
    has: page.locator('label', {
      hasText: /^Username$/
    })
  });

  const usernameInput = usernameGroup.locator('input');

  await expect(usernameInput).toBeVisible();
  await usernameInput.fill(username);

  await expect(usernameInput).toHaveValue(username);

  // STEP 7: Select Status - Enabled
  const statusGroup = form.locator('.oxd-input-group').filter({
    has: page.locator('label', {
      hasText: /^Status$/
    })
  });

  await statusGroup.locator('.oxd-select-text').click();

  await page.getByRole('option', {
    name: 'Enabled',
    exact: true
  }).click();

  await expect(
    statusGroup.locator('.oxd-select-text')
  ).toContainText('Enabled');

  // STEP 8: Enter Password and Confirm Password

  // Locate password fields inside the Add User form
  const passwordInputs = form.locator(
    'input[type="password"]'
  );

  // Verify that exactly two password fields exist
  await expect(passwordInputs).toHaveCount(2, {
    timeout: 10000
  });

  const passwordInput = passwordInputs.nth(0);
  const confirmPasswordInput = passwordInputs.nth(1);

  await expect(passwordInput).toBeVisible();
  await expect(confirmPasswordInput).toBeVisible();

  // Enter password
  await passwordInput.fill(password);

  // Confirm password
  await confirmPasswordInput.fill(password);

  // Verify both fields contain the entered password
  await expect(passwordInput).toHaveValue(password);
  await expect(confirmPasswordInput).toHaveValue(password);

  console.log('Password fields successfully populated.');

  // STEP 9: Save user
  const saveButton = form.getByRole('button', {
    name: 'Save',
    exact: true
  });

  await expect(saveButton).toBeEnabled();
  await saveButton.click();

  // STEP 10: Verify save result
  const successToast = page.locator('.oxd-toast');

  const validationErrors = page.locator(
    '.oxd-input-field-error-message'
  );

  await expect(
    successToast.first().or(validationErrors.first())
  ).toBeVisible({ timeout: 20000 });

  // Capture validation errors if account creation fails
  const errors = await validationErrors.allInnerTexts();

  if (errors.length > 0) {
    throw new Error(
      `Account creation rejected: ${errors.join(' | ')}`
    );
  }

  // Verify successful account creation
  await expect(successToast.first()).toContainText(
    'Successfully Saved'
  );

  console.log(`User successfully created: ${username}`);

  // STEP 11: Verify return to System Users
  await expect(
    page.getByRole('heading', {
      name: 'System Users',
      exact: true
    })
  ).toBeVisible({ timeout: 20000 });

  // STEP 12: Locate Username search field
  const searchGroup = page.locator('.oxd-input-group').filter({
    has: page.locator('label', {
      hasText: /^Username$/
    })
  });

  await expect(searchGroup).toHaveCount(1);

  const searchInput = searchGroup.locator('input');

  await expect(searchInput).toBeVisible();

  // STEP 13: Search newly created account
  await searchInput.fill(username);

  await page.getByRole('button', {
    name: 'Search',
    exact: true
  }).click();

  // STEP 14: Verify account appears in search results
  const createdUserRow = page.locator(
    '.oxd-table-body .oxd-table-row'
  ).filter({
    hasText: username
  });

  await expect(createdUserRow).toBeVisible({
    timeout: 20000
  });

  await expect(createdUserRow).toContainText(username);

  console.log(
    `ADM-06 PASSED: User ${username} was created and verified.`
  );

});
