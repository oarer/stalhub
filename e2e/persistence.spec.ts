import { randomUUID } from 'node:crypto'
import {
	apiURL,
	expect,
	itemID,
	itemName,
	loginHTTP,
	loginUI,
	other,
	readTier,
	test,
} from './fixtures'

test('UI login, tier creation with shared picker, persisted public view, edit, delete and logout', async ({
	page,
	playwright,
}) => {
	test.setTimeout(240_000)
	const title = `Browser persistence ${randomUUID()}`
	const editedTitle = `${title} edited`
	let id: string | undefined
	await loginUI(page)
	const ownerRequest = page.context().request
	const guest = await playwright.request.newContext()
	try {
		await page.goto('/me/tierlists')
		await page
			.getByRole('link', { name: 'Create tier list', exact: true })
			.click()
		await expect(
			page.getByRole('heading', { name: 'New tier list', exact: true })
		).toBeVisible()
		await page.getByLabel('Title', { exact: true }).fill(title)
		await page
			.getByLabel('Description', { exact: true })
			.fill('Created through the real browser and saved to PostgreSQL')
		await page
			.getByRole('button', { name: 'Add item', exact: true })
			.click()
		const picker = page.getByRole('dialog')
		await expect(picker).toBeVisible()
		await picker.getByLabel('Search items', { exact: true }).fill(itemName)
		await picker.getByText(itemName, { exact: true }).click()
		await picker
			.getByRole('button', { name: 'Select', exact: true })
			.click()
		await expect(picker).not.toBeVisible()
		await expect(page.getByText(itemName, { exact: true })).toBeVisible()
		const createdResponse = page.waitForResponse(
			(r) =>
				r.url() === `${apiURL}/api/v1/tier-lists` &&
				r.request().method() === 'POST'
		)
		await page.getByRole('button', { name: 'Save', exact: true }).click()
		const created = await createdResponse
		expect(created.ok(), await created.text()).toBeTruthy()
		const record = await created.json()
		id = record.id
		expect(record.external_id).toBeTruthy()
		await expect(page).toHaveURL(`/tierlists/${record.external_id}`)
		await expect(
			page.getByRole('heading', { level: 1, name: title, exact: true })
		).toBeVisible()
		const publicRecord = await readTier(guest, record.external_id)
		expect(publicRecord.title).toBe(title)
		expect(publicRecord.description).toBe(
			'Created through the real browser and saved to PostgreSQL'
		)
		expect(publicRecord.entries).toHaveLength(1)
		expect(publicRecord.entries[0]).toMatchObject({
			item_id: itemID,
			rank: 'D',
			position: 0,
		})
		await page.reload()
		await expect(
			page.getByRole('heading', { level: 1, name: title, exact: true })
		).toBeVisible()
		await expect(
			page
				.getByText(itemName, { exact: true })
				.filter({ visible: true })
				.first()
		).toBeVisible()
		await page.goto('/me/tierlists')
		await page
			.getByRole('link')
			.filter({
				has: page.getByRole('heading', { name: title, exact: true }),
			})
			.click()
		await page.getByRole('link', { name: 'Edit', exact: true }).click()
		await expect(page.getByLabel('Title', { exact: true })).toHaveValue(
			title
		)
		await page.getByLabel('Title', { exact: true }).fill(editedTitle)
		const updatedResponse = page.waitForResponse(
			(r) =>
				r.url().startsWith(`${apiURL}/api/v1/tier-lists/`) &&
				r.request().method() === 'PATCH'
		)
		await page.getByRole('button', { name: 'Save', exact: true }).click()
		expect((await updatedResponse).ok()).toBeTruthy()
		await expect(
			page.getByRole('heading', {
				level: 1,
				name: editedTitle,
				exact: true,
			})
		).toBeVisible()
		await page.reload()
		await expect(
			page.getByRole('heading', {
				level: 1,
				name: editedTitle,
				exact: true,
			})
		).toBeVisible()
		const updated = await readTier(guest, record.external_id)
		expect(updated.title).toBe(editedTitle)
		expect(updated.entries).toHaveLength(1)
		expect(updated.entries[0]).toMatchObject({
			item_id: itemID,
			rank: 'D',
			position: 0,
		})
		// Existing icon-only delete button lacks a label. Scope to the exact Edit action group.
		const deleteButton = page
			.getByRole('link', { name: 'Edit', exact: true })
			.locator('..')
			.getByRole('button', { name: '', exact: true })
		const deletedResponse = page.waitForResponse(
			(r) =>
				r.url() === `${apiURL}/api/v1/tier-lists/${id}` &&
				r.request().method() === 'DELETE'
		)
		await deleteButton.click()
		expect((await deletedResponse).ok()).toBeTruthy()
		await expect(page).toHaveURL('/tierlists')
		const deleted = await guest.get(
			`${apiURL}/api/v1/tier-lists/${record.external_id}`
		)
		expect(await deleted.text()).toBe('') // Existing route returns empty HTTP 200 for missing records.
		const mine = await ownerRequest.get(`${apiURL}/api/v1/tier-lists/mine`)
		expect(mine.ok()).toBeTruthy()
		expect(
			(await mine.json()).data.some(
				(tier: { id: string }) => tier.id === id
			)
		).toBe(false)
		id = undefined
		await page
			.locator('a[href="/me"]')
			.filter({ has: page.getByRole('img') })
			.first()
			.hover()
		const logoutResponse = page.waitForResponse(
			(r) =>
				r.url() === `${apiURL}/api/v1/users/@me/sessions/all` &&
				r.request().method() === 'DELETE'
		)
		await page.getByRole('button', { name: 'Log out', exact: true }).click()
		expect((await logoutResponse).ok()).toBeTruthy()
		await expect(page).toHaveURL('/auth')
		expect(
			(await ownerRequest.get(`${apiURL}/api/v1/users/@me`)).status()
		).toBe(401)
	} finally {
		if (id) await ownerRequest.delete(`${apiURL}/api/v1/tier-lists/${id}`)
		await guest.dispose()
	}
})

