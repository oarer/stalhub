import { expect, test } from '@playwright/test'

const WEB_ORIGIN = process.env.E2E_WEB_ORIGIN ?? 'http://localhost:4310'
const source = { id: '96n2l', category: 'armor/clothes' }
const translation = (key: string, text = key) => ({
	type: 'translation' as const,
	key,
	args: {},
	lines: { en: text, ru: text },
})
const statsBlock = (protection: number) => [
	{
		type: 'list',
		title: translation('Armor stats'),
		elements: [
			{
				type: 'numeric',
				name: translation(
					'weapon.tooltip.weapon.info.stopping_power',
					'Comparison protection'
				),
				value: protection,
			},
		],
	},
]
const sourceItem = {
	id: source.id,
	category: source.category,
	name: translation('Source jacket'),
	color: 'DEFAULT',
	infoBlocks: statsBlock(100),
}
const target = {
	id: 'comparison-combat',
	category: 'armor/combat',
	name: translation('Comparison combat armor'),
	color: 'DEFAULT',
	infoBlocks: statsBlock(123),
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
	await context.addCookies([{ name: 'lang', value: 'en', url: WEB_ORIGIN }])
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
			if (path.endsWith(`/${source.id}.json`))
				return route.fulfill({ json: sourceItem })
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
						infoBlocks: statsBlock(90),
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

test('opens a dedicated comparison page, filters candidates and highlights differences', async ({
	page,
}) => {
	const errors: string[] = []
	page.on('pageerror', (error) => errors.push(error.message))

	await page.goto(`/items/${source.category}/${source.id}`)
	await page
		.getByRole('button', { name: /Отклонить|Decline/ })
		.click({ timeout: 3000 })
		.catch(() => undefined)
	await expect(
		page.getByRole('link', { name: 'Compare', exact: true })
	).toHaveAttribute(
		'href',
		`/items/compare?items=${encodeURIComponent(`${source.category}/${source.id}`)}`
	)

	await page.goto(`/items/compare?items=${source.category}/${source.id}`)
	await expect(page).toHaveURL(/\/items\/compare\?items=armor/)
	await expect(
		page.getByRole('heading', { name: 'Source jacket' })
	).toBeVisible()

	await page.getByRole('button', { name: 'Choose item', exact: true }).click()
	const dialog = page.getByRole('dialog')
	await expect(
		dialog.getByRole('heading', { name: 'Choose an item' })
	).toBeVisible()
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
		page.getByRole('heading', { name: 'Comparison combat armor' })
	).toBeVisible()

	await page.getByRole('button', { name: /Item 3/ }).click()
	const addDialog = page.getByRole('dialog')
	await expect(
		addDialog.getByText('Comparison combat armor', { exact: true })
	).toHaveCount(0)
	await addDialog
		.getByText('Comparison scientific armor', { exact: true })
		.click()

	await expect(
		page.getByRole('heading', { name: 'Comparison scientific armor' })
	).toBeVisible()
	await expect(page).toHaveURL(
		/items=armor%2Fclothes%2F96n2l&items=armor%2Fcombat%2Fcomparison-combat&items=armor%2Fscientist%2Fcomparison-scientist/
	)
	await expect(
		page.getByText('Comparison protection', { exact: true })
	).toBeVisible()
	await expect(page.getByText('100', { exact: true })).toBeVisible()
	await expect(page.getByText('90', { exact: true })).toBeVisible()
	await expect(page.getByText('123', { exact: true })).toBeVisible()

	const protectionRow = page.locator(
		'[data-stat-key="weapon.tooltip.weapon.info.stopping_power"]'
	)
	await expect(
		protectionRow.locator('[data-highlight="best"]')
	).toContainText('123')
	await expect(
		protectionRow.locator('[data-highlight="worst"]')
	).toContainText('90')
	const bestCell = protectionRow.locator('[data-highlight="best"]')
	await page.mouse.move(0, 0)
	await bestCell.hover()
	await expect(
		page.getByText('Difference from other items', { exact: true })
	).toBeVisible()
	await expect(page.getByText('-23')).toBeVisible()
	await expect(page.getByText('-33')).toBeVisible()
	await expect(page.getByText('Best', { exact: true }).first()).toBeVisible()
	await expect(page.getByText('Worst', { exact: true }).first()).toBeVisible()

	await page.screenshot({
		path: 'test-results/item-comparison.png',
		fullPage: true,
	})

	await page.mouse.move(0, 0)
	await expect(
		page.getByText('Difference from other items', { exact: true })
	).toHaveCount(0)

	await page.setViewportSize({ width: 390, height: 844 })
	await expect(
		page.getByRole('heading', { name: 'Comparison combat armor' })
	).toBeVisible()
	await expect(
		page.evaluate(
			() =>
				document.documentElement.scrollWidth <=
				document.documentElement.clientWidth
		)
	).resolves.toBe(true)
	await page.screenshot({ path: 'test-results/item-comparison-mobile.png' })

	await page.setViewportSize({ width: 1280, height: 720 })
	await page
		.getByRole('button', { name: 'Change', exact: true })
		.last()
		.click()
	await page.keyboard.press('Escape')

	await page.goto(
		`/items/compare?items=${source.category}/${source.id}&items=weapon/assault_rifle/comparison-forged`
	)
	await expect(
		page.getByText('This item cannot be compared: categories do not match')
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

	await page.goto(`/items/compare?items=${source.category}/${source.id}`)
	await page.getByRole('button', { name: 'Choose item', exact: true }).click()
	await page
		.getByRole('dialog')
		.getByText('Comparison combat armor', { exact: true })
		.click()

	await expect(page.getByText('Failed to load the item').last()).toBeVisible()
	await expect(
		page.getByText('Comparison protection', { exact: true })
	).toHaveCount(0)

	await page
		.getByRole('button', { name: 'Retry', exact: true })
		.last()
		.click()
	await expect(
		page.getByRole('heading', { name: 'Comparison combat armor' })
	).toBeVisible()
	await expect(
		page.getByText('Comparison protection', { exact: true })
	).toBeVisible()
	await expect(page.getByText('123', { exact: true })).toBeVisible()
	expect(targetRequests).toBe(2)
})
