import { Page, expect } from '@playwright/test';

export class AdminUsersPage {
  constructor(private readonly page: Page) {}

  async openAdmin(): Promise<void> {
    await this.page.getByRole('link', { name: 'Admin', exact: true }).click();
    await this.expectUserList();
  }

  async expectUserList(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'System Users', exact: true })
    ).toBeVisible();
    await expect(this.page.locator('.oxd-table-body')).toBeVisible();
  }

  /**
   * Search and wait for the Admin Users API response before reading the table.
   * Waiting for the response avoids reading stale rows from the previous search.
   */
  async searchUsername(username: string): Promise<void> {
    const usernameInput = this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.getByText('Username', { exact: true }) })
      .locator('input');

    await expect(usernameInput).toHaveCount(1);
    await expect(usernameInput).toBeVisible();
    await usernameInput.fill(username);

    const searchResponse = this.page.waitForResponse(
      response =>
        response.request().method() === 'GET' &&
        response.url().includes('/api/v2/admin/users'),
      { timeout: 20000 }
    );

    await this.page.getByRole('button', { name: 'Search', exact: true }).click();

    const response = await searchResponse;
    expect(
      response.ok(),
      `Admin users search request failed with HTTP ${response.status()}`
    ).toBeTruthy();

    await expect(this.page.locator('.oxd-table-body')).toBeVisible();
    await expect(this.page.locator('.oxd-loading-spinner')).toBeHidden();
  }

  /**
   * Read data rows directly from the rendered DOM.
   * Rows without the expected data columns (such as "No Records Found")
   * are ignored, so an empty search result correctly returns [].
   *
   * OrangeHRM table cell indexes:
   * 0 = selection checkbox, 1 = Username, 2 = User Role,
   * 3 = Employee Name, 4 = Status, 5 = Actions.
   */
  
  async getDisplayedUsernames(): Promise<string[]> {
    const tableBody = this.page.locator('.oxd-table-body');

    await expect(tableBody).toBeVisible({ timeout: 15000 });

    const rows = tableBody.locator('.oxd-table-row');
    const usernames: string[] = [];

    const rowCount = await rows.count();

    for (let i = 0; i < rowCount; i++) {
      const cells = rows.nth(i).locator('.oxd-table-cell');

      if (await cells.count() < 2) {
        continue;
      }

      const username = (
        await cells.nth(1).innerText()
      ).trim();

      if (
        username &&
        username.toLowerCase() !== 'no records found'
      ) {
        usernames.push(username);
      }
    }

    return usernames;
  }

  async hasExactUsername(username: string): Promise<boolean> {
    const usernames = await this.getDisplayedUsernames();
    return usernames.some(value => value === username);
  }

  async openAddUser() {
  // Confirm that the System Users page is loaded
  await this.expectUserList();

  // First, look for Add inside the page header
  const header = this.page.locator('.orangehrm-header-container');

  const headerAddButton = header
    .locator('button')
    .filter({ hasText: /^\s*Add\s*$/ });

  // Fallback: look for an exact Add button elsewhere on the page
  const pageAddButton = this.page
    .locator('button.oxd-button')
    .filter({ hasText: /^\s*Add\s*$/ });

  const addButton =
    await headerAddButton.count() > 0
      ? headerAddButton.first()
      : pageAddButton.first();

  // If it is still missing, print visible buttons for diagnosis
  if (await addButton.count() === 0) {
    const visibleButtons = await this.page
      .locator('button:visible')
      .allTextContents();

    console.log('Current URL:', this.page.url());
    console.log('Visible buttons:', visibleButtons);

    throw new Error(
      'Add button was not found. Check the current URL and visible button diagnostics.'
    );
  }

  await expect(addButton).toBeVisible({ timeout: 10000 });
  await addButton.click();

  // Confirm that the Add User form opened
  await expect(
    this.page.getByRole('heading', {
      name: 'Add User',
      exact: true
    })
  ).toBeVisible({ timeout: 15000 });
}

  async expectUsername(username: string): Promise<void> {
    await expect.poll(
      async () => this.hasExactUsername(username),
      { message: `Expected exact username "${username}" in the users table` }
    ).toBeTruthy();
  }
}
