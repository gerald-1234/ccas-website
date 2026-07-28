const { defineConfig } = require('playwright/test');

module.exports = defineConfig({
  testDir: __dirname,
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: 'http://localhost:5500',
    screenshot: 'only-on-failure',
  },
});
