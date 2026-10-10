'use client'

import { getLocale } from '@/lib/getLocale'
import { decimalConfig } from '@/types/player.type'
import rawStats from '@/utils/player/stats.json'

export type StatValue = number | string

export interface StatMeta {
	id: string
	label: string
	category: string
	kind: string
}

interface RawStat {
	id: string
	category?: string
	type?: string
	name?: unknown
}

function extractLocalized(
	name: unknown,
	locale: string,
	fallback: string
): string {
	if (!name) return fallback
	if (typeof name === 'string') return name
	if (typeof name === 'object') {
		const o = name as Record<string, unknown>
		const lines = o['lines'] as Record<string, string> | undefined
		if (lines) {
			if (lines[locale]) return lines[locale]
			if (lines['en']) return lines['en']
			const first = Object.values(lines)[0]
			if (first) return first
		}
		if (typeof o[locale] === 'string') return o[locale] as string
		if (typeof o['ru'] === 'string') return o['ru'] as string
		const text = o['text']
		if (typeof text === 'string' && text) return text
	}
	return fallback
}

function prettifyId(id: string): string {
	return id.replace(/-/g, ' ')
}

const RAW_META = new Map<string, RawStat>()
for (const s of rawStats as RawStat[]) {
	if (!s?.id) continue
	RAW_META.set(s.id, s)
}

function buildMeta(id: string, locale: string): StatMeta {
	const raw = RAW_META.get(id)
	if (!raw) {
		return { id, label: prettifyId(id), category: 'OTHER', kind: 'INTEGER' }
	}
	return {
		id: raw.id,
		label: extractLocalized(raw.name, locale, prettifyId(raw.id)),
		category: raw.category ?? 'OTHER',
		kind: raw.type ?? 'INTEGER',
	}
}

export function getDerivedStatKey(id: string): string | null {
	if (id === 'kd') return 'personal.statKd'
	if (id === 'accuracy') return 'personal.statAccuracy'
	if (id === 'hs-rate') return 'personal.statHsRate'
	return null
}

export function getCategoryKey(cat: string): string {
	if (cat === 'DERIVED') return 'personal.derived'
	if (cat === 'OTHER') return 'player.category.NONE'
	return `player.category.${cat}`
}

export const CATEGORY_ORDER = [
	'DERIVED',
	'SURVIVAL',
	'COMBAT',
	'EXPLORATION',
	'ECONOMY',
	'HIDEOUT',
	'SESSION_MODES',
	'NONE',
	'OTHER',
]

export function getStatMeta(
	id: string,
	locale: string = getLocale()
): StatMeta {
	return buildMeta(id, locale)
}

export function getStatLabel(id: string, locale: string = getLocale()): string {
	if (id === 'kd') return 'K/D'
	if (id === 'accuracy') return 'Accuracy'
	if (id === 'hs-rate') return 'Headshots %'
	return buildMeta(id, locale).label
}

export function getStatKind(id: string): string {
	if (id === 'kd' || id === 'accuracy' || id === 'hs-rate') return 'DERIVED'
	return RAW_META.get(id)?.type ?? 'INTEGER'
}

const UNIT_LABELS: Record<string, Record<string, string>> = {
	ru: { km: 'км', kg: 'кг', unit: 'ед', meter: 'м', second: 'с', hours: 'ч' },
	en: { km: 'km', kg: 'kg', unit: 'u', meter: 'm', second: 's', hours: 'h' },
	es: {
		km: 'km',
		kg: 'kg',
		unit: 'uds',
		meter: 'm',
		second: 's',
		hours: 'h',
	},
	fr: { km: 'km', kg: 'kg', unit: 'u', meter: 'm', second: 's', hours: 'h' },
	ko: {
		km: 'km',
		kg: 'kg',
		unit: '개',
		meter: 'm',
		second: '초',
		hours: '시간',
	},
}

function unitLabel(unit: string, locale: string): string {
	return UNIT_LABELS[locale]?.[unit] ?? UNIT_LABELS['en']![unit] ?? unit
}

