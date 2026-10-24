import type { Locale } from '@/types/item.type'
import type {
	PlayerResponse,
	Stat,
	StatCategory,
	StatType,
} from '@/types/player.type'
import { messageToString } from '@/utils/itemUtils'
import { DB_STATS, DB_STATS_BY_ID } from '@/utils/player/StatParse'
import { formatStatValue, type PlayerStatTranslate } from '../playerStatFormat'
import { enrichPlayerStats, type PlayerStat } from '../Stats.utils'
import { CATEGORY_ORDER } from '../statCategories'
import {
	getPlayerStatDirection,
	type PlayerComparisonDirection,
} from './playerComparisonDirection'

export type PlayerComparisonValue = {
	text: string
	numeric: number | null
}

export type PlayerComparisonRow = {
	key: string
	label: string
	statKey: string
	direction: PlayerComparisonDirection
	values: (PlayerComparisonValue | null)[]
	best: number[]
	worst: number[]
	changed: boolean
}

export type PlayerComparisonSection = {
	key: string
	title: string
	rows: PlayerComparisonRow[]
}

const identityTranslate: PlayerStatTranslate = (key) => key

const numericValue = (value: Stat['value']): number | null => {
	const numeric = Number(value)
	return Number.isFinite(numeric) ? numeric : null
}

const toComparisonValue = (
	stat: PlayerStat,
	locale: Locale,
	t: PlayerStatTranslate
): PlayerComparisonValue => ({
	text: formatStatValue(stat, locale, t),
	numeric:
		stat.type === 'DATE' || !Number.isFinite(Number(stat.value))
			? null
			: numericValue(stat.value),
})

const getBestWorst = (
	values: (PlayerComparisonValue | null)[],
	direction: PlayerComparisonDirection
): { best: number[]; worst: number[] } => {
	if (!direction) return { best: [], worst: [] }

	const presentValues = values.filter(
		(value): value is PlayerComparisonValue => value !== null
	)
	if (new Set(presentValues.map((value) => value.text)).size < 2)
		return { best: [], worst: [] }

	const numeric = values.map((value) => value?.numeric ?? null)
	const present = numeric.filter((value): value is number => value !== null)
	if (present.length < 2 || new Set(present).size < 2)
		return { best: [], worst: [] }

	const bestValue =
		direction === 'higher' ? Math.max(...present) : Math.min(...present)
	const worstValue =
		direction === 'higher' ? Math.min(...present) : Math.max(...present)

	const best: number[] = []
	const worst: number[] = []

	for (const [index, value] of numeric.entries()) {
		if (value === bestValue) best.push(index)
		if (value === worstValue) worst.push(index)
	}

	return { best, worst }
}

const changedRow = (values: (PlayerComparisonValue | null)[]): boolean => {
	const present = values.filter(
		(value): value is PlayerComparisonValue => value !== null
	)
	return (
		present.length < values.length ||
		present.some((value) => value.text !== present[0]?.text)
	)
}

const makeRow = ({
	key,
	label,
	statKey,
	direction,
	values,
}: {
	key: string
	label: string
	statKey: string
	direction: PlayerComparisonDirection
	values: (PlayerComparisonValue | null)[]
}): PlayerComparisonRow => ({
	key,
	label,
	statKey,
	direction,
	values,
	...getBestWorst(values, direction),
	changed: changedRow(values),
})

const ratio = (
	stats: Map<string, PlayerStat>,
	numeratorId: string,
	denominatorId: string
): PlayerComparisonValue | null => {
	const numerator = stats.get(numeratorId)
	const denominator = stats.get(denominatorId)
	if (!numerator && !denominator) return null

	const n = Number(numerator?.value ?? 0)
	const d = Number(denominator?.value ?? 0)
	if (!Number.isFinite(n) || !Number.isFinite(d)) return null

	if (d > 0) {
		const value = n / d
		return { text: value.toFixed(2), numeric: value }
	}

	if (n > 0) return { text: n.toFixed(2), numeric: n }
	return null
}

const percent = (
	stats: Map<string, PlayerStat>,
	numeratorId: string,
	denominatorId: string
): PlayerComparisonValue | null => {
	const numerator = Number(stats.get(numeratorId)?.value ?? 0)
	const denominator = Number(stats.get(denominatorId)?.value ?? 0)
	if (!Number.isFinite(numerator) || !Number.isFinite(denominator))
		return null
	if (denominator <= 0) return null

	const value = (numerator / denominator) * 100
	return {
		text: `${value.toFixed(0)}%`,
		numeric: value,
	}
}

