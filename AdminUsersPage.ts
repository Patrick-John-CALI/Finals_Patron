import { Page, expect } from '@playwright/test';

export class AdminUsersPage {
  constructor(private page: Page) {}

  async openAdmin() {
    await this.page.getByRole('link', {
      name: 'Admin'
    }).click();
  }

  async expectUserList() {
    await expect(
      this.page.getByRole('heading', {
        name: 'System Users'
      })
    ).toBeVisible();
  }

  
async searchUsername(username: string) {

  const usernameInput = this.page
    .locator('.oxd-input-group')
    .filter({
      has: this.page.getByText(
        'Username',
        { exact: true }
      )
    })
    .locator('input');

  await expect(usernameInput).toBeVisible();

  await usernameInput.fill(username);

  await this.page.getByRole('button', {
    name: 'Search'
  }).click();

  // Wait until the table finishes updating
  await expect(
    this.page.locator('.oxd-loading-spinner')
  ).toBeHidden({ timeout: 15000 });

  await expect(
    this.page.locator('.oxd-table-body')
  ).toBeVisible();
}


// Retrieve usernames displayed in the results table
async getDisplayedUsernames(): Promise<string[]> {

  const rows = this.page.locator(
    '.oxd-table-body .oxd-table-row'
  );

  await expect(rows.first()).toBeVisible({
    timeout: 10000
  });

  const usernames: string[] = [];
  const rowCount = await rows.count();

  for (let i = 0; i < rowCount; i++) {

    const row = rows.nth(i);

    const cells = row.locator(
      '.oxd-table-cell'
    );

    const cellCount = await cells.count();

    // Skip empty-result and non-data rows
    if (cellCount < 2) {
      continue;
    }

    // Username is the second cell
    const usernameCell = cells.nth(1);

    // Check visibility before reading text
    if (!await usernameCell.isVisible()) {
      continue;
    }

    const username = (
      await usernameCell.textContent() ?? ''
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

  async hasUsernameResult(username: string): Promise<boolean> {
  const matchingRow = this.page
    .locator('.oxd-table-body .oxd-table-row')
    .filter({ hasText: username });

  return await matchingRow.count() > 0;
}

  async hasExactUsername(username: string): Promise<boolean> {
  const rows = this.page.locator(
    '.oxd-table-body .oxd-table-row'
  );

  return await rows.evaluateAll((elements, expected) => {
    return elements.some(row => {
      const cells = Array.from(
        row.querySelectorAll('.oxd-table-cell')
      );

      const actualUsername = cells[1]?.textContent?.trim();

      return actualUsername === expected;
    });
  }, username);
}

  async openAddUser() {
    await this.page.getByRole('button', {
      name: 'Add'
    }).click();
  }

  async expectUsername(username: string) {
    const matchingRow = this.page.getByRole('row')
      .filter({ hasText: username });

    await expect(matchingRow.first()).toBeVisible();
  }
}
