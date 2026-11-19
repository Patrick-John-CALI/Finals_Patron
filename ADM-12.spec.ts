import { test, expect } from '@playwright/test';
import process from 'process';

const API_URL =
  'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2';

test('ADM-12 - Authorized API retrieves user data', async ({ request }) => {

  // Step 1: Retrieve API token
  const token = process.env.ORANGE_API_TOKEN;

  expect(
    token,
    'ORANGE_API_TOKEN is missing. Configure a valid API token in your environment.'
  ).toBeTruthy();

  // Step 2: Send authorized GET request
  const response = await request.get(
    `${API_URL}/admin/users?limit=5`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    }
  );

  // Step 3: Verify successful HTTP response
  expect(response.status()).toBe(200);
  expect(response.ok()).toBeTruthy();

  // Step 4: Read response body
  const body = await response.json();

  // Step 5: Verify response structure
  expect(body).toHaveProperty('data');
  expect(Array.isArray(body.data)).toBeTruthy();

  // Step 6: Verify returned user records
  expect(body.data.length).toBeGreaterThan(0);
  expect(body.data.length).toBeLessThanOrEqual(5);

  // Step 7: Verify sensitive authentication data is not exposed
  const responseText = JSON.stringify(body);

  expect(responseText).not.toMatch(/passwordHash/i);
  expect(responseText).not.toMatch(/accessToken/i);

});