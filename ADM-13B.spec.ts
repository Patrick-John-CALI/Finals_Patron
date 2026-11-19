import { test, expect } from '@playwright/test';

const API_URL =
  'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2';

test('ADM-13 - API rejects invalid authorization token', async ({ request }) => {
  const response = await request.get(
    `${API_URL}/admin/users`,
    {
      headers: {
        Authorization: 'Bearer invalid_test_token',
        Accept: 'application/json'
      }
    }
  );

  expect([401, 403]).toContain(response.status());
});