import { expect, test } from 'bun:test'
import type { UnoHistoryItem, UnoHistoryReward } from '@/types/uno/uno.type'
import {
	buildHistoryBreakdown,
	getHistorySleeves,
	getHistoryTotals,
	sortHistoryItems,
} from '@/views/uno/components/clan/clan-history.utils'
import { formatUnoMskDateTime } from '@/views/uno/utils/uno.utils'

function reward(overrides: Partial<UnoHistoryReward> = {}): UnoHistoryReward {
	return {
		clanMoney: 0,
		clanInfluence: 0,
		sleeves: 0,
		share: null,
		ranks: [],
		bracket: null,
		personalRandomLoot: null,
		containsBarterItems: false,
		eligibility: null,
		...overrides,
	}
}

function item(overrides: Partial<UnoHistoryItem> = {}): UnoHistoryItem {
	return {
		gridId: 'grid-1',
		group: 0,
		mode: 'tournament',
		date: '2026-01-01',
		stage: 0,
		time: '2026-01-01T10:00:00+00:00',
		matchId: 'match-1',
		mapId: 'hvoiny_3x6',
		winnerId: 'clan',
		outcome: 'win',
		actor: {
			clan: { id: 'clan', name: 'Clan', faction: 'merc' },
			counter1: 0,
			counter2: 0,
			counter3: 0,
			reason: null,
			score: 10,
			rating: 0,
			ratingPosition: 0,
			reward: reward({
				sleeves: 100,
				clanMoney: 1000,
				clanInfluence: 10,
			}),
			creditedSleeves: null,
		},
		opponents: [],
		...overrides,
	}
}

test('sums rewards and results across history items', () => {
	const totals = getHistoryTotals([
		item(),
		item({ outcome: 'loss', actor: { ...item().actor!, score: 5 } }),
	])

	expect(totals.matches).toBe(2)
	expect(totals.wins).toBe(1)
	expect(totals.losses).toBe(1)
	expect(totals.winRate).toBe(0.5)
	expect(totals.sleeves).toBe(200)
	expect(totals.clanMoney).toBe(2000)
	expect(totals.clanInfluence).toBe(20)
})

test('prefers credited sleeves over calculated reward sleeves', () => {
	const withCredited = item({
		actor: { ...item().actor!, creditedSleeves: 250 },
	})

	expect(getHistorySleeves(withCredited)).toBe(250)
	expect(getHistorySleeves(item())).toBe(100)
})

test('breaks history down by a key and sorts by matches', () => {
	const rows = buildHistoryBreakdown(
		[
			item({ mapId: 'hvoiny_3x6' }),
			item({ mapId: 'hvoiny_3x6', outcome: 'loss' }),
			item({ mapId: 'nizina_3x6' }),
		],
		(entry) => entry.mapId
	)

	expect(rows[0]).toMatchObject({
		key: 'hvoiny_3x6',
		matches: 2,
		wins: 1,
		losses: 1,
		winRate: 0.5,
		sleeves: 200,
	})
	expect(rows[1]).toMatchObject({ key: 'nizina_3x6', matches: 1 })
})

test('sorts history newest first', () => {
	const sorted = sortHistoryItems([
		item({ time: '2026-01-01T10:00:00+00:00' }),
		item({ time: '2026-03-01T10:00:00+00:00' }),
		item({ time: '2026-02-01T10:00:00+00:00' }),
	])

	expect(sorted.map((entry) => entry.time)).toEqual([
		'2026-03-01T10:00:00+00:00',
		'2026-02-01T10:00:00+00:00',
		'2026-01-01T10:00:00+00:00',
	])
})

test('formats history time in Moscow time', () => {
	expect(formatUnoMskDateTime('2026-01-01T10:00:00+00:00', 'ru')).toBe(
		'01.01.2026, 13:00'
	)
	expect(formatUnoMskDateTime(null, 'ru')).toBe('—')
})
