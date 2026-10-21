import type { BrowserContext } from '@playwright/test'

const GREEN = '53C353'
const RED = 'C15252'

export const LONG_BOOST = 'item.effects.effect_type.long_time_medicine'
export const SHORT_BOOST = 'item.effects.effect_type.short_time_medicine'

export const STAMINA = 'stalker.artefact_properties.factor.stamina_bonus'
export const CARRY = 'stalker.artefact_properties.factor.max_weight_bonus'
export const RADIATION = 'stalker.artefact_properties.factor.radiation_bonus'
export const BLEEDING = 'stalker.artefact_properties.factor.bleeding_bonus'

const statNames: Record<string, string> = {
	[STAMINA]: 'Stamina',
	[CARRY]: 'Carry weight',
	[RADIATION]: 'Radiation buildup',
	[BLEEDING]: 'Bleeding',
}

const pixel = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',
	'base64'
)

function message(key: string, en: string) {
	return {
		type: 'translation',
		key,
		args: {},
		lines: { en, ru: en, es: en, fr: en, ko: en },
	}
}

function stat(key: string, value: number, negative = false) {
	const color = negative ? RED : GREEN
	return {
		type: 'numeric',
		name: message(key, statNames[key]),
		value,
		formatted: {
			value: { en: `${value}%`, ru: `${value}%` },
			nameColor: color,
			valueColor: color,
		},
	}
}

function listBlock(elements: unknown[]) {
	return { type: 'list', title: { type: 'text', text: '' }, elements }
}

type Effect = [key: string, value: number, negative?: boolean]

function consumable(
	id: string,
	name: string,
	boostKey: string,
	effects: Effect[]
) {
	return {
		id,
		category: 'supply/medicine',
		name: message(`item.e2e.${id}.name`, name),
		color: 'RANK_MASTER',
		status: { state: 'NON_DROP' },
		infoBlocks: [
			listBlock([]),
			listBlock([]),
			listBlock([]),
			{},
			listBlock([
				{
					type: 'key-value',
					key: message(
						'stalker.tooltip.medicine.info.effect_type',
						'Purpose'
					),
					value: message(boostKey, 'Boost'),
				},
			]),
			listBlock(
				effects.map(([key, value, negative]) =>
					stat(key, value, negative)
				)
			),
		],
	}
}

function artifact(id: string, name: string, effects: Effect[]) {
	return {
		id,
		category: 'artefact/e2e',
		name: message(`item.e2e.${id}.name`, name),
		color: 'RANK_MASTER',
		status: { state: 'NON_DROP' },
		infoBlocks: [
			listBlock(
				effects.map(([key, value, negative]) =>
					stat(key, value, negative)
				)
			),
		],
	}
}

export const consumableNames = {
	alpha: 'Alpha Tonic',
	bravo: 'Bravo Highly Concentrated Tonic',
	charlie: 'Charlie Tonic',
	delta: 'Delta Tonic',
	echo: 'Echo Tonic',
	foxtrot: 'Foxtrot Stim',
}

// Stamina buff (desc): bravo 30, charlie 20, delta 20, alpha 10.
// Radiation debuff (asc): charlie 2, delta 5, bravo 8.
// Bravo has the longest name so a relevance-sorted search would not keep it first.
const consumables = [
	consumable('e2e-alpha', consumableNames.alpha, LONG_BOOST, [
		[STAMINA, 10],
		[CARRY, 40],
	]),
	consumable('e2e-bravo', consumableNames.bravo, LONG_BOOST, [
		[STAMINA, 30],
		[CARRY, 5],
		[RADIATION, 8, true],
	]),
	consumable('e2e-charlie', consumableNames.charlie, LONG_BOOST, [
		[STAMINA, 20],
		[RADIATION, 2, true],
	]),
	consumable('e2e-delta', consumableNames.delta, LONG_BOOST, [
		[STAMINA, 20],
		[RADIATION, 5, true],
	]),
	consumable('e2e-echo', consumableNames.echo, LONG_BOOST, [[CARRY, 25]]),
	consumable('e2e-foxtrot', consumableNames.foxtrot, SHORT_BOOST, [
		[BLEEDING, 50],
	]),
]

