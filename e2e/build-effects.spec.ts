import { expect, type Locator, type Page, test } from '@playwright/test'
import {
	CARRY,
	consumableNames as names,
	type ExternalCapture,
	installBuildFixtures,
	LONG_BOOST,
	RADIATION,
	STAMINA,
} from './build-effects.fixtures'

// Frontend-only regressions: no Go backend is involved (guest API calls are
// mocked). CDN consumables/artefact listings are fulfilled by browser route
// mocks; armor/containers are fetched by SSR from the real CDN.

const origin = process.env.E2E_WEB_ORIGIN ?? 'http://localhost:4310'
const FAVORITES_KEY = 'favorites-storage'
const BUILD_KEY = 'build-storage'

let capture: ExternalCapture
let pageErrors: string[]

test.beforeEach(async ({ context, page }) => {
	capture = { unknown: [] }
	pageErrors = []
	page.on('pageerror', (error) => {
		// Guest probe of /users/@me is mocked to 401 and surfaces as an
		// unhandled axios rejection in the app shell.
		if (error.message === 'Request failed with status code 401') return
		pageErrors.push(error.stack ?? error.message)
	})
	await installBuildFixtures(context, origin, capture)
})

test.afterEach(() => {
	expect([...new Set(capture.unknown)], 'blocked external requests').toEqual([])
	expect(pageErrors, 'uncaught browser errors').toEqual([])
})

type StoredFavorite = { type: string; itemId: string }

async function storedFavorites(page: Page): Promise<StoredFavorite[]> {
	return page.evaluate((key) => {
		const raw = localStorage.getItem(key)
		return raw ? JSON.parse(raw).state.favorites : []
	}, FAVORITES_KEY)
}

async function storedFavoriteKeys(page: Page): Promise<string[]> {
	return (await storedFavorites(page)).map((f) => `${f.type}:${f.itemId}`)
}

async function listNames(dialog: Locator): Promise<string[]> {
	return dialog.locator('[data-index]').evaluateAll((rows) =>
		rows
			.map((row) => ({
				index: Number(row.getAttribute('data-index')),
				text: row.querySelector('p')?.textContent ?? '',
			}))
			.sort((a, b) => a.index - b.index)
			.map((row) => row.text)
	)
}

// Combobox dropdown is portalled to <body>; option rows are plain divs, so read
// them through their star buttons (aria-label "Favorites: <option>").
const star = (page: Page, option: string) =>
	page.locator(`[aria-label="Favorites: ${option}"]`)

async function dropdownOptions(page: Page): Promise<string[]> {
	return page
		.locator('[aria-label^="Favorites: "]')
		.evaluateAll((buttons) =>
			buttons
				.map((button) => ({
					top: button.parentElement?.getBoundingClientRect().top ?? 0,
					label: (button.getAttribute('aria-label') ?? '').replace(
						'Favorites: ',
						''
					),
				}))
				.sort((a, b) => a.top - b.top)
				.map((o) => o.label)
		)
}

async function openLiteBoostDialog(page: Page) {
	await page.goto('/calcs/builds/lite')
	await page
		.getByRole('button', { name: 'Select Long-term boost', exact: true })
		.click()
	const dialog = page.getByRole('dialog')
	await expect(dialog).toBeVisible()
	await expect(dialog.getByText(names.alpha, { exact: true })).toBeVisible()
	return dialog
}

async function openCombobox(page: Page, dialog: Locator, label: string) {
	await dialog.getByRole('button', { name: label, exact: true }).click()
	await expect(page.getByPlaceholder('Search', { exact: true })).toBeVisible()
}

async function closeCombobox(page: Page, dialog: Locator) {
	await dialog.getByRole('heading').first().click()
	await expect(page.getByPlaceholder('Search', { exact: true })).toBeHidden()
}

async function pickOption(page: Page, option: string) {
	await page
		.getByText(option, { exact: true })
		.and(page.locator('span.truncate'))
		.click()
}

test('lite boost picker: buff sorts descending, debuff ascending, search keeps order', async ({
	page,
}) => {
	const dialog = await openLiteBoostDialog(page)

	// The short-term "Foxtrot Stim" must not leak into the long-term category.
	expect(await listNames(dialog)).toEqual([
		names.alpha,
		names.bravo,
		names.charlie,
		names.delta,
		names.echo,
	])

	await openCombobox(page, dialog, 'Positive')
	await pickOption(page, 'Stamina')
	await closeCombobox(page, dialog)
	// Stamina: bravo 30, charlie 20, delta 20 (stable tie), alpha 10.
	expect(await listNames(dialog)).toEqual([
		names.bravo,
		names.charlie,
		names.delta,
		names.alpha,
	])

	// Fuzzy relevance would put the long "Bravo ..." name later; order must hold.
	await dialog.getByLabel('Search by name').fill('Tonic')
	expect(await listNames(dialog)).toEqual([
		names.bravo,
		names.charlie,
		names.delta,
		names.alpha,
	])
})