export function formatStatValue(
	id: string,
	value: StatValue,
	locale: string = getLocale()
): string {
	const num = typeof value === 'number' ? value : Number(value)
	if (!Number.isFinite(num)) return String(value ?? '—')
	const kind = getStatKind(id)
	if (id === 'kd') return num.toFixed(2)
	if (id === 'accuracy' || id === 'hs-rate')
		return `${(num * 100).toFixed(1)}%`
	switch (kind) {
		case 'INTEGER':
			return num.toLocaleString(locale)
		case 'DECIMAL': {
			const config = decimalConfig[id] ?? {
				divisor: 100000,
				precision: 2,
				unit: 'km',
			}
			const formatted = (num / config.divisor).toLocaleString(locale, {
				maximumFractionDigits: config.precision,
				minimumFractionDigits: config.precision,
			})
			return config.unit
				? `${formatted} ${unitLabel(config.unit, locale)}`
				: formatted
		}
		case 'DURATION': {
			const hours = num / (1000 * 60 * 60)
			return `${hours.toLocaleString(locale, { maximumFractionDigits: 1 })} ${unitLabel('hours', locale)}`
		}
		case 'DATE': {
			const date = new Date(value)
			return Number.isNaN(date.getTime())
				? String(value)
				: date.toLocaleDateString(locale)
		}
		default:
			return String(value)
	}
}

const PP_SUFFIX: Record<string, string> = {
	ru: ' п.п.',
	en: ' pp',
	es: ' pp',
	fr: ' pts',
	ko: ' pp',
}

export function formatDelta(
	id: string,
	delta: number,
	locale: string = getLocale()
): string {
	if (!Number.isFinite(delta) || delta === 0) return '±0'
	const sign = delta > 0 ? '+' : '−'
	const abs = Math.abs(delta)
	const kind = getStatKind(id)
	if (id === 'kd') return `${sign}${abs.toFixed(2)}`
	if (id === 'accuracy' || id === 'hs-rate')
		return `${sign}${(abs * 100).toFixed(1)}${PP_SUFFIX[locale] ?? PP_SUFFIX['en']}`
	if (kind === 'DURATION') {
		const hours = abs / (1000 * 60 * 60)
		return `${sign}${hours.toLocaleString(locale, { maximumFractionDigits: 1 })} ${unitLabel('hours', locale)}`
	}
	if (kind === 'DECIMAL') {
		const config = decimalConfig[id] ?? {
			divisor: 100000,
			precision: 2,
			unit: 'km',
		}
		const formatted = (abs / config.divisor).toLocaleString(locale, {
			maximumFractionDigits: config.precision,
			minimumFractionDigits: config.precision,
		})
		return config.unit
			? `${sign}${formatted} ${unitLabel(config.unit, locale)}`
			: `${sign}${formatted}`
	}
	return `${sign}${abs.toLocaleString(locale, { maximumFractionDigits: 0 })}`
}

export const KEY_STATS = [
	'kil',
	'dea',
	'kd',
	'sho-fir',
	'sho-hit',
	'accuracy',
	'que-fin',
	'pla-tim',
] as const

/** Компактный обзор: только 4 главные цифры */
export const OVERVIEW_STATS = ['kil', 'kd', 'accuracy', 'pla-tim'] as const

export interface SeriesPoint {
	t: string
	v: number
}

export function toNumber(v: number | string): number {
	const n = typeof v === 'number' ? v : Number(v)
	return Number.isFinite(n) ? n : 0
}

export function buildDerivedSeries(
	series: Record<string, SeriesPoint[]>
): Record<string, SeriesPoint[]> {
	const out: Record<string, SeriesPoint[]> = {}
	const byTime = new Map<string, Map<string, number>>()
	for (const [id, pts] of Object.entries(series)) {
		for (const p of pts) {
			if (!byTime.has(p.t)) byTime.set(p.t, new Map())
			byTime.get(p.t)!.set(id, p.v)
		}
	}
	const kd: SeriesPoint[] = []
	const acc: SeriesPoint[] = []
	const hs: SeriesPoint[] = []
	const times = [...byTime.keys()].sort()
	for (const t of times) {
		const m = byTime.get(t)!
		const kil = m.get('kil') ?? 0
		const dea = m.get('dea') ?? 0
		kd.push({ t, v: dea > 0 ? kil / dea : kil })
		const fir = m.get('sho-fir') ?? 0
		const hit = m.get('sho-hit') ?? 0
		const hea = m.get('sho-hea') ?? 0
		acc.push({ t, v: fir > 0 ? hit / fir : 0 })
		hs.push({ t, v: hit > 0 ? hea / hit : 0 })
	}
	out['kd'] = kd
	out['accuracy'] = acc
	out['hs-rate'] = hs
	return out
}

export function toDeltaPoints(points: SeriesPoint[]): SeriesPoint[] {
	return points.map((p, i) => ({
		t: p.t,
		v: i === 0 ? 0 : p.v - points[i - 1]!.v,
	}))
}