const artefacts = [
	artifact('e2e-art-low', 'Low Art', [
		[STAMINA, 5],
		[RADIATION, 9, true],
	]),
	artifact('e2e-art-high', 'High Art', [
		[STAMINA, 15],
		[RADIATION, 1, true],
	]),
]

const listings: Record<string, unknown[]> = {
	'/db/listing/consumables.json': consumables,
	'/db/listing/artefact.json': artefacts,
}

export type ExternalCapture = { unknown: string[] }

export async function installBuildFixtures(
	context: BrowserContext,
	origin: string,
	capture: ExternalCapture
) {
	await context.addCookies([{ name: 'lang', value: 'en', url: origin }])
	await context.route('**/*', async (route) => {
		const url = new URL(route.request().url())

		if (url.origin === origin) {
			if (
				url.pathname === '/_next/image' &&
				new URL(url.searchParams.get('url') ?? origin, origin)
					.hostname === 'cdn.stalhub.dev'
			) {
				return route.fulfill({ contentType: 'image/png', body: pixel })
			}
			return route.continue()
		}
		if (['data:', 'blob:', 'about:'].includes(url.protocol)) {
			return route.continue()
		}
		// No backend runs in these frontend-only tests: behave as a guest.
		if (
			url.pathname === '/api/v1/users/@me' ||
			url.pathname === '/api/v1/auth/refresh'
		) {
			return route.fulfill({
				status: 401,
				json: { message: 'unauthorized' },
			})
		}
		if (url.pathname === '/api/v1/articles/public') {
			return route.fulfill({
				json: { data: [], items: [], total: 0, page: 1, take: 20 },
			})
		}
		if (
			url.hostname === 'api.github.com' &&
			url.pathname === '/repos/oarer/sc-db/commits'
		) {
			return route.fulfill({
				json: [
					{
						sha: 'e2e-fixture-version',
						commit: { committer: { date: '2026-01-01T00:00:00Z' } },
					},
				],
			})
		}
		if (url.hostname === 'umami.stalhub.dev') {
			return route.fulfill({
				contentType: 'application/javascript',
				body: '',
			})
		}
		if (url.hostname === 'cdn.stalhub.dev') {
			const path = url.pathname.replace(/\/+/g, '/')
			const listing = listings[path]
			if (listing) return route.fulfill({ json: listing })
			if (path.endsWith('/hound.glb')) {
				return route.fulfill({
					contentType: 'model/gltf-binary',
					path: 'public/models/steve.glb',
				})
			}
			if (path.endsWith('/bear6.glb')) {
				return route.fulfill({
					json: {
						asset: { version: '2.0' },
						scene: 0,
						scenes: [{ nodes: [] }],
					},
				})
			}
			if (path.endsWith('.dds')) {
				const dds = Buffer.alloc(136)
				for (const [offset, value] of [
					[0, 0x20534444],
					[4, 124],
					[8, 0x81007],
					[12, 4],
					[16, 4],
					[20, 8],
					[28, 1],
					[76, 32],
					[80, 4],
					[84, 0x31545844],
					[108, 0x1000],
				])
					dds.writeUInt32LE(value, offset)
				dds.writeUInt16LE(0xffff, 128)
				return route.fulfill({
					contentType: 'application/octet-stream',
					body: dds,
				})
			}
			if (/\.(png|jpg|webp|svg)$/.test(path)) {
				return route.fulfill({ contentType: 'image/png', body: pixel })
			}
			// Frontend-only fixture: other CDN requests pass through unchanged.
			return route.continue()
		}
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
		capture.unknown.push(url.href)
		return route.abort('blockedbyclient')
	})
}
