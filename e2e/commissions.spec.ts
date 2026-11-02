import {
	type APIRequestContext,
	type BrowserContext,
	expect,
} from '@playwright/test'
import { apiURL, installExternalFixtures, loginHTTP, test } from './fixtures'

const root = `${apiURL}/api/v1/commissions`
const pixel = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
	'base64'
)
async function detail(request: APIRequestContext, id: string) {
	const response = await request.get(`${root}/orders/${id}`)
	expect(response.ok(), await response.text()).toBeTruthy()
	return response.json()
}

test('real artist catalogue, price selection, reference, split payment, delivery, revisions and private rating', async ({
	page,
	browser,
	baseURL,
}) => {
	test.setTimeout(240000)
	const contexts: BrowserContext[] = []
	const unknown: string[] = []
	await loginHTTP(page.context().request, 'e2e_artist')
	await page.goto('/me/artist')
	await page
		.getByLabel('About the artist', { exact: true })
		.fill('Portraits and scenes from the Zone')
	await page
		.getByLabel('Terms', { exact: true })
		.fill(
			'One revision round. Payment outside the site; private references.'
		)
	await page.getByLabel('Included revision rounds', { exact: true }).fill('1')
	await page.getByRole('tab', { name: 'Price list', exact: true }).click()
	await page
		.getByRole('button', { name: 'Add price item', exact: true })
		.click()
	await page.getByLabel('Item title', { exact: true }).nth(0).fill('Portrait')
	await page
		.getByLabel('What is included', { exact: true })
		.nth(0)
		.fill('One character')
	await page.getByLabel('Price (RUB)', { exact: true }).nth(0).fill('100.01')
	await page
		.getByRole('button', { name: 'Add price item', exact: true })
		.click()
	await page
		.getByLabel('Item title', { exact: true })
		.nth(1)
		.fill('Background')
	await page
		.getByLabel('What is included', { exact: true })
		.nth(1)
		.fill('A scene')
	await page.getByLabel('Price (RUB)', { exact: true }).nth(1).fill('49.99')
	await page
		.getByRole('tab', {
			name: 'Choose your artwork for the portfolio',
			exact: true,
		})
		.click()
	await page
		.getByRole('checkbox', { name: 'Portfolio sample', exact: true })
		.click()
	await page
		.getByRole('tab', { name: 'About the artist', exact: true })
		.click()
	await page
		.getByRole('switch', { name: 'Accept new commissions', exact: true })
		.click()
	const saved = page.waitForResponse(
		(response) =>
			response.url() === `${root}/profile` &&
			response.request().method() === 'PUT'
	)
	await page.getByRole('button', { name: 'Save', exact: true }).click()
	expect((await saved).ok()).toBeTruthy()
	await expect
		.poll(
			async () =>
				(
					await (
						await page.context().request.get(`${root}/profile`)
					).json()
				)?.accepting
		)
		.toBe(true)
	try {
		const guest = await browser.newContext()
		contexts.push(guest)
		await guest.addCookies([
			{
				name: 'lang',
				value: 'en',
				url: baseURL ?? 'http://localhost:4310',
			},
		])
		await installExternalFixtures(
			guest,
			baseURL ?? 'http://localhost:4310',
			unknown
		)
		const guestPage = await guest.newPage()
		await guestPage.goto('/artists')
		await expect(
			guestPage.getByRole('heading', { name: 'Artists', exact: true })
		).toBeVisible()
		await guestPage
			.getByRole('link', { name: 'e2e_artist', exact: true })
			.click()
		await expect(
			guestPage.getByRole('img', {
				name: 'Portfolio sample',
				exact: true,
			})
		).toBeVisible()
		await expect(
			guestPage.getByRole('link', {
				name: 'Sign in to order',
				exact: true,
			})
		).toBeVisible()
		const customer = await browser.newContext()
		contexts.push(customer)
		await customer.addCookies([
			{
				name: 'lang',
				value: 'en',
				url: baseURL ?? 'http://localhost:4310',
			},
		])
		await installExternalFixtures(
			customer,
			baseURL ?? 'http://localhost:4310',
			unknown
		)
		await loginHTTP(customer.request, 'e2e_other')
		const client = await customer.newPage()
		await client.goto('/artists/e2e_artist')
		await client
			.getByRole('checkbox', { name: 'Portrait', exact: true })
			.click()
		await client
			.getByRole('checkbox', { name: 'Background', exact: true })
			.click()
		await client.getByRole('button', { name: 'Next', exact: true }).click()
		await client
			.getByLabel('Order title', { exact: true })
			.fill('Browser commission')
		await client
			.getByLabel(
				'Describe the task, preferences and delivery requirements',
				{ exact: true }
			)
			.fill('Draw a stalker in the Zone using the attached reference.')
		await client.locator('input[type=file]').setInputFiles({
			name: 'reference.png',
			mimeType: 'image/png',
			buffer: pixel,
		})
		await expect(
			client.getByText('reference.png', { exact: true })
		).toBeVisible()
		await client
			.getByRole('checkbox', { name: /I have read the terms/ })
			.click()
		await client
			.getByRole('button', { name: 'Send request', exact: true })
			.click()
		await expect(client).toHaveURL(/\/me\/commissions\/[^/]+$/)
		const id = new URL(client.url()).pathname.split('/').at(-1) ?? ''
		await page.goto(`/me/commissions/${id}`)
		await expect(
			page.getByRole('heading', {
				name: 'Browser commission',
				exact: true,
			})
		).toBeVisible()

		await page
			.getByLabel('Delivery deadline', { exact: true })
			.fill(
				new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
			)
		await page
			.getByLabel('Payment title', { exact: true })
			.nth(0)
			.fill('Deposit')
		await page.getByLabel('Price (RUB)', { exact: true }).nth(0).fill('50')
		await page
			.getByLabel(
				'Payment details and instructions (private to the order)',
				{ exact: true }
			)
			.nth(0)
			.fill('External payment instructions')
		await page
			.getByRole('button', { name: 'Add payment', exact: true })
			.click()
		await page
			.getByLabel('Payment title', { exact: true })
			.nth(1)
			.fill('Balance')
		await page.getByLabel('Price (RUB)', { exact: true }).nth(1).fill('100')
		await page
			.getByLabel(
				'Payment details and instructions (private to the order)',
				{ exact: true }
			)
			.nth(1)
			.fill('External balance instructions')
		await page
			.getByRole('button', { name: 'Accept order', exact: true })
			.click()

		await page.getByRole('button', { name: 'Confirm', exact: true }).click()
		await expect
			.poll(async () => (await detail(customer.request, id)).status)
			.toBe('ACCEPTED')

		await client
			.getByRole('button', { name: 'I paid', exact: true })
			.first()
			.click()

		await client
			.getByRole('button', { name: 'Confirm', exact: true })
			.click()
		await expect
			.poll(async () =>
				(await detail(customer.request, id)).payments.some(
					(p: { status: string }) => p.status === 'SENT'
				)
			)
			.toBe(true)
		await page
			.getByRole('button', { name: 'Payment received', exact: true })
			.first()
			.click()

		await page.getByRole('button', { name: 'Confirm', exact: true }).click()
		await page
			.getByRole('button', { name: 'Start work', exact: true })
			.click()

		await page.getByRole('button', { name: 'Confirm', exact: true }).click()
		await expect
			.poll(async () => (await detail(customer.request, id)).status)
			.toBe('IN_PROGRESS')

		await page
			.getByLabel('Message / explanation', { exact: true })
			.fill('First version of the result')

		await page
			.getByRole('button', { name: 'Deliver result', exact: true })
			.click()

		await client
			.getByLabel('Message / explanation', { exact: true })
			.fill('Please adjust the background colors')

		await client
			.getByRole('button', { name: 'Request revisions', exact: true })
			.click()
		await expect
			.poll(
				async () => (await detail(customer.request, id)).revisions_used
			)
			.toBe(1)

		await page
			.getByLabel('Message / explanation', { exact: true })
			.fill('Revised final result')

		await page
			.getByRole('button', { name: 'Deliver result', exact: true })
			.click()
		await client
			.getByRole('button', { name: 'I paid', exact: true })
			.click()

		await client
			.getByRole('button', { name: 'Confirm', exact: true })
			.click()
		await page
			.getByRole('button', { name: 'Payment received', exact: true })
			.click()

		await page.getByRole('button', { name: 'Confirm', exact: true }).click()
		await client
			.getByRole('button', {
				name: 'Approve result and complete',
				exact: true,
			})
			.click()

		await client
			.getByRole('button', { name: 'Confirm', exact: true })
			.click()
		await expect
			.poll(async () => (await detail(customer.request, id)).status)
			.toBe('COMPLETED')

		await page
			.getByRole('button', { name: 'Save rating', exact: true })
			.click()
		await page
			.getByLabel('Explanation', { exact: true })
			.fill('Reliable client, clear brief')
		await page.getByRole('button', { name: 'Confirm', exact: true }).click()
		await expect(
			client.getByRole('heading', {
				name: 'Customer reputation',
				exact: true,
			})
		).toHaveCount(0)
		await expect(
			client.getByText('Reliable client, clear brief', { exact: true })
		).toHaveCount(0)
		await page.bringToFront()
		await page.evaluate(() => window.scrollTo(0, 0))
		await expect(
			page.getByRole('heading', {
				name: 'Browser commission',
				exact: true,
			})
		).toBeVisible()
		await page.screenshot({
			path: 'test-results/commissions-artist.png',
			fullPage: true,
			animations: 'disabled',
		})
		await client.bringToFront()
		await client.setViewportSize({ width: 390, height: 844 })
		await client.evaluate(() => window.scrollTo(0, 0))
		await client.screenshot({
			path: 'test-results/commissions-mobile.png',
			fullPage: true,
			animations: 'disabled',
		})
		expect(
			await client.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth
			)
		).toBe(true)
	} finally {
		for (const context of contexts) await context.close()
		expect(unknown).toEqual([])
	}
})

