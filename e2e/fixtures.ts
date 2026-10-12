import {
	type APIRequestContext,
	type BrowserContext,
	test as base,
	expect,
	type Page,
} from '@playwright/test'

export const apiURL = process.env.E2E_API_URL ?? 'http://localhost:4311'
export const owner = process.env.E2E_OWNER_USERNAME ?? 'e2e_owner'
export const other = process.env.E2E_OTHER_USERNAME ?? 'e2e_other'
export const password = process.env.E2E_PASSWORD ?? 'E2E-only-password-123!'
export const itemID = 'e2e-rifle'
export const itemName = 'E2E Test Rifle'
const item = {
	id: itemID,
	category: 'weapon/assault_rifle',
	name: {
		type: 'translation',
		key: 'item.e2e.name',
		lines: { en: itemName, ru: itemName },
	},
	color: 'RANK_MASTER',
	infoBlocks: [],
}
const pixel = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
	'base64'
)

export async function installExternalFixtures(
	context: BrowserContext,
	frontendURL: string,
	unknown: string[]
) {
	const localOrigins = new Set([
		new URL(frontendURL).origin,
		new URL(apiURL).origin,
	])
	await context.route('**/*', async (route) => {
		const url = new URL(route.request().url())
		// A local image optimizer request still targets an external CDN asset.
		if (
			url.origin === new URL(frontendURL).origin &&
			url.pathname === '/_next/image' &&
			new URL(url.searchParams.get('url') ?? frontendURL, frontendURL)
				.hostname === 'cdn.stalhub.dev'
		)
			return route.fulfill({ contentType: 'image/png', body: pixel })
		if (
			localOrigins.has(url.origin) ||
			['data:', 'blob:', 'about:'].includes(url.protocol)
		)
			return route.continue()
		if (
			url.hostname === 'umami.stalhub.dev' &&
			url.pathname === '/script.js'
		)
			return route.fulfill({
				contentType: 'application/javascript',
				body: '',
			})
		if (
			url.hostname === 'api.github.com' &&
			url.pathname === '/repos/oarer/sc-db/commits'
		)
			return route.fulfill({
				json: [
					{
						sha: 'e2e-fixture-version',
						commit: { committer: { date: '2026-01-01T00:00:00Z' } },
					},
				],
			})
		if (url.hostname === 'cdn.stalhub.dev') {
			const path = url.pathname.replace(/\/+/g, '/')
			if (['/db/listing/weapons.json', '/db/listing.json'].includes(path))
				return route.fulfill({ json: { [itemID]: item } })
			if (
				[
					'/db/listing/armor.json',
					'/db/listing/bullet.json',
					'/db/listing/ammo.json',
				].includes(path)
			)
				return route.fulfill({ json: {} })
			if (/\.(png|jpg|webp|svg)$/.test(path))
				return route.fulfill({ contentType: 'image/png', body: pixel })
		}
		if (
			[
				'api.iconify.design',
				'api.simplesvg.com',
				'api.unisvg.com',
			].includes(url.hostname)
		) {
			const prefix =
				url.pathname.split('/').pop()?.replace('.json', '') ?? 'lucide'
			const icons = Object.fromEntries(
				(url.searchParams.get('icons') ?? '')
					.split(',')
					.filter(Boolean)
					.map((name) => [
						name,
						{ body: '<path d="M4 4h16v16H4z"/>' },
					])
			)
			return route.fulfill({
				json: { prefix, icons, width: 24, height: 24 },
			})
		}
		unknown.push(url.href)
		return route.abort('blockedbyclient')
	})
}

export const test = base.extend<{ browserChecks: void }>({
	browserChecks: [
		async ({ context, baseURL }, use, testInfo) => {
			const errors: string[] = []
			const unknown: string[] = []
			context.on('page', (page) => {
				let guestProbeErrors = 0
				page.on('response', (response) => {
					if (
						new URL(page.url()).pathname === '/auth' &&
						response.url() === `${apiURL}/api/v1/users/@me` &&
						response.status() === 401
					)
						guestProbeErrors++
				})
				page.on('pageerror', (error) => {
					// NavMe's known uncaught guest probe can surface after navigation.
					// Match an actual /auth me-probe response; never ignore arbitrary 401s.
					if (
						guestProbeErrors > 0 &&
						error.message ===
							'Request failed with status code 401' &&
						error.stack?.includes('axios/lib/core/settle')
					) {
						guestProbeErrors--
						return
					}
					errors.push(error.stack ?? error.message)
				})
			})
			await context.addCookies([
				{
					name: 'lang',
					value: 'en',
					url: baseURL ?? 'http://localhost:4310',
				},
			])
			await installExternalFixtures(
				context,
				baseURL ?? 'http://localhost:4310',
				unknown
			)
			await use()
			await testInfo.attach(
				'browser-errors-and-blocked-external-requests',
				{
					body: JSON.stringify({ errors, unknown }, null, 2),
					contentType: 'application/json',
				}
			)
			expect(errors, 'Uncaught browser errors').toEqual([])
			expect(
				[...new Set(unknown)],
				'Unexpected external dependencies (blocked, never passed to network)'
			).toEqual([])
		},
		{ auto: true },
	],
})
export { expect }

export async function loginHTTP(request: APIRequestContext, username = owner) {
	const response = await request.post(`${apiURL}/api/v1/auth/login`, {
		data: { username, password },
	})
	expect(
		response.status(),
		`Login ${username}: ${await response.text()}`
	).toBe(200)
	const me = await request.get(`${apiURL}/api/v1/users/@me`)
	expect(me.ok(), await me.text()).toBeTruthy()
	return me.json()
}

export async function loginUI(page: Page) {
	await page.goto('/auth')
	await page.getByRole('button', { name: 'Next', exact: true }).click()
	await page.getByLabel('Username', { exact: true }).fill(owner)
	await page.getByLabel('Password', { exact: true }).fill(password)
	const response = page.waitForResponse(
		(r) =>
			r.url() === `${apiURL}/api/v1/auth/login` &&
			r.request().method() === 'POST'
	)
	await page
		.locator('form')
		.getByRole('button', { name: 'Sign in', exact: true })
		.click()
	expect((await response).status()).toBe(200)
	await expect(page).toHaveURL(/\/me(?:\/|$)/)
	const me = await page.context().request.get(`${apiURL}/api/v1/users/@me`)
	expect(me.ok(), await me.text()).toBeTruthy()
}

export async function readTier(request: APIRequestContext, id: string) {
	const response = await request.get(`${apiURL}/api/v1/tier-lists/${id}`)
	expect(response.ok(), await response.text()).toBeTruthy()
	return response.json()
}
