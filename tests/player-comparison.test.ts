import { describe, expect, test } from 'bun:test'
import { Regions } from '@/types/api.type'
import type { PlayerResponse, Stat, StatType } from '@/types/player.type'
import { Alliance } from '@/types/player.type'
import { getPlayerStatDirection } from '@/views/player/components/comparison/playerComparisonDirection'
import {
	buildPlayerComparisonSections,
	countPlayerComparisonDifferences,
} from '@/views/player/components/comparison/playerComparisonStats'
import {
	MAX_COMPARISON_PLAYERS,
	parsePlayerComparisonState,
	parsePlayerRef,
	serializePlayerComparisonState,
	toPlayerParam,
} from '@/views/player/components/comparison/playerComparisonUtils'

const player = (username: string, stats: Stat[]): PlayerResponse =>
	({
		username,
		uuid: username,
		status: '',
		alliance: Alliance.STALKERS,
		lastLogin: new Date(0),
		stats,
	}) as unknown as PlayerResponse

const stat = (id: string, value: number, type: StatType = 'INTEGER'): Stat => ({
	id,
	type,
	value,
})

describe('player comparison refs and url state', () => {
	test('parses region and nickname refs', () => {
		expect(parsePlayerRef('RU/Stalker')).toEqual({
			region: Regions.RU,
			character: 'Stalker',
		})
		expect(parsePlayerRef('eu/Name')).toEqual({
			region: Regions.EU,
			character: 'Name',
		})
		expect(parsePlayerRef('RU/First/Last')).toEqual({
			region: Regions.RU,
			character: 'First/Last',
		})
	})

	test.each([
		undefined,
		null,
		'',
		'RU',
		'XX/Name',
		'RU/',
		'RU/   ',
		'RU/a\nb',
	])('rejects %p', (value) => {
		expect(parsePlayerRef(value)).toBeNull()
	})

	test('deduplicates players ignoring nickname case and caps the list', () => {
		const params = new URLSearchParams()
		for (const value of [
			'RU/Alpha',
			'RU/alpha',
			'EU/Bravo',
			'NA/Charlie',
			'SEA/Delta',
			'NEA/Echo',
		]) {
			params.append('players', value)
		}

		const parsed = parsePlayerComparisonState(params)
		expect(parsed.players).toHaveLength(MAX_COMPARISON_PLAYERS)
		expect(parsed.players.map((entry) => entry.character)).toEqual([
			'Alpha',
			'Bravo',
			'Charlie',
			'Delta',
		])
	})

	test('serializes and parses the state back', () => {
		const state = {
			players: [
				{ region: Regions.RU, character: 'Alpha' },
				{ region: Regions.EU, character: 'Bravo' },
			],
		}

		expect(toPlayerParam(state.players[0])).toBe('RU/Alpha')
		expect(serializePlayerComparisonState(state)).toBe(
			'players=RU%2FAlpha&players=EU%2FBravo'
		)

		const parsed = parsePlayerComparisonState(
			new URLSearchParams(serializePlayerComparisonState(state))
		)
		expect(parsed).toEqual(state)
	})

	test('ignores malformed and empty params', () => {
		expect(
			parsePlayerComparisonState(
				new URLSearchParams('players=XX/Nope&players=RU/Valid')
			)
		).toEqual({
			players: [{ region: Regions.RU, character: 'Valid' }],
		})
	})
})

describe('getPlayerStatDirection', () => {
	test('detects lower is better stats', () => {
		expect(getPlayerStatDirection('dea', 'INTEGER')).toBe('lower')
		expect(getPlayerStatDirection('bul-dea', 'INTEGER')).toBe('lower')
		expect(getPlayerStatDirection('dam-rec-all', 'DECIMAL')).toBe('lower')
		expect(getPlayerStatDirection('pres-deaths', 'INTEGER')).toBe('lower')
	})

	test('detects higher is better stats', () => {
		expect(getPlayerStatDirection('kil', 'INTEGER')).toBe('higher')
		expect(getPlayerStatDirection('mut-kil', 'INTEGER')).toBe('higher')
		expect(getPlayerStatDirection('dam-dea-pla', 'DECIMAL')).toBe('higher')
		expect(getPlayerStatDirection('sho-hit', 'INTEGER')).toBe('higher')
		expect(getPlayerStatDirection('br-won', 'INTEGER')).toBe('higher')
	})

	test('leaves dates, durations and unknown counters neutral', () => {
		expect(getPlayerStatDirection('pla-tim', 'DURATION')).toBeNull()
		expect(getPlayerStatDirection('reg-tim', 'DATE')).toBeNull()
		expect(getPlayerStatDirection('cha-mes-sen', 'INTEGER')).toBeNull()
	})
})

describe('buildPlayerComparisonSections', () => {
	const alpha = player('Alpha', [
		stat('kil', 100),
		stat('bul-dea', 20),
		stat('sho-hit', 50),
		stat('sho-fir', 100),
		stat('ast', 5),
	])
	const bravo = player('Bravo', [
		stat('kil', 50),
		stat('bul-dea', 20),
		stat('sho-hit', 25),
		stat('sho-fir', 100),
	])

	test('builds a summary with ratios and percentages', () => {
		const sections = buildPlayerComparisonSections([alpha, bravo], 'en')
		expect(sections[0].key).toBe('summary')
		expect(sections[0].title).toBe('player.comparison.summary')

		const kd = sections[0].rows.find((row) => row.key === 'summary:kd')
		expect(kd?.values.map((value) => value?.text)).toEqual(['5.00', '2.50'])
		expect(kd?.best).toEqual([0])
		expect(kd?.worst).toEqual([1])

		const accuracy = sections[0].rows.find(
			(row) => row.key === 'summary:accuracy'
		)
		expect(accuracy?.values.map((value) => value?.text)).toEqual([
			'50%',
			'25%',
		])
	})

	test('aligns category stats and marks missing values as differences', () => {
		const sections = buildPlayerComparisonSections([alpha, bravo], 'en')
		const survival = sections.find((section) => section.key === 'SURVIVAL')
		expect(survival?.title).toBe('player.category.SURVIVAL')

		const kills = survival?.rows.find((row) => row.statKey === 'kil')
		expect(kills?.label).toBe('Kills')
		expect(kills?.values.map((value) => value?.text)).toEqual(['100', '50'])
		expect(kills?.best).toEqual([0])
		expect(kills?.worst).toEqual([1])

		const assists = survival?.rows.find((row) => row.statKey === 'ast')
		expect(assists?.values[0]?.text).toBe('5')
		expect(assists?.values[1]).toBeNull()
		expect(assists?.changed).toBe(true)
		expect(assists?.best).toEqual([])
		expect(assists?.worst).toEqual([])
	})

	test('counts changed rows across sections', () => {
		const sections = buildPlayerComparisonSections([alpha, bravo], 'en')
		expect(countPlayerComparisonDifferences(sections)).toBeGreaterThan(0)
	})

	test('returns nothing for fewer than two players', () => {
		expect(buildPlayerComparisonSections([alpha], 'en')).toEqual([])
		expect(buildPlayerComparisonSections([], 'en')).toEqual([])
	})

	test('keeps unchanged rows unhighlighted', () => {
		const first = player('First', [stat('kil', 10)])
		const second = player('Second', [stat('kil', 10)])

		const sections = buildPlayerComparisonSections([first, second], 'en')
		const kills = sections
			.find((section) => section.key === 'SURVIVAL')
			?.rows.find((row) => row.statKey === 'kil')

		expect(kills?.changed).toBe(false)
		expect(kills?.best).toEqual([])
		expect(kills?.worst).toEqual([])
	})
})
