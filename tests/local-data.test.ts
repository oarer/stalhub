import { expect, test } from 'bun:test'
import {
	buildImportUrl,
	parseImportUrl,
	encodeLocalData,
	decodeImportToken,
	IMPORT_MAX_TOKEN_LENGTH,
	collectLocalDataEntries,
} from '@/lib/localData'

function jsonToken(value: unknown): string {
	return `j1.${Buffer.from(JSON.stringify(value)).toString('base64url')}`
}

test('UTF-8 settings round-trip using native compression', async () => {
	const data = { builds: 'Сборка 🧪', settings: '{"theme":"dark"}' }
	const token = await encodeLocalData(data)
	expect(token.startsWith('d1.')).toBe(true)
	expect(parseImportUrl(buildImportUrl(token))).toBe(token)
	expect(await decodeImportToken(token)).toEqual({ ok: true, data })
})

test('plain JSON legacy token decodes and filters invalid keys and values', async () => {
	expect(
		await decodeImportToken(
			jsonToken({
				v: 1,
				data: {
					valid: 'yes',
					'': 'empty',
					['x'.repeat(257)]: 'long',
					number: 2,
					object: {},
				},
			})
		)
	).toEqual({ ok: true, data: { valid: 'yes' } })
})

test.each(['', 'j1', '.abc', 'j1.', 'v2.YQ', 'j1.!!!', 'j1.YQ'])(
	'malformed token %s is invalid',
	async (token) => {
		expect(await decodeImportToken(token)).toEqual({
			ok: false,
			reason: 'invalid',
		})
	}
)

test('bad compressed stream reports unsupported rather than throwing', async () => {
	expect(await decodeImportToken('d1.YQ')).toEqual({
		ok: false,
		reason: 'unsupported',
	})
})

test.each([
	{ payload: null },
	{ payload: [] },
	{ payload: { v: 2, data: { a: 'b' } } },
	{ payload: { v: 1, data: null } },
])('invalid payload schema %# is rejected', async ({ payload }) => {
	expect(await decodeImportToken(jsonToken(payload))).toEqual({
		ok: false,
		reason: 'invalid',
	})
})

test('empty usable data has a distinct failure reason', async () => {
	expect(
		await decodeImportToken(jsonToken({ v: 1, data: { n: 4 } }))
	).toEqual({ ok: false, reason: 'empty' })
})

test.each([
	'https://import/j1.YQ',
	'stalhub://wrong/j1.YQ',
	'stalhub://user@import/j1.YQ',
	'stalhub://import:12/j1.YQ',
	'stalhub://import/j1.YQ#fragment',
	'stalhub://import/a/b',
	'stalhub://import/a%20b',
	'stalhub://import/',
])('rejects unsafe import URL %s', (url) => {
	expect(parseImportUrl(url)).toBeNull()
})

test('token length boundary and non-string URLs', () => {
	const token = 'a'.repeat(IMPORT_MAX_TOKEN_LENGTH)
	expect(parseImportUrl(buildImportUrl(token))).toBe(token)
	expect(parseImportUrl(buildImportUrl(`${token}a`))).toBeNull()
	expect(parseImportUrl({})).toBeNull()
})

test('SSR collection does not require browser storage', () => {
	expect(collectLocalDataEntries()).toEqual({})
})
