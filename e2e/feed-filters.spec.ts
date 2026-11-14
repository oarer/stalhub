import { expect, test } from '@playwright/test'

test.describe('Feed filters', () => {
	test('separates user posts from forum posts', async ({ page }) => {
		await page.goto('http://localhost:3000/feed')
		await page.waitForLoadState('networkidle')

		// Проверяем наличие всех чекбоксов фильтров
		const filters = ['Сборки', 'Тир-листы', 'Посты', 'Форум', 'Арты']
		for (const filter of filters) {
			await expect(
				page.locator('label', { hasText: filter })
			).toBeVisible()
		}

		// Снимаем все галочки кроме "Посты"
		await page.locator('label:has-text("Сборки") input').uncheck()
		await page.locator('label:has-text("Тир-листы") input').uncheck()
		await page.locator('label:has-text("Арты") input').uncheck()
		await page.locator('label:has-text("Форум") input').uncheck()
		await page.waitForLoadState('networkidle')

		// Проверяем URL-параметры
		expect(page.url()).toContain('types=post')
		expect(page.url()).not.toContain('types=eforum')

		// Снимаем "Посты" и оставляем только "Форум"
		await page.locator('label:has-text("Посты") input').uncheck()
		await page.locator('label:has-text("Форум") input').check()
		await page.waitForLoadState('networkidle')

		// Проверяем URL-параметры
		expect(page.url()).toContain('types=eforum')
		expect(page.url()).not.toContain('types=post')

		// Включаем оба типа
		await page.locator('label:has-text("Посты") input').check()
		await page.waitForLoadState('networkidle')

		// Проверяем, что оба параметра присутствуют
		const url = page.url()
		expect(url).toContain('types=post')
		expect(url).toContain('types=eforum')
	})

	test('all filters work together', async ({ page }) => {
		await page.goto('http://localhost:3000/feed')
		await page.waitForLoadState('networkidle')

		// Снимаем все галочки
		await page.locator('label:has-text("Сборки") input').uncheck()
		await page.locator('label:has-text("Тир-листы") input').uncheck()
		await page.locator('label:has-text("Посты") input').uncheck()
		await page.locator('label:has-text("Форум") input').uncheck()
		await page.locator('label:has-text("Арты") input').uncheck()
		await page.waitForLoadState('networkidle')

		// Должно появиться сообщение о пустом выборе
		await expect(
			page.locator('text=Выберите хотя бы один тип контента')
		).toBeVisible()

		// Включаем только сборки и арты
		await page.locator('label:has-text("Сборки") input').check()
		await page.locator('label:has-text("Арты") input').check()
		await page.waitForLoadState('networkidle')

		// Проверяем URL
		const url = page.url()
		expect(url).toContain('types=build')
		expect(url).toContain('types=art')
		expect(url).not.toContain('types=post')
		expect(url).not.toContain('types=eforum')
	})
})
