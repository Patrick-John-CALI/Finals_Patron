import { Page, expect } from '@playwright/test';

type UserRow = {
  username: string;
  role: string;
  employeeName: string;
  status: string;
};

export class AdvancedAdminPage {
  constructor(private readonly page: Page) {}

  private filterGroup(label: string) {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.getByText(label, { exact: true }) });
  }

  async selectFilter(label: string, option: string): Promise<void> {
    const group = this.filterGroup(label);
    await expect(group, `Expected one filter group labelled "${label}"`).toHaveCount(1);

    const dropdown = group.locator('.oxd-select-text');
    await expect(dropdown).toBeVisible();
    await dropdown.click();

    const optionLocator = this.page
      .locator('.oxd-select-dropdown .oxd-select-option')
      .filter({ hasText: new RegExp(`^${option.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) });

    await expect(
      optionLocator,
      `Expected dropdown option "${option}" for "${label}"`
    ).toHaveCount(1);
    await expect(optionLocator).toBeVisible();
    await optionLocator.click();
  }

  async selectUserRole(role: string): Promise<void> {
    await this.selectFilter('User Role', role);
  }

  async selectUserStatus(status: string): Promise<void> {
    await this.selectFilter('Status', status);
  }

  /**
   * Read all actual user records from the current results table.
   * Ignores the no-records placeholder row.
   */
  private async getUserRows(): Promise<UserRow[]> {
    const rows = this.page.locator('.oxd-table-body .oxd-table-row');

    return rows.evaluateAll(elements =>
      elements.flatMap(row => {
        const cells = Array.from(row.querySelectorAll('.oxd-table-cell'));
        if (cells.length < 5) return [];

        const text = (index: number) => (cells[index].textContent ?? '').trim();
        const username = text(1);
        const role = text(2);
        const employeeName = text(3);
        const status = text(4);

        if (!username || /no records found/i.test(username)) return [];

        return [{ username, role, employeeName, status }];
      })
    );
  }

  async expectUserRole(role: string): Promise<void> {
    await expect.poll(
      async () => {
        const rows = await this.getUserRows();
        return rows.length > 0 && rows.every(row => row.role === role);
      },
      { message: `Expected all returned user records to have role "${role}"` }
    ).toBeTruthy();
  }

  async expectUserStatus(status: string): Promise<void> {
    await expect.poll(
      async () => {
        const rows = await this.getUserRows();
        return rows.length > 0 && rows.every(row => row.status === status);
      },
      { message: `Expected all returned user records to have status "${status}"` }
    ).toBeTruthy();
  }

  async expectUserRoleAndStatus(role: string, status: string): Promise<void> {
    await expect.poll(
      async () => {
        const rows = await this.getUserRows();
        return rows.length > 0 &&
          rows.every(row => row.role === role && row.status === status);
      },
      {
        message:
          `Expected every returned user to have role "${role}" and status "${status}"`
      }
    ).toBeTruthy();
  }

  async selectEmployeeName(employeeName: string): Promise<void> {
    const trimmedName = employeeName.trim();
    expect(trimmedName, 'ORANGE_EMPLOYEE_NAME must not be empty').not.toBe('');
    expect(trimmedName, 'Replace the placeholder employee name with a real employee').not.toBe('First Last');

    const employeeInput = this.filterGroup('Employee Name').locator('input');
    await expect(employeeInput).toHaveCount(1);
    await expect(employeeInput).toBeVisible();
    await employeeInput.fill(trimmedName);

    const suggestions = this.page.locator('.oxd-autocomplete-option');
    const matchingSuggestion = suggestions.filter({ hasText: trimmedName });

    await expect(
      matchingSuggestion.first(),
      `No autocomplete suggestion matched "${trimmedName}". Check that this employee exists and is eligible.`
    ).toBeVisible({ timeout: 15000 });

    await matchingSuggestion.first().click();
    await expect(employeeInput).toHaveValue(trimmedName);
  }

  /**
   * Wait for the actual Admin Users API request to finish so assertions
   * cannot inspect results left over from the previous filter.
   */
  async clickSearch(): Promise<void> {
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
      `Admin users filter request failed with HTTP ${response.status()}`
    ).toBeTruthy();

    await expect(this.page.locator('.oxd-table-body')).toBeVisible();
    await expect(this.page.locator('.oxd-loading-spinner')).toBeHidden();
  }
}
