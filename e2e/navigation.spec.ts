import { expect, test } from './fixtures'

test('guest calculator changes a real computed result and browser navigation returns to public tiers', async ({
	page,
}) => {
	await page.goto('/tierlists')
	await expect(
		page.getByRole('heading', { level: 1, name: 'Tier Lists', exact: true })
	).toBeVisible()
	await page.goto('/calcs/dpi')
	await expect(
		page.getByRole('heading', {
			name: 'Sensitivity calculator',
			exact: true,
		})
	).toBeVisible()
	const result = page
		.getByText('Result', { exact: true })
		.locator('..')
		.locator('p')
	await expect(result).toHaveText('3.333333')
	await page.getByLabel('Sensitivity', { exact: true }).fill('2')
	await page.getByLabel('Sensitivity', { exact: true }).blur()
	await expect(result).toHaveText('6.666667')
	await page.goBack()
	await expect(page).toHaveURL('/tierlists')
	await expect(
		page.getByRole('heading', { level: 1, name: 'Tier Lists', exact: true })
	).toBeVisible()
})
