import { expect, test } from '@playwright/test'

const source = { id: '96n2l', category: 'armor/clothes' }
const translation = (key: string) => ({
	type: 'translation' as const,
	key,
	args: {},
	lines: { en: key, ru: key },
})
const target = {
	id: 'comparison-combat',
	category: 'armor/combat',
	name: translation('Comparison combat armor'),
	color: 'DEFAULT',
	infoBlocks: [
		{
			type: 'list',
			title: translation('Armor stats'),
			elements: [
				{
					type: 'numeric',
					name: translation('Comparison protection'),
					value: 123,
				},
			],
		},
	],
}
const listing = [
	{
		data: `/items/${source.category}/${source.id}.json`,
		name: { en: 'Source jacket' },
		color: 'DEFAULT',
	},
	{
		data: `/items/${target.category}/${target.id}.json`,
		name: { en: 'Comparison combat armor' },
		color: 'DEFAULT',
	},
	{
		data: '/items/armor/scientist/comparison-scientist.json',
		name: { en: 'Comparison scientific armor' },
		color: 'DEFAULT',
	},
	{
		data: '/items/weapon/assault_rifle/comparison-weapon.json',
		name: { en: 'Forbidden weapon' },
		color: 'DEFAULT',
	},
	{
		data: '/items/armor/combat/comparison-forged.json',
		name: { en: 'Forged catalog item' },
		color: 'DEFAULT',
	},
]
const pixel = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
	'base64'
)

test.beforeEach(async ({ context }) => {
	await context.addCookies([
		{ name: 'lang', value: 'en', url: 'http://localhost:4310' },
	])
	await context.route('**/*', async (route) => {
		const url = new URL(route.request().url())
		const path = url.pathname.replace(/\/+/g, '/')
		if (path.startsWith('/api/v1/')) {
			if (path.endsWith('/lots'))
				return route.fulfill({ json: { total: 0, lots: [] } })
			if (path.endsWith('/history'))
				return route.fulfill({ json: { total: 0, prices: [] } })
			if (path.includes('/barter/'))
				return route.fulfill({ status: 404, json: {} })
			return route.fulfill({ json: null })
		}
		if (url.hostname === 'api.github.com')
			return route.fulfill({ json: [{ sha: 'comparison-fixture' }] })
		if (url.hostname === 'cdn.stalhub.dev') {
			if (path === '/db/listing.json')
				return route.fulfill({ json: listing })
			if (path.endsWith(`/${target.id}.json`))
				return route.fulfill({ json: target })
			if (path.endsWith('/comparison-forged.json'))
				return route.fulfill({
					json: {
						...target,
						id: 'comparison-forged',
						category: 'weapon/assault_rifle',
					},
				})
			if (path.endsWith('/comparison-scientist.json'))
				return route.fulfill({
					json: {
						...target,
						id: 'comparison-scientist',
						category: 'armor/scientist',
						name: translation('Comparison scientific armor'),
					},
				})
		}
		if (path === '/_next/image' || /\.(png|jpg|webp)$/.test(path))
			return route.fulfill({ contentType: 'image/png', body: pixel })
		if (url.hostname === 'umami.stalhub.dev')
			return route.fulfill({
				contentType: 'application/javascript',
				body: '',
			})
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
		return route.continue()
	})
})

test('compares different armor subcategories, excludes the source and weapons, and rejects forged categories', async ({
	page,
}) => {
	const errors: string[] = []
	page.on('pageerror', (error) => errors.push(error.message))
	await page.goto(`/items/${source.category}/${source.id}`)
	await page.getByRole('button', { name: 'Compare', exact: true }).click()
	const dialog = page.getByRole('dialog')
	await expect(
		dialog.getByText('Comparison combat armor', { exact: true })
	).toBeVisible()
	await expect(
		dialog.getByText('Comparison scientific armor', { exact: true })
	).toBeVisible()
	await expect(
		dialog.getByText('Forbidden weapon', { exact: true })
	).toHaveCount(0)
	await expect(
		dialog.getByText('Source jacket', { exact: true })
	).toHaveCount(0)
	await dialog.getByText('Comparison combat armor', { exact: true }).click()
	await expect(
		dialog.getByRole('heading', { name: 'Comparison combat armor' })
	).toBeVisible()
	await expect(
		dialog.getByText('Comparison protection', { exact: true })
	).toBeVisible()
	await expect(dialog.getByText('123', { exact: true })).toBeVisible()
	await page.screenshot({
		path: 'test-results/item-comparison.png',
		fullPage: true,
	})
	await page.setViewportSize({ width: 390, height: 844 })
	await dialog
		.getByRole('heading', { name: 'Comparison combat armor' })
		.scrollIntoViewIfNeeded()
	await expect(
		dialog.getByRole('heading', { name: 'Comparison combat armor' })
	).toBeVisible()
	expect(
		await dialog.evaluate(
			(element) => element.scrollWidth <= element.clientWidth
		)
	).toBe(true)
	await page.screenshot({ path: 'test-results/item-comparison-mobile.png' })
	await page.setViewportSize({ width: 1280, height: 720 })
	await dialog.getByRole('button', { name: 'Change', exact: true }).click()
	await dialog
		.getByText('Comparison scientific armor', { exact: true })
		.click()
	await expect(
		dialog.getByRole('heading', { name: 'Comparison scientific armor' })
	).toBeVisible()
	await dialog.getByRole('button', { name: 'Change', exact: true }).click()
	await dialog.getByText('Forged catalog item', { exact: true }).click()
	await expect(
		dialog.getByText(
			'This item cannot be compared: categories do not match'
		)
	).toBeVisible()
	expect(errors).toEqual([])
})

test('retries a failed selected target and then shows its stats', async ({
	context,
	page,
}) => {
	const targetPath = `/db/items/${target.category}/${target.id}.json`
	let targetRequests = 0
	await context.route(
		(url) =>
			url.hostname === 'cdn.stalhub.dev' &&
			url.pathname.replace(/\/+/g, '/') === targetPath,
		(route) => {
			targetRequests++
			if (targetRequests === 1)
				return route.fulfill({ status: 503, json: {} })
			return route.fulfill({ json: target })
		}
	)
	await page.goto(`/items/${source.category}/${source.id}`)
	await page.getByRole('button', { name: 'Compare', exact: true }).click()
	const dialog = page.getByRole('dialog')
	await dialog.getByText('Comparison combat armor', { exact: true }).click()
	await expect(dialog.getByText('Failed to load the item')).toBeVisible()
	await expect(
		dialog.getByText('Comparison protection', { exact: true })
	).toHaveCount(0)
	await dialog.getByRole('button', { name: 'Retry', exact: true }).click()
	await expect(
		dialog.getByRole('heading', { name: 'Comparison combat armor' })
	).toBeVisible()
	await expect(
		dialog.getByText('Comparison protection', { exact: true })
	).toBeVisible()
	await expect(dialog.getByText('123', { exact: true })).toBeVisible()
	expect(targetRequests).toBe(2)
})
