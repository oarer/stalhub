import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
	testDir: './e2e',
	fullyParallel: false,
	workers: 1,
	retries: 0,
	timeout: 120_000,
	expect: { timeout: 15_000 },
	reporter: [['list'], ['html', { open: 'never' }]],
	outputDir: 'test-results/e2e',
	use: {
		baseURL: process.env.E2E_WEB_ORIGIN ?? 'http://localhost:4310',
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
		...devices['Desktop Chrome'],
		launchOptions: process.env.E2E_CHROMIUM_PATH
			? { executablePath: process.env.E2E_CHROMIUM_PATH }
			: {},
	},
})