test('independent arbiter resolves a real dispute and customer confirms the external partial refund', async ({
	page,
	browser,
	baseURL,
}) => {
	test.setTimeout(180000)
	const contexts: BrowserContext[] = []
	const unknown: string[] = []
	const web = baseURL ?? 'http://localhost:4310'
	const context = async (username: string) => {
		const next = await browser.newContext()
		contexts.push(next)
		await next.addCookies([{ name: 'lang', value: 'en', url: web }])
		await installExternalFixtures(next, web, unknown)
		await loginHTTP(next.request, username)
		return next
	}
	try {
		const artist = await context('e2e_artist')
		const customer = await context('e2e_other')
		let profile = await (await artist.request.get(`${root}/profile`)).json()
		if (!profile) {
			const saved = await artist.request.put(`${root}/profile`, {
				data: {
					version: 0,
					description: 'Dispute test artist',
					accepting: true,
					currency: 'RUB',
					terms: 'Payment outside the site',
					revisions: 1,
					portfolio_ids: [],
					prices: [
						{
							title: 'Portrait',
							description: 'A portrait',
							amount: 15000,
							days_min: 2,
							days_max: 7,
						},
					],
				},
			})
			expect(saved.ok(), await saved.text()).toBeTruthy()
			profile = await saved.json()
		}
		const created = await customer.request.post(`${root}/orders`, {
			data: {
				key: crypto.randomUUID(),
				artist_id: profile.user_id,
				profile_version: profile.version,
				price_ids: profile.prices.map((p: { id: string }) => p.id),
				title: 'Arbitration browser case',
				brief: 'A real project brief for dispute testing.',
				file_ids: [],
			},
		})
		expect(created.ok(), await created.text()).toBeTruthy()
		const { id } = await created.json()
		const action = async (
			request: APIRequestContext,
			name: string,
			extra: object = {}
		) => {
			const order = await detail(request, id)
			const response = await request.post(
				`${root}/orders/${id}/actions`,
				{
					data: {
						key: crypto.randomUUID(),
						version: order.version,
						action: name,
						...extra,
					},
				}
			)
			expect(response.ok(), await response.text()).toBeTruthy()
		}
		const order = await detail(customer.request, id)
		await action(artist.request, 'accept', {
			due_at: new Date(Date.now() + 7 * 86400000).toISOString(),
			payments: [
				{
					title: 'Full payment',
					amount: order.total,
					upfront: true,
					instructions: 'Pay externally',
				},
			],
		})
		const accepted = await detail(artist.request, id)
		await action(artist.request, 'payment_received', {
			target_id: accepted.payments[0].id,
		})
		await action(customer.request, 'dispute', {
			content:
				'The agreed deadline cannot be met, please resolve this dispute.',
		})
		await loginHTTP(page.context().request, 'e2e_arbiter')
		await page.goto('/me/arbitration')
		await page
			.getByRole('button', { name: 'Take this case', exact: true })
			.click()
		await page
			.getByRole('link', { name: 'Arbiter assigned', exact: true })
			.click()
		await page
			.getByLabel('Reason for the decision', { exact: true })
			.fill(
				'A partial external refund is appropriate based on the evidence.'
			)
		await page
			.getByRole('tab', { name: 'Cancel order', exact: true })
			.click()
		await page
			.getByLabel(
				'Obligations: deliverables, remaining payment, refund and deadlines',
				{ exact: true }
			)
			.fill(
				'Cancel the order, waive any remaining balance and refund 30 RUB outside the site.'
			)
		await page
			.getByLabel('External refund amount (0 for none) (RUB)', {
				exact: true,
			})
			.fill('30')
		await page
			.getByLabel('Delivery deadline', { exact: true })
			.fill(
				new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
			)
		await page
			.getByRole('button', { name: 'Issue decision', exact: true })
			.click()
		await expect
			.poll(async () => (await detail(customer.request, id)).status)
			.toBe('CANCELLED')
		const resolved = await detail(artist.request, id)
		expect(resolved.refunds[0]).toMatchObject({
			amount: 3000,
			status: 'EXPECTED',
		})
		const uploaded = await artist.request.post(`${root}/files`, {
			multipart: {
				file: {
					name: 'refund-proof.png',
					mimeType: 'image/png',
					buffer: pixel,
				},
			},
		})
		expect(uploaded.ok(), await uploaded.text()).toBeTruthy()
		const proof = await uploaded.json()
		await action(artist.request, 'refund_sent', {
			target_id: resolved.refunds[0].id,
			file_ids: [proof.id],
			content: 'Refund sent outside this site',
		})
		const customerPage = await customer.newPage()
		await customerPage.goto(`/me/commissions/${id}`)

		await customerPage
			.getByRole('button', { name: 'Refund received', exact: true })
			.click()

		await customerPage
			.getByRole('button', { name: 'Confirm', exact: true })
			.click()
		await expect
			.poll(
				async () =>
					(await detail(customer.request, id)).refunds[0].status
			)
			.toBe('RECEIVED')
		await page.bringToFront()
		await expect(
			page.getByRole('heading', { name: 'Cancel order', exact: true })
		).toBeVisible()
		await page.evaluate(() => window.scrollTo(0, 0))
		await page.screenshot({
			path: 'test-results/commissions-arbitration.png',
			fullPage: true,
			animations: 'disabled',
		})
	} finally {
		for (const item of contexts) await item.close()
		expect(unknown).toEqual([])
	}
})
