import { expect, test } from 'bun:test'
import { getSafeHref, isExternalHref } from '@/lib/safe-href'

test.each([
	'javascript:alert(1)',
	'data:text/html,<script>alert(1)</script>',
	'vbscript:msgbox(1)',
	'//evil.example/path',
])('rejects unsafe announcement href %s', (href) => {
	expect(getSafeHref(href)).toBeNull()
})

test('allows same-origin relative paths and safe external URLs', () => {
	expect(getSafeHref('/news/update')).toBe('/news/update')
	expect(getSafeHref('https://example.com/update')).toBe(
		'https://example.com/update'
	)
})

test('identifies external HTTP links', () => {
	expect(isExternalHref('https://example.com/update')).toBe(true)
	expect(isExternalHref('/news/update')).toBe(false)
})
