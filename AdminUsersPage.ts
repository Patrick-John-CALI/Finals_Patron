
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
        has: this.page.getByText('Username', { exact: true })
      })
      .locator('input');

    await expect(usernameInput).toBeVisible();

    await usernameInput.fill(username);

    await this.page.getByRole('button', {
      name: 'Search'
    }).click();
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