const buildSummarySection = (
	players: readonly Map<string, PlayerStat>[],
	t: PlayerStatTranslate
): PlayerComparisonSection | null => {
	const metrics: {
		key: string
		label: string
		getValue: (
			stats: Map<string, PlayerStat>
		) => PlayerComparisonValue | null
	}[] = [
		{
			key: 'kd',
			label: t('player.comparison.kd'),
			getValue: (stats) => ratio(stats, 'kil', 'bul-dea'),
		},
		{
			key: 'session-kd',
			label: t('player.comparison.sessionKd'),
			getValue: (stats) => ratio(stats, 'kills-bf', 'deaths-bf'),
		},
		{
			key: 'colosseum-kd',
			label: t('player.comparison.colosseumKd'),
			getValue: (stats) => ratio(stats, 'pres-kills', 'pres-deaths'),
		},
		{
			key: 'accuracy',
			label: t('player.comparison.accuracy'),
			getValue: (stats) => percent(stats, 'sho-hit', 'sho-fir'),
		},
		{
			key: 'headshot-accuracy',
			label: t('player.comparison.headshotAccuracy'),
			getValue: (stats) => percent(stats, 'sho-hea', 'sho-hit'),
		},
	]

	const rows: PlayerComparisonRow[] = []

	for (const metric of metrics) {
		const values = players.map((stats) => metric.getValue(stats))
		if (values.every((value) => value === null)) continue

		rows.push(
			makeRow({
				key: `summary:${metric.key}`,
				label: metric.label,
				statKey: metric.key,
				direction: 'higher',
				values,
			})
		)
	}

	if (rows.length === 0) return null

	return {
		key: 'summary',
		title: t('player.comparison.summary'),
		rows,
	}
}

const collectStatIds = (
	players: readonly Map<string, PlayerStat>[]
): string[] => {
	const ids: string[] = []
	const seen = new Set<string>()

	for (const meta of DB_STATS) {
		if (!players.some((stats) => stats.has(meta.id))) continue
		if (seen.has(meta.id)) continue
		seen.add(meta.id)
		ids.push(meta.id)
	}

	for (const stats of players) {
		for (const id of stats.keys()) {
			if (seen.has(id)) continue
			seen.add(id)
			ids.push(id)
		}
	}

	return ids
}

const getStatCategory = (stat: PlayerStat | undefined): StatCategory =>
	stat?.meta?.category ?? DB_STATS_BY_ID[stat?.id ?? '']?.category ?? 'NONE'

const getStatType = (stat: PlayerStat | undefined): StatType =>
	stat?.type ?? DB_STATS_BY_ID[stat?.id ?? '']?.type ?? 'INTEGER'

const getStatLabel = (stat: PlayerStat | undefined, locale: Locale): string =>
	messageToString(stat?.meta?.name, locale) ||
	messageToString(DB_STATS_BY_ID[stat?.id ?? '']?.name, locale) ||
	stat?.id ||
	''

export const buildPlayerComparisonSections = (
	players: readonly PlayerResponse[],
	locale: Locale,
	t: PlayerStatTranslate = identityTranslate
): PlayerComparisonSection[] => {
	if (players.length < 2) return []

	const enriched = players.map(
		(player) =>
			new Map(enrichPlayerStats(player.stats ?? []).map((s) => [s.id, s]))
	)

	const summary = buildSummarySection(enriched, t)
	const byCategory = new Map<StatCategory, PlayerComparisonRow[]>()
	const statIds = collectStatIds(enriched)

	for (const id of statIds) {
		const values = enriched.map((stats) => {
			const stat = stats.get(id)
			return stat ? toComparisonValue(stat, locale, t) : null
		})
		if (values.every((value) => value === null)) continue

		const firstStat = enriched
			.map((stats) => stats.get(id))
			.find((stat): stat is PlayerStat => !!stat)
		const category = getStatCategory(firstStat)
		const type = getStatType(firstStat)
		const row = makeRow({
			key: `stat:${id}`,
			label: getStatLabel(firstStat, locale) || id,
			statKey: id,
			direction: getPlayerStatDirection(id, type),
			values,
		})

		const rows = byCategory.get(category) ?? []
		rows.push(row)
		byCategory.set(category, rows)
	}

	const sections: PlayerComparisonSection[] = []
	if (summary) sections.push(summary)

	for (const category of CATEGORY_ORDER) {
		const rows = byCategory.get(category)
		if (!rows?.length) continue

		sections.push({
			key: category,
			title: t(`player.category.${category}`),
			rows,
		})
		byCategory.delete(category)
	}

	for (const [category, rows] of byCategory) {
		if (!rows.length) continue
		sections.push({
			key: category,
			title: t(`player.category.${category}`),
			rows,
		})
	}

	return sections
}

export const countPlayerComparisonDifferences = (
	sections: readonly PlayerComparisonSection[]
): number =>
	sections.reduce(
		(total, section) =>
			total + section.rows.filter((row) => row.changed).length,
		0
	)
