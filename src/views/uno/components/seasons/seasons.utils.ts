import type { UnoSeason } from '@/types/uno/uno.type'

const DAY_MS = 24 * 60 * 60 * 1000

export interface SeasonEntry extends UnoSeason {
	isInterSeason?: boolean
}

interface ParsedSeason {
	season: SeasonEntry
	start: number
	end: number | null
}

function parseDate(value: string | undefined): number | null {
	if (!value) return null
	const time = Date.parse(value)
	return Number.isNaN(time) ? null : time
}

function toIsoDate(time: number) {
	return new Date(time).toISOString().slice(0, 10)
}

function parseSeason(season: SeasonEntry): ParsedSeason | null {
	const start = parseDate(season.period[0])
	if (start === null) return null
	const parsedEnd = parseDate(season.period[1])
	return {
		season,
		start,
		end: parsedEnd,
	}
}

function buildInterSeasons(entries: ParsedSeason[]): SeasonEntry[] {
	const result: SeasonEntry[] = []
	let previousEnd: number | null = null

	for (const entry of entries) {
		if (previousEnd !== null && entry.start - previousEnd > DAY_MS) {
			const start = previousEnd + DAY_MS
			const end = entry.start - DAY_MS
			result.push({
				id: `offseason-${toIsoDate(start)}`,
				title: 'seasons.interSeason.title',
				period: [toIsoDate(start), toIsoDate(end)],
				status: null,
				isCurrent: false,
				isInterSeason: true,
			})
		}

		previousEnd =
			entry.end === null
				? null
				: previousEnd === null
					? entry.end
					: Math.max(previousEnd, entry.end)
	}

	return result
}

export function buildSeasonTimeline(items: UnoSeason[]): SeasonEntry[] {
	const parsed = items
		.map((season) => parseSeason(season))
		.filter((entry): entry is ParsedSeason => entry !== null)
		.sort((left, right) => left.start - right.start)

	const all: SeasonEntry[] = [...items, ...buildInterSeasons(parsed)]

	return all.sort((left, right) => {
		if (left.isCurrent !== right.isCurrent) return left.isCurrent ? -1 : 1
		const leftStart = parseDate(left.period[0]) ?? 0
		const rightStart = parseDate(right.period[0]) ?? 0
		return rightStart - leftStart
	})
}
