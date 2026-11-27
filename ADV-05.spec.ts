
import { test, expect } from '@playwright/test';

import { LoginPage } from '../../pages/LoginPage';
import { AdminUsersPage } from '../../pages/AdminUsersPage';

test.setTimeout(90000);

test('ADV-05 - Search usernames with whitespace and mixed case', async ({ page }) => {
  const loginUsername = process.env.ORANGE_USERNAME;
  const loginPassword = process.env.ORANGE_PASSWORD;
  const searchUsername = process.env.ORANGE_SEARCH_USERNAME?.trim();

  test.skip(
    !loginUsername || !loginPassword,
    'Set ORANGE_USERNAME and ORANGE_PASSWORD in .env.'
  );

  test.skip(
    !searchUsername,
    'Set ORANGE_SEARCH_USERNAME in .env.'
  );

  const login = new LoginPage(page);
  const admin = new AdminUsersPage(page);

  // Step 1: Login
  await login.goto();
  await login.login(loginUsername!, loginPassword!);
  await login.expectDashboard();

  // Step 2: Open Admin > System Users
  await admin.openAdmin();
  await admin.expectUserList();

  // Step 3: Define search variations
  const searchVariations = [
    {
      term: searchUsername!,
      description: 'Original username',
      mustMatch: true
    },
    {
      term: ` ${searchUsername!}`,
      description: 'Leading whitespace',
      mustMatch: false
    },
    {
      term: `${searchUsername!} `,
      description: 'Trailing whitespace',
      mustMatch: false
    },
    {
      term: searchUsername!.toUpperCase(),
      description: 'Uppercase username',
      mustMatch: false
    }
  ];

  // Compare returned usernames without case or surrounding-space differences
  const normalize = (value: string) => value.trim().toLowerCase();
  const expectedUsername = normalize(searchUsername!);

  // Step 4: Execute each search
  for (const variation of searchVariations) {
    console.log(`\nTesting: ${variation.description}`);
    console.log(`Search input: "${variation.term}"`);

    await admin.searchUsername(variation.term);
    await admin.expectUserList();

    // Step 5: Read results, including the possibility of no matches
    const displayedUsernames = await admin.getDisplayedUsernames();

    console.log('Displayed usernames:', displayedUsernames);

    const matchingUsernames = displayedUsernames.filter(
      result => normalize(result) === expectedUsername
    );

    // Step 6: The original username must return the expected account
    if (variation.mustMatch) {
      expect(
        matchingUsernames.length,
        'The original username should return its matching account.'
      ).toBeGreaterThan(0);
    }

    // Step 7: Any returned records must belong to the searched account
    for (const result of displayedUsernames) {
      expect(
        normalize(result),
        `Unexpected account returned for "${variation.description}": ${result}`
      ).toBe(expectedUsername);
    }

    // Step 8: Log observed behavior for whitespace and case variations
    console.log(
      `${variation.description}: ${
        matchingUsernames.length > 0
          ? 'Matching account returned.'
          : 'No matching account returned.'
      }`
    );
  }
});
