import process from "process";

export const testData = {
  username: process.env.ORANGEHRM_USERNAME || 'Admin',
  password: process.env.ORANGEHRM_PASSWORD || 'admin123',
  baseUsername: 'week2_test_user'
};