test('lite boost picker: debuff filter sorts ascending and positive ties break by debuff', async ({
	page,
}) => {
	const dialog = await openLiteBoostDialog(page)

	await openCombobox(page, dialog, 'Negative')
	await pickOption(page, 'Radiation buildup')
	await closeCombobox(page, dialog)
	// Radiation debuff: charlie 2, delta 5, bravo 8 (lower is better).
	expect(await listNames(dialog)).toEqual([
		names.charlie,
		names.delta,
		names.bravo,
	])

	await openCombobox(page, dialog, 'Positive')
	await pickOption(page, 'Stamina')
	await closeCombobox(page, dialog)
	// Stamina has priority: bravo 30 first; charlie/delta tie at 20 are
	// then broken by the lower radiation debuff.
	expect(await listNames(dialog)).toEqual([
		names.bravo,
		names.charlie,
		names.delta,
	])
})

test('lite effect favorites: star does not select the option, stays in its own namespace and floats to the top', async ({
	page,
}) => {
	const dialog = await openLiteBoostDialog(page)

	await openCombobox(page, dialog, 'Positive')
	expect(await dropdownOptions(page)).toEqual(['Stamina', 'Carry weight'])
	await expect(star(page, 'Carry weight')).toHaveAttribute(
		'aria-pressed',
		'false'
	)

	await star(page, 'Carry weight').click()

	await expect(star(page, 'Carry weight')).toHaveAttribute(
		'aria-pressed',
		'true'
	)
	expect(await dropdownOptions(page)).toEqual(['Carry weight', 'Stamina'])
	// Star click must not toggle selection: dropdown stays open, the list is
	// not filtered and the trigger still shows the placeholder.
	await expect(page.getByPlaceholder('Search', { exact: true })).toBeVisible()
	expect(await listNames(dialog)).toHaveLength(5)
	await expect(
		dialog.getByRole('button', { name: 'Positive', exact: true })
	).toBeVisible()
	expect(await storedFavoriteKeys(page)).toEqual([`positive-effect:${CARRY}`])

	await star(page, 'Carry weight').click()
	await expect(star(page, 'Carry weight')).toHaveAttribute(
		'aria-pressed',
		'false'
	)
	expect(await storedFavoriteKeys(page)).toEqual([])
	await closeCombobox(page, dialog)

	await openCombobox(page, dialog, 'Negative')
	await star(page, 'Radiation buildup').click()
	expect(await storedFavoriteKeys(page)).toEqual([
		`negative-effect:${RADIATION}`,
	])
	// The Positive group does not see the negative namespace.
	await closeCombobox(page, dialog)
	await openCombobox(page, dialog, 'Positive')
	await expect(star(page, 'Stamina')).toHaveAttribute('aria-pressed', 'false')
})

test('lite effect favorites: keyboard Enter and Space on the star toggle it without selecting the option', async ({
	page,
}) => {
	const dialog = await openLiteBoostDialog(page)

	await openCombobox(page, dialog, 'Positive')
	// Search input is focused (rAF); Tab moves to the first option's star.
	await expect(page.getByPlaceholder('Search', { exact: true })).toBeFocused()
	await page.keyboard.press('Tab')
	await expect(star(page, 'Stamina')).toBeFocused()

	await page.keyboard.press('Enter')
	await expect(star(page, 'Stamina')).toHaveAttribute('aria-pressed', 'true')
	expect(await storedFavoriteKeys(page)).toEqual([`positive-effect:${STAMINA}`])

	await expect(star(page, 'Stamina')).toBeFocused()
	await page.keyboard.press('Space')
	await expect(star(page, 'Stamina')).toHaveAttribute('aria-pressed', 'false')
	expect(await storedFavoriteKeys(page)).toEqual([])

	// Neither key selected the option or closed the dropdown.
	await expect(page.getByPlaceholder('Search', { exact: true })).toBeVisible()
	expect(await listNames(dialog)).toHaveLength(5)
	await expect(
		dialog.getByRole('button', { name: 'Positive', exact: true })
	).toBeVisible()
})

test('lite effect favorites and picked boost survive a reload', async ({
	page,
}) => {
	let dialog = await openLiteBoostDialog(page)

	await openCombobox(page, dialog, 'Positive')
	await star(page, 'Carry weight').click()
	await closeCombobox(page, dialog)

	await openCombobox(page, dialog, 'Negative')
	await pickOption(page, 'Radiation buildup')
	await closeCombobox(page, dialog)
	await dialog.getByText(names.charlie, { exact: true }).click()
	await dialog.getByRole('button', { name: 'Select', exact: true }).click()
	await expect(dialog).toBeHidden()

	const trash = page.getByRole('button', { name: 'Delete', exact: true })
	await expect(trash).toBeVisible()
	const boost = await page.evaluate(
		(key) => JSON.parse(localStorage.getItem(key) ?? '{}').state.build.boost,
		BUILD_KEY
	)
	expect(boost[LONG_BOOST]).toBe('e2e-charlie')

	await page.reload()
	await expect(
		page.getByRole('button', { name: 'Delete', exact: true })
	).toBeVisible()
	expect(await storedFavoriteKeys(page)).toEqual([`positive-effect:${CARRY}`])

	await page
		.getByRole('button', { name: 'Select Long-term boost', exact: true })
		.click()
	dialog = page.getByRole('dialog')
	await expect(dialog).toBeVisible()
	await openCombobox(page, dialog, 'Positive')
	expect(await dropdownOptions(page)).toEqual(['Carry weight', 'Stamina'])
	await expect(star(page, 'Carry weight')).toHaveAttribute(
		'aria-pressed',
		'true'
	)
	await expect(star(page, 'Stamina')).toHaveAttribute('aria-pressed', 'false')
})