test('real cookie sessions enforce guest writes and other-owner boundaries without changing persisted data', async ({
	playwright,
	page,
}) => {
	const ownerRequest = await playwright.request.newContext()
	const otherRequest = await playwright.request.newContext()
	const guest = await playwright.request.newContext()
	let id: string | undefined
	try {
		const ownerUser = await loginHTTP(ownerRequest)
		const otherUser = await loginHTTP(otherRequest, other)
		expect(ownerUser.id).not.toBe(otherUser.id)
		const payload = {
			title: `Ownership ${randomUUID()}`,
			description: 'Must survive forbidden requests',
			item_kind: 'WEAPON',
			is_public: true,
			entries: [{ item_id: itemID, rank: 'A', position: 0 }],
		}
		expect(
			(
				await guest.post(`${apiURL}/api/v1/tier-lists`, {
					data: payload,
				})
			).status()
		).toBe(401)
		expect(
			(await guest.get(`${apiURL}/api/v1/tier-lists/mine`)).status()
		).toBe(401)
		const created = await ownerRequest.post(`${apiURL}/api/v1/tier-lists`, {
			data: payload,
		})
		expect(created.ok(), await created.text()).toBeTruthy()
		const record = await created.json()
		id = record.id
		for (const [request, allowed] of [
			[guest, [401]],
			[otherRequest, [403, 404]],
		] as const) {
			expect(allowed).toContain(
				(
					await request.patch(`${apiURL}/api/v1/tier-lists/${id}`, {
						data: { title: 'Forbidden overwrite', entries: [] },
					})
				).status()
			)
			expect(allowed).toContain(
				(
					await request.delete(`${apiURL}/api/v1/tier-lists/${id}`)
				).status()
			)
			const unchanged = await readTier(ownerRequest, id!)
			expect(unchanged.title).toBe(payload.title)
			expect(unchanged.entries).toHaveLength(1)
			expect(unchanged.entries[0]).toMatchObject(payload.entries[0])
			expect(unchanged.author.id).toBe(ownerUser.id)
		}
		const otherMine = await otherRequest.get(
			`${apiURL}/api/v1/tier-lists/mine`
		)
		expect(otherMine.ok()).toBeTruthy()
		expect(
			(await otherMine.json()).data.some(
				(tier: { id: string }) => tier.id === id
			)
		).toBe(false)
		await page.goto(`/tierlists/${record.external_id}`)
		await expect(
			page.getByRole('heading', {
				level: 1,
				name: payload.title,
				exact: true,
			})
		).toBeVisible()
		await expect(
			page.getByRole('link', { name: 'Edit', exact: true })
		).toHaveCount(0)
		expect(
			(
				await guest.get(
					`${apiURL}/api/v1/tier-lists/${record.external_id}`
				)
			).status()
		).toBe(200)
		expect(
			(
				await ownerRequest.delete(`${apiURL}/api/v1/tier-lists/${id}`)
			).ok()
		).toBeTruthy()
		const deleted = await guest.get(
			`${apiURL}/api/v1/tier-lists/${record.external_id}`
		)
		expect(await deleted.text()).toBe('') // Existing route returns empty HTTP 200 for missing records.
		id = undefined
	} finally {
		if (id) await ownerRequest.delete(`${apiURL}/api/v1/tier-lists/${id}`)
		await Promise.all([
			ownerRequest.dispose(),
			otherRequest.dispose(),
			guest.dispose(),
		])
	}
})
