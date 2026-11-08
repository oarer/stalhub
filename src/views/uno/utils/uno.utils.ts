import type { Alliance } from '@/types/player.type'
import { FACTION_ALIASES, MAP_ALIASES, UNO_RANK_COLORS } from './uno.const'

export function normalizeUnoFaction(
	value: string | null | undefined
): Alliance | null {
	if (!value) return null
	const key = value.trim().toLowerCase().split('.').pop() ?? ''
	return FACTION_ALIASES[key] ?? null
}

export function unoRankColor(rank: string | null | undefined) {
	if (!rank) return 'text-foreground'
	return UNO_RANK_COLORS[rank.trim().toUpperCase()] ?? 'text-foreground'
}

export function normalizeUnoMap(value: string | null | undefined) {
	if (!value) return null
	const key = value
		.trim()
		.toLowerCase()
		.replace(/_\d+x\d+$/, '')
	return MAP_ALIASES[key] ?? null
}

export function formatUnoValue(
	value: number | string | null,
	locale: string
): string {
	if (value === null || value === '') return '—'
	if (typeof value === 'number')
		return new Intl.NumberFormat(locale).format(value)
	return value
}

export function formatUnoMskDateTime(
	value: string | null | undefined,
	locale: string
): string {
	if (!value) return '—'
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return '—'
	return new Intl.DateTimeFormat(locale, {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		timeZone: 'Europe/Moscow',
	}).format(date)
}

export function formatUnoPercent(
	value: number | string | null | undefined,
	locale: string
): string {
	if (value === null || value === undefined || value === '') return '—'
	const ratio = typeof value === 'number' ? value : Number(value)
	if (!Number.isFinite(ratio)) return '—'
	return `${new Intl.NumberFormat(locale).format(ratio * 100)}%`
}