test('Escape closes only the effect dropdown, not the surrounding modal', async ({
	page,
}) => {
	const dialog = await openLiteBoostDialog(page)
	const search = page.getByPlaceholder('Search', { exact: true })

	await openCombobox(page, dialog, 'Positive')
	await expect(search).toBeFocused()
	await page.keyboard.press('Escape')
	await expect(search).toBeHidden()
	await expect(dialog).toBeVisible({ timeout: 3000 })
})

// Full builds page (/calcs/builds, there is no /calcs/builds/model route): the
// armor mesh of the real WebGL scene opens the boost card, whose slots open the
// ItemPickerPanel with the single "Effects" combobox (namespace `effect`).
async function openFullBoostDialog(page: Page) {
	await page.goto('/calcs/builds')
	const canvas = page.locator('canvas').first()
	await expect(canvas).toBeVisible()
	const slots = page.locator('div.grid-cols-3 > button')
	await expect(async () => {
		const box = await canvas.boundingBox()
		if (!box) throw new Error('canvas has no box')
		await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.4)
		await expect(slots.first()).toBeVisible({ timeout: 2000 })
	}).toPass({ timeout: 60_000 })
	await slots.first().click()
	const dialog = page.getByRole('dialog')
	await expect(dialog).toBeVisible()
	await expect(dialog.getByText(names.alpha, { exact: true })).toBeVisible()
	return dialog
}

test.describe('full builds page', () => {
	test.setTimeout(150_000)

	test('boost picker: Effects filter sorts buff descending and debuff ascending, search keeps order', async ({
		page,
	}) => {
		const dialog = await openFullBoostDialog(page)

		await openCombobox(page, dialog, 'Effects')
		await pickOption(page, 'Stamina')
		await closeCombobox(page, dialog)
		expect(await listNames(dialog)).toEqual([
			names.bravo,
			names.charlie,
			names.delta,
			names.alpha,
		])

		await dialog.getByLabel('Enter item name').fill('Tonic')
		expect(await listNames(dialog)).toEqual([
			names.bravo,
			names.charlie,
			names.delta,
			names.alpha,
		])
		await dialog.getByLabel('Enter item name').fill('')

		// Swap the buff for the radiation debuff: lower value first.
		await openCombobox(page, dialog, 'Stamina')
		await pickOption(page, 'Stamina')
		await pickOption(page, 'Radiation buildup')
		await closeCombobox(page, dialog)
		expect(await listNames(dialog)).toEqual([
			names.charlie,
			names.delta,
			names.bravo,
		])
	})

	test('boost picker: effect star toggles by click, Enter and Space without selecting, then survives a reload', async ({
		page,
	}) => {
		let dialog = await openFullBoostDialog(page)

		await openCombobox(page, dialog, 'Effects')
		expect(await dropdownOptions(page)).toEqual([
			'Stamina',
			'Radiation buildup',
			'Carry weight',
		])

		await star(page, 'Carry weight').click()
		await expect(star(page, 'Carry weight')).toHaveAttribute(
			'aria-pressed',
			'true'
		)
		expect(await dropdownOptions(page)).toEqual([
			'Carry weight',
			'Stamina',
			'Radiation buildup',
		])
		expect(await storedFavoriteKeys(page)).toEqual([`effect:${CARRY}`])
		// Not selected: list unfiltered and trigger keeps its placeholder.
		expect(await listNames(dialog)).toHaveLength(5)
		await expect(
			dialog.getByRole('button', { name: 'Effects', exact: true })
		).toBeVisible()

		// Keyboard: focus the star of the first option and toggle with Enter/Space.
		await star(page, 'Carry weight').focus()
		await page.keyboard.press('Enter')
		await expect(star(page, 'Carry weight')).toHaveAttribute(
			'aria-pressed',
			'false'
		)
		await page.keyboard.press('Space')
		await expect(star(page, 'Carry weight')).toHaveAttribute(
			'aria-pressed',
			'true'
		)
		expect(await storedFavoriteKeys(page)).toEqual([`effect:${CARRY}`])
		expect(await listNames(dialog)).toHaveLength(5)
		await expect(
			dialog.getByRole('button', { name: 'Effects', exact: true })
		).toBeVisible()

		await page.reload()
		dialog = await openFullBoostDialog(page)
		await openCombobox(page, dialog, 'Effects')
		expect(await dropdownOptions(page)).toEqual([
			'Carry weight',
			'Stamina',
			'Radiation buildup',
		])
		await expect(star(page, 'Carry weight')).toHaveAttribute(
			'aria-pressed',
			'true'
		)
	})
})
