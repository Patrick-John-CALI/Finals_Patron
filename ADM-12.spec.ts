import { test, expect } from '@playwright/test';

const API_URL =
  'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2';

test('ADM-12 - Authorized API retrieves user data', async ({ request }) => {
  const token = process.env.ORANGE_API_TOKEN?.trim();
  test.skip(!token, 'ORANGE_API_TOKEN is required for this API test.');

  const response = await request.get(`${API_URL}/admin/users?limit=5`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });

  expect(response.status()).toBe(200);
  const body = await response.json();

  expect(body).toHaveProperty('data');
  expect(Array.isArray(body.data)).toBe(true);
  expect(body.data.length).toBeGreaterThan(0);
  expect(body.data.length).toBeLessThanOrEqual(5);

  const responseText = JSON.stringify(body);
  expect(responseText).not.toMatch(/passwordHash/i);
  expect(responseText).not.toMatch(/accessToken/i);
});
