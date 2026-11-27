
import { test, expect } from '@playwright/test';

import { LoginPage } from '../../pages/LoginPage';
import { AdminUsersPage } from '../../pages/AdminUsersPage';

test('ADV-05 - Search usernames with whitespace and mixed case',
  async ({ page }) => {

    const login = new LoginPage(page);
    const admin = new AdminUsersPage(page);

    const username = process.env.ORANGE_SEARCH_USERNAME;

    test.skip(
      !username,
      'Set ORANGE_SEARCH_USERNAME in .env'
    );

    // Step 1: Login
    await login.goto();

    await login.login(
      process.env.ORANGE_USERNAME!,
      process.env.ORANGE_PASSWORD!
    );

    await login.expectDashboard();

    // Step 2: Open Admin
    await admin.openAdmin();
    await admin.expectUserList();

    // Step 3: Define search variations
    const searchVariations = [
      {
        term: username!,
        description: 'Original username',
        mustMatch: true
      },
      {
        term: ` ${username!}`,
        description: 'Leading whitespace',
        mustMatch: false
      },
      {
        term: `${username!} `,
        description: 'Trailing whitespace',
        mustMatch: false
      },
      {
        term: username!.toUpperCase(),
        description: 'Uppercase username',
        mustMatch: false
      }
    ];

    const normalize = (value: string) =>
      value.trim().toLowerCase();

    // Step 4: Execute each search variation
    for (const variation of searchVariations) {

      console.log(
        `\nTesting: ${variation.description}`
      );

      console.log(
        `Search input: "${variation.term}"`
      );

      await admin.searchUsername(variation.term);

      // Verify page remains available
      await expect(
        page.getByRole('heading', {
          name: 'System Users'
        })
      ).toBeVisible();

      // Step 5: Retrieve actual results
      const displayedUsernames =
        await admin.getDisplayedUsernames();

      console.log(
        'Displayed usernames:',
        displayedUsernames
      );

      // Step 6: Original username must return a result
      if (variation.mustMatch) {

        expect(
          displayedUsernames.some(
            result => normalize(result) === normalize(username!)
          ),
          'Original username should be returned'
        ).toBeTruthy();

      }

      // Step 7: Check that no unrelated accounts appear
      for (const result of displayedUsernames) {

        expect(
          normalize(result),
          `Unexpected account returned: ${result}`
        ).toBe(normalize(username!));

      }

      // Step 8: Record observed application behavior
      if (displayedUsernames.length > 0) {

        console.log(
          `${variation.description}: Matching result found.`
        );

      } else {

        console.log(
          `${variation.description}: No matching result found.`
        );

      }

    }

});