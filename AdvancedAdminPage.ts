import { Page, expect } from '@playwright/test';

export class AdvancedAdminPage {
  constructor(private page: Page) {}

  // Locate a filter group using its label
  private filterGroup(label: string) {
    return this.page
      .locator('.oxd-input-group')
      .filter({
        has: this.page.getByText(label, { exact: true })
      });
  }

  // Select a custom dropdown option
  async selectFilter(label: string, option: string) {
    const dropdown = this.filterGroup(label)
      .locator('.oxd-select-text');

    await expect(dropdown).toBeVisible();
    await dropdown.click();

    const optionLocator = this.page
      .locator('.oxd-select-dropdown .oxd-select-option')
      .filter({
        hasText: new RegExp(`^${option}$`)
      });

    await expect(optionLocator).toBeVisible();
    await optionLocator.click();
  }

  // Filter users by User Role
  async selectUserRole(role: string) {
    await this.selectFilter('User Role', role);
  }


  // Select user account status
  async selectUserStatus(status: string) {
    await this.selectFilter('Status', status);
  }

  // Verify filtered user status
  
  async expectUserStatus(status: string) {
    const rows = this.page.locator(
      '.oxd-table-body .oxd-table-row'
    );

    await expect(rows.first()).toBeVisible();

    const rowCount = await rows.count();
    let validRows = 0;

    for (let i = 0; i < rowCount; i++) {
      const cells = rows.nth(i).locator(
        '.oxd-table-cell'
      );

      if (await cells.count() < 5) {
        continue;
      }

      await expect(
        cells.nth(4)
      ).toHaveText(status);

      validRows++;
    }

    expect(validRows).toBeGreaterThan(0);
  }
  
  // Verify combined User Role and Status filters
  async expectUserRoleAndStatus(
    role: string,
    status: string
  ) {
    const rows = this.page.locator(
      '.oxd-table-body .oxd-table-row'
    );

    await expect(rows.first()).toBeVisible();

    const rowCount = await rows.count();
    let validRows = 0;

    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i);

      const cells = row.locator(
        '.oxd-table-cell'
      );

      const cellCount = await cells.count();

      // Skip rows without all expected columns
      if (cellCount < 5) {
        continue;
      }

      // Index 2 = User Role
      const roleCell = cells.nth(2);

      // Index 4 = Status
      const statusCell = cells.nth(4);

      // Verify User Role
      await expect(roleCell).toHaveText(role);

      // Verify Status
      await expect(statusCell).toHaveText(status);

      validRows++;
    }

    // Ensure matching records exist
    expect(validRows).toBeGreaterThan(0);
  }

  
  // Select employee using autocomplete
  async selectEmployeeName(employeeName: string) {

    const employeeInput = this.page
      .locator('.oxd-input-group')
      .filter({
        has: this.page.getByText(
          'Employee Name',
          { exact: true }
        )
      })
      .locator('input');

    // Validate employee name
    expect(employeeName.trim()).not.toBe('');
    expect(employeeName).not.toBe('First Last');

    // Verify input field
    await expect(employeeInput).toBeVisible();

    // Enter employee name
    await employeeInput.fill(employeeName);

    // Locate autocomplete suggestions
    const suggestions = this.page.locator(
      '.oxd-autocomplete-option'
    );

    // Wait for suggestions to appear
    await expect(
      suggestions.first(),
      'No employee suggestions appeared. Verify that the employee exists.'
    ).toBeVisible({
      timeout: 15000
    });

    // Find the matching employee
    const matchingEmployee = suggestions.filter({
      hasText: employeeName
    });

    // Verify matching suggestion
    await expect(
      matchingEmployee.first(),
      `No autocomplete suggestion matched: ${employeeName}`
    ).toBeVisible();

    // Select matching employee
    await matchingEmployee.first().click();

    // Verify selected employee
    await expect(employeeInput).toHaveValue(
      employeeName
    );
  }


  // Click Search
  async clickSearch() {
    await this.page.getByRole('button', {
      name: 'Search'
    }).click();
  }

  // Verify filtered user results
  
async expectUserRole(role: string) {
  const rows = this.page.locator(
    '.oxd-table-body .oxd-table-row'
  );

  await expect(rows.first()).toBeVisible();

  const rowCount = await rows.count();
  let validRows = 0;

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const cells = row.locator('.oxd-table-cell');

    const cellCount = await cells.count();

    // Skip rows that are not actual employee/user records
    if (cellCount < 5) {
      continue;
    }

    // Column index 1 = User Role
    const roleCell = cells.nth(1);

    await expect(roleCell).toHaveText(role);

    validRows++;
  }

  // Ensure at least one actual user record was found
  expect(validRows).toBeGreaterThan(0);

  
}}
