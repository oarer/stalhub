import { describe, expect, test } from 'bun:test'
import en from '../src/locales/commissions/en.json'
import es from '../src/locales/commissions/es.json'
import fr from '../src/locales/commissions/fr.json'
import ko from '../src/locales/commissions/ko.json'
import ru from '../src/locales/commissions/ru.json'
import { safeArtistReturn } from '../src/services/auth/return-to'
import { parseCommissionMoney } from '../src/types/commission.type'

function keys(value: object, path = ''): string[] {
	return Object.entries(value)
		.flatMap(([key, entry]) =>
			typeof entry === 'object' && entry !== null
				? keys(entry, `${path}${key}.`)
				: [`${path}${key}`]
		)
		.sort()
}

describe('commissions', () => {
	test('money parser uses exact minor units, supports comma, rejects rounding and unsafe values', () => {
		expect(parseCommissionMoney('100.01')).toBe(10001)
		expect(parseCommissionMoney('49,99')).toBe(4999)
		expect(parseCommissionMoney('1')).toBe(100)
		expect(parseCommissionMoney('0.01')).toBe(1)
		for (const value of [
			'',
			'-1',
			'0',
			'1.001',
			'Infinity',
			'1e3',
			'1000001',
			'0x10',
			'12.',
		])
			expect(parseCommissionMoney(value)).toBeNull()
	})
	test('five locales contain the same nonempty translation keys', () => {
		for (const locale of [ru, es, fr, ko])
			expect(keys(locale)).toEqual(keys(en))
		for (const locale of [en, ru, es, fr, ko])
			expect(JSON.stringify(locale)).not.toContain(':""')
	})
	test('post-login artist return cannot redirect to another origin or arbitrary route', () => {
		expect(safeArtistReturn('/artists/test_artist')).toBe(
			'/artists/test_artist'
		)
		for (const path of [
			null,
			'https://evil.invalid',
			'//evil.invalid',
			'/artists/../admin',
			'/me',
			'/artists/a?next=//evil.invalid',
			'/artists/test#fragment',
			'/artists/a\\b',
		])
			expect(safeArtistReturn(path)).toBeNull()
	})
})
