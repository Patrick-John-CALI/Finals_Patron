import { test, expect } from '@playwright/test';

const API_URL =
  'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2';

test('ADM-13 - API rejects missing authorization', async ({ request }) => {
  const response = await request.get(
    `${API_URL}/admin/users`,
    {
      headers: {
        Accept: 'application/json'
      }
    }
  );

  expect([401, 403]).toContain(response.status());
});