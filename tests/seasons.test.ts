import { expect, test } from 'bun:test'
import type { UnoSeason } from '@/types/uno/uno.type'
import {
	buildSeasonTimeline,
	type SeasonEntry,
} from '@/views/uno/components/seasons/seasons.utils'

function season(id: string, period: string[], isCurrent = false): UnoSeason {
	return {
		id,
		title: `seasons.${id}.title`,
		period,
		status: null,
		isCurrent,
	}
}

function ids(entries: SeasonEntry[]) {
	return entries.map((entry) => entry.id)
}

test('puts the current season first and sorts the rest by start descending', () => {
	const result = buildSeasonTimeline([
		season('january', ['2023-01-01', '2023-01-31']),
		season('current', ['2023-04-01'], true),
		season('march', ['2023-02-01', '2023-03-31']),
	])

	expect(ids(result)).toEqual(['current', 'march', 'january'])
})

test('fills gaps between seasons with synthetic off-season entries', () => {
	const result = buildSeasonTimeline([
		season('january', ['2024-01-01', '2024-01-31']),
		season('march', ['2024-03-01', '2024-03-31']),
	])

	expect(ids(result)).toEqual(['march', 'offseason-2024-02-01', 'january'])

	const interSeason = result[1]
	expect(interSeason.isInterSeason).toBe(true)
	expect(interSeason.title).toBe('seasons.interSeason.title')
	expect(interSeason.period).toEqual(['2024-02-01', '2024-02-29'])
})

test('does not add off-season entries for contiguous periods', () => {
	const result = buildSeasonTimeline([
		season('january', ['2024-01-01', '2024-01-31']),
		season('february', ['2024-02-01', '2024-02-29']),
		season('march', ['2024-03-01', '2024-03-31']),
	])

	expect(result.every((entry) => !entry.isInterSeason)).toBe(true)
})

test('an unknown end date does not hide later gaps', () => {
	const result = buildSeasonTimeline([
		season('january', ['2024-01-01']),
		season('march', ['2024-03-01', '2024-03-31']),
		season('may', ['2024-05-01', '2024-05-31']),
	])

	const offSeasons = result.filter((entry) => entry.isInterSeason)
	expect(offSeasons).toHaveLength(1)
	expect(offSeasons[0].period).toEqual(['2024-04-01', '2024-04-30'])
})
