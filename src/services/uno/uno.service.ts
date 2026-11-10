import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	UnoAggregateStats,
	UnoAnalyticsResponse,
	UnoBreakdown,
	UnoCalendarDay,
	UnoCalendarResponse,
	UnoClanResponse,
	UnoClanSummary,
	UnoComparisonResponse,
	UnoDateRangeParams,
	UnoGridClan,
	UnoGridDetailResponse,
	UnoGridGroup,
	UnoGridMatch,
	UnoGridMetadata,
	UnoGridStage,
	UnoGridSummary,
	UnoGridsResponse,
	UnoHistoryClan,
	UnoHistoryCoverage,
	UnoHistoryGridResult,
	UnoHistoryItem,
	UnoHistoryResponse,
	UnoHistoryReward,
	UnoHistorySide,
	UnoLeaderboardParams,
	UnoLeaderboardResponse,
	UnoMetric,
	UnoSeasonSubtier,
	UnoSeasonsResponse,
	UnoSeasonTier,
	UnoSeasonTierClan,
	UnoSeasonTiersResponse,
	UnoVsParams,
} from '@/types/uno/uno.type'

type JsonRecord = Record<string, unknown>

export const UNO_REQUEST_LIMITS = {
	leaderboardLimit: 100,
	leaderboardOffset: 10_000,
	text: 64,
	timezone: 64,
} as const

const isRecord = (value: unknown): value is JsonRecord =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

const asRecord = (value: unknown): JsonRecord => (isRecord(value) ? value : {})

const unwrap = (value: unknown): unknown => {
	const record = asRecord(value)
	return isRecord(record.data) ? record.data : value
}

const asArray = (value: unknown): unknown[] => {
	if (Array.isArray(value)) return value
	if (!isRecord(value)) return []
	for (const key of [
		'items',
		'entries',
		'results',
		'rows',
		'clans',
		'seasons',
		'days',
		'calendar',
		'grids',
	]) {
		if (Array.isArray(value[key])) return value[key]
	}
	return isRecord(value.data) ? asArray(value.data) : []
}

const first = (record: JsonRecord, keys: string[]): unknown => {
	for (const key of keys) {
		if (record[key] !== undefined && record[key] !== null)
			return record[key]
	}
	return null
}

const asString = (value: unknown): string | null =>
	typeof value === 'string' || typeof value === 'number'
		? String(value)
		: null

const asNumber = (value: unknown): number | null => {
	if (typeof value === 'number' && Number.isFinite(value)) return value
	if (typeof value === 'string' && value.trim() !== '') {
		const parsed = Number(value)
		return Number.isFinite(parsed) ? parsed : null
	}
	return null
}

const asBoolean = (value: unknown): boolean =>
	value === true || value === 1 || value === 'true'

const numberFrom = (record: JsonRecord, keys: string[]) =>
	asNumber(first(record, keys))

const toAggregateStats = (value: unknown): UnoAggregateStats => {
	const record = asRecord(value)
	return {
		fights: numberFrom(record, ['fights', 'matches', 'games']),
		wins: numberFrom(record, ['wins', 'victories']),
		losses: numberFrom(record, ['losses', 'defeats']),
		winRate: numberFrom(record, ['win_rate', 'winRate', 'rate']),
		grids: numberFrom(record, ['grids']),
		gridsWon: numberFrom(record, ['grids_won', 'gridsWon']),
		bestClientPlace: numberFrom(record, [
			'best_client_place',
			'bestClientPlace',
		]),
		averageClientPlace: numberFrom(record, [
			'average_client_place',
			'averageClientPlace',
		]),
		monthlyGrids: numberFrom(record, ['monthly_grids', 'monthlyGrids']),
	}
}

const hasAggregateData = (stats: UnoAggregateStats) =>
	Object.values(stats).some((value) => value !== null)

const aggregateMetricDefinitions = [
	['fights', 'fights'],
	['wins', 'wins'],
	['losses', 'losses'],
	['win_rate', 'win_rate', '%'],
	['grids', 'grids'],
	['grids_won', 'grids_won'],
	['best_client_place', 'best_client_place'],
	['average_client_place', 'average_client_place'],
	['monthly_grids', 'monthly_grids'],
] as const

const aggregateMetrics = (value: unknown): UnoMetric[] => {
	const stats = toAggregateStats(value)
	return aggregateMetricDefinitions.flatMap(([key, field, unit]) => {
		const value = stats[
			field === 'win_rate'
				? 'winRate'
				: field === 'grids_won'
					? 'gridsWon'
					: field === 'best_client_place'
						? 'bestClientPlace'
						: field === 'average_client_place'
							? 'averageClientPlace'
							: field === 'monthly_grids'
								? 'monthlyGrids'
								: field
		] as number | null
		return value === null
			? []
			: [{ key, label: key, value, unit: unit ?? null }]
	})
}

const toMetric = (value: unknown, fallbackKey: string): UnoMetric | null => {
	const record = asRecord(value)
	const key = asString(first(record, ['key', 'id', 'slug'])) ?? fallbackKey
	const rawValue = first(record, [
		'value',
		'amount',
		'count',
		'rating',
		'score',
	])
	if (rawValue === null) return null
	return {
		key,
		label: asString(first(record, ['label', 'title'])) ?? key,
		value: asNumber(rawValue) ?? asString(rawValue),
		unit: asString(first(record, ['unit', 'suffix'])),
	}
}

const toBreakdown = (value: unknown, fallbackKey: string): UnoBreakdown => {
	const record = asRecord(value)
	const key =
		asString(
			first(record, ['key', 'id', 'slug', 'map', 'mode', 'group'])
		) ?? fallbackKey
	return {
		key,
		label:
			asString(
				first(record, ['label', 'title', 'map', 'mode', 'group'])
			) ?? key,
		matches: numberFrom(record, [
			'fights',
			'matches',
			'games',
			'played',
			'count',
		]),
		wins: numberFrom(record, ['wins', 'victories']),
		losses: numberFrom(record, ['losses', 'defeats']),
		winRate: numberFrom(record, ['win_rate', 'winRate', 'rate']),
		score: numberFrom(record, ['score', 'points', 'rating']),
	}
}

const toBreakdowns = (value: unknown, prefix: string): UnoBreakdown[] => {
	if (Array.isArray(value)) {
		return value.map((item, index) =>
			toBreakdown(item, `${prefix}-${index + 1}`)
		)
	}
	if (!isRecord(value)) return []
	return Object.entries(value).map(([key, item]) => {
		if (isRecord(item)) return toBreakdown({ key, ...item }, key)
		return toBreakdown({ key, score: item }, key)
	})
}

const toSafeItems = (value: unknown): UnoBreakdown[] => {
	if (!Array.isArray(value)) return []
	return value.flatMap((item, index) => {
		const record = asRecord(item)
		const stats = toAggregateStats(item)
		const safeLabel = asString(first(record, ['map', 'mode', 'group']))
		if (!safeLabel && !hasAggregateData(stats)) return []
		return [
			toBreakdown(
				{ ...record, label: safeLabel ?? `item-${index + 1}` },
				`item-${index + 1}`
			),
		]
	})
}

const toSummary = (value: unknown, fallbackId = ''): UnoClanSummary => {
	const record = asRecord(value)
	return {
		id: asString(first(record, ['id', 'clan_id', 'clanId'])) ?? fallbackId,
		name: asString(first(record, ['name', 'clan_name', 'clanName'])) ?? '—',
		tag: asString(first(record, ['tag', 'clan_tag', 'clanTag'])),
		faction: asString(first(record, ['faction', 'alliance'])),
		tier: asString(first(record, ['rank', 'tier', 'clan_tier'])),
		levelRaw:
			asNumber(first(record, ['level_raw', 'levelRaw', 'level'])) ??
			asString(first(record, ['level_raw', 'levelRaw', 'level'])),
		influence: numberFrom(record, ['influence']),
		memberLimit: numberFrom(record, ['member_limit', 'memberLimit']),
		memberCount: numberFrom(record, ['member_count', 'memberCount']),
		rating: numberFrom(record, ['rating', 'elo', 'mmr']),
		position: numberFrom(record, ['position', 'rank', 'place']),
		observedAt: asString(first(record, ['observed_at', 'observedAt'])),
	}
}

const toSummaries = (payload: unknown): UnoClanSummary[] =>
	asArray(unwrap(payload))
		.map((item, index) => toSummary(item, `uno-${index + 1}`))
		.filter((item) => item.id !== '' && item.name !== '—')

const safeDetails = (value: unknown): UnoMetric[] => {
	const record = asRecord(value)
	const allowed = new Set([
		'level_raw',
		'influence',
		'member_limit',
		'member_count',
		'rating',
		'position',
	])
	return Object.entries(record).flatMap(([key, rawValue]) => {
		if (!allowed.has(key) || isRecord(rawValue) || Array.isArray(rawValue))
			return []
		return [
			{
				key,
				label: key,
				value: asNumber(rawValue) ?? asString(rawValue),
			},
		]
	})
}

const normalizeLeaderboard = (payload: unknown): UnoLeaderboardResponse => {
	const record = asRecord(unwrap(payload))
	return {
		items: toSummaries(record.items),
		total: numberFrom(record, ['total']),
		snapshot: asString(first(record, ['snapshot'])),
		season: asString(first(record, ['season'])),
		source: asString(first(record, ['source'])),
		observedAt: asString(first(record, ['observed_at', 'observedAt'])),
	}
}

const normalizeClan = (payload: unknown, fallbackId = ''): UnoClanResponse => {
	const record = asRecord(unwrap(payload))
	return {
		clan: toSummary(record, fallbackId),
		metrics: [...safeDetails(record.details), ...aggregateMetrics(record)],
	}
}

const normalizeAnalytics = (payload: unknown): UnoAnalyticsResponse => {
	const record = asRecord(unwrap(payload))
	const stats = toAggregateStats(record)
	return {
		stats,
		metrics: aggregateMetrics(record),
		grids: toBreakdowns(record.grids, 'grid'),
		modes: toBreakdowns(record.modes, 'mode'),
		maps: toBreakdowns(record.maps, 'map'),
		monthlyGrids: toBreakdowns(record.monthly_grids, 'monthly-grid'),
	}
}

const asPrimitive = (value: unknown): number | string | boolean | null => {
	if (typeof value === 'boolean') return value
	return asNumber(value) ?? asString(value)
}

const GRID_METADATA_KEYS = new Set([
	'source',
	'season',
	'map',
	'region',
	'total',
	'completed',
	'pending',
	'duration',
	'updated_at',
	'updatedAt',
])

const toGridMetadata = (value: unknown): UnoGridMetadata[] => {
	const record = asRecord(value)
	return Object.entries(record).flatMap(([key, rawValue]) => {
		if (
			!GRID_METADATA_KEYS.has(key) ||
			isRecord(rawValue) ||
			Array.isArray(rawValue)
		)
			return []
		return [{ key, label: key, value: asPrimitive(rawValue) }]
	})
}

const toGridSummary = (value: unknown, fallbackId: string): UnoGridSummary => {
	const record = asRecord(value)
	const metadata = [
		...toGridMetadata(record),
		...toGridMetadata(record.metadata),
	]
	return {
		id:
			asString(first(record, ['grid_id', 'gridId', 'id', 'uuid'])) ??
			fallbackId,
		mode: asString(first(record, ['mode', 'type'])),
		time: asString(first(record, ['time', 'start_time', 'startTime'])),
		number:
			asNumber(first(record, ['number', 'grid_number', 'gridNumber'])) ??
			asString(first(record, ['number', 'grid_number', 'gridNumber'])),
		date: asString(first(record, ['date', 'day'])),
		groupsCount: numberFrom(record, [
			'groups_count',
			'groupsCount',
			'group_count',
		]),
		status: asString(first(record, ['status', 'state'])),
		metadata,
	}
}

const normalizeCalendar = (payload: unknown): UnoCalendarResponse => {
	const unwrapped = unwrap(payload)
	const record = asRecord(unwrapped)
	const days = asRecord(record.days)
	const rawItems = Array.isArray(unwrapped)
		? unwrapped
		: Object.entries(days).flatMap(([date, modes]) => {
				const modeRecord = asRecord(modes)
				return Object.entries(modeRecord).map(([mode, count]) => ({
					date,
					mode,
					grids_count: count,
				}))
			})
	if (rawItems.length === 0) {
		const fallbackItems = asArray(record)
		rawItems.push(...fallbackItems)
	}
	return {
		items: rawItems.map((item, index) => {
			const value = asRecord(item)
			const date = asString(
				first(value, ['date', 'day', 'start', 'time'])
			)
			return {
				key: `${date ?? `day-${index + 1}`}-${asString(first(value, ['mode', 'type'])) ?? 'event'}`,
				date,
				mode: asString(first(value, ['mode', 'type'])),
				status: asString(first(value, ['status', 'state'])),
				number: numberFrom(value, [
					'number',
					'day_number',
					'dayNumber',
				]),
				gridsCount: numberFrom(value, [
					'grids_count',
					'gridsCount',
					'grids',
					'count',
				]),
			} satisfies UnoCalendarDay
		}),
		from: asString(first(record, ['from', 'start'])),
		to: asString(first(record, ['to', 'end'])),
		season: asString(first(record, ['season', 'season_id', 'seasonId'])),
	}
}

const normalizeGrids = (payload: unknown): UnoGridsResponse => {
	const unwrapped = unwrap(payload)
	const record = asRecord(unwrapped)
	const rawItems = Array.isArray(unwrapped) ? unwrapped : asArray(record)
	return {
		items: rawItems.map((item, index) =>
			toGridSummary(item, `grid-${index + 1}`)
		),
		total: numberFrom(record, ['total', 'count']) ?? rawItems.length,
	}
}

const toGridClan = (value: unknown): UnoGridClan | null => {
	const record = asRecord(value)
	const id = asString(first(record, ['id']))
	if (!id) return null
	return {
		id,
		name: asString(first(record, ['name'])),
		faction: asString(first(record, ['faction'])),
		place: numberFrom(record, ['place']),
		score: numberFrom(record, ['score']),
		share: numberFrom(record, ['share']),
		sleeves: numberFrom(record, ['sleeves']),
		tied: first(record, ['tied']) === true,
	}
}

const toGridMatch = (value: unknown): UnoGridMatch | null => {
	const record = asRecord(value)
	const number = numberFrom(record, ['number'])
	if (number === null) return null
	return {
		number,
		map: asString(first(record, ['map'])),
		status: asString(first(record, ['status'])),
		bracket: asString(first(record, ['bracket'])),
		winnerId: asString(first(record, ['winnerId'])),
		clans: asArray(record.clans)
			.map(toGridClan)
			.filter((clan): clan is UnoGridClan => clan !== null),
	}
}

const toGridStage = (value: unknown): UnoGridStage | null => {
	const record = asRecord(value)
	const number = numberFrom(record, ['number'])
	if (number === null) return null
	return {
		number,
		time: asString(first(record, ['time'])),
		state: numberFrom(record, ['state']),
		matches: asArray(record.matches)
			.map(toGridMatch)
			.filter((match): match is UnoGridMatch => match !== null),
	}
}

const toGridGroup = (value: unknown): UnoGridGroup | null => {
	const record = asRecord(value)
	const number = numberFrom(record, ['number'])
	if (number === null) return null
	return {
		number,
		winner: toGridClan(record.winner),
		status: asString(first(record, ['status'])),
		tier: asString(first(record, ['tier'])),
		tierMax: asString(first(record, ['tierMax'])),
		rankMin: numberFrom(record, ['rankMin']),
		rankMax: numberFrom(record, ['rankMax']),
		missingCards: numberFrom(record, ['missingCards']),
		clans: asArray(record.clans)
			.map(toGridClan)
			.filter((clan): clan is UnoGridClan => clan !== null),
		stages: asArray(record.stages)
			.map(toGridStage)
			.filter((stage): stage is UnoGridStage => stage !== null),
	}
}

const normalizeGridDetail = (
	payload: unknown,
	fallbackId: string
): UnoGridDetailResponse => {
	const record = asRecord(unwrap(payload))
	const grid = asRecord(record.grid)
	if (!isRecord(record.grid)) {
		const nested = first(record, ['grid', 'item', 'summary'])
		const summary = toGridSummary(nested ?? record, fallbackId)
		return {
			grid: {
				id: summary.id,
				mode: summary.mode,
				date: summary.date,
				time: summary.time,
				number: asNumber(summary.number),
				groupsCount: summary.groupsCount,
				observedAt: null,
			},
			coverage: null,
			groups: [],
		}
	}
	const coverage = isRecord(record.coverage) ? record.coverage : null
	return {
		grid: {
			id: asString(first(grid, ['id'])) ?? fallbackId,
			mode: asString(first(grid, ['mode'])),
			date: asString(first(grid, ['date'])),
			time: asString(first(grid, ['time'])),
			number: numberFrom(grid, ['number']),
			groupsCount: numberFrom(grid, ['groupsCount', 'groups_count']),
			observedAt: asString(first(grid, ['observedAt', 'observed_at'])),
		},
		coverage: coverage
			? {
					complete: first(coverage, ['complete']) === true,
					expectedGroups: numberFrom(coverage, ['expectedGroups']),
					downloadedGroups: numberFrom(coverage, [
						'downloadedGroups',
					]),
					missingGroups: asArray(coverage.missingGroups)
						.map(asNumber)
						.filter((value): value is number => value !== null),
				}
			: null,
		groups: asArray(record.groups)
			.map(toGridGroup)
			.filter((group): group is UnoGridGroup => group !== null),
	}
}

const comparisonMetrics = (
	left: UnoClanSummary,
	right: UnoClanSummary,
	leftStats: UnoAggregateStats | null,
	rightStats: UnoAggregateStats | null
): UnoComparisonResponse['metrics'] => {
	const rows: Array<[string, string, number | null, number | null, string?]> =
		[
			['rating', 'rating', left.rating, right.rating],
			['position', 'position', left.position, right.position],
			['influence', 'influence', left.influence, right.influence],
			[
				'fights',
				'fights',
				leftStats?.fights ?? null,
				rightStats?.fights ?? null,
			],
			['wins', 'wins', leftStats?.wins ?? null, rightStats?.wins ?? null],
			[
				'losses',
				'losses',
				leftStats?.losses ?? null,
				rightStats?.losses ?? null,
			],
			[
				'win_rate',
				'win_rate',
				leftStats?.winRate ?? null,
				rightStats?.winRate ?? null,
				'%',
			],
			[
				'grids',
				'grids',
				leftStats?.grids ?? null,
				rightStats?.grids ?? null,
			],
			[
				'grids_won',
				'grids_won',
				leftStats?.gridsWon ?? null,
				rightStats?.gridsWon ?? null,
			],
		]
	return rows.flatMap(([key, label, leftValue, rightValue, unit]) =>
		leftValue === null && rightValue === null
			? []
			: [{ key, label, left: leftValue, right: rightValue, unit }]
	)
}

const normalizeComparison = (
	payload: unknown,
	params: UnoVsParams
): UnoComparisonResponse => {
	const record = asRecord(unwrap(payload))
	const items = toSafeItems(record.items)
	const candidates = asArray(record.items)
	const side = (id: string) =>
		candidates.find((item) => {
			const itemRecord = asRecord(item)
			return ['clan_id', 'clanId', 'id'].some(
				(key) => String(itemRecord[key] ?? '') === id
			)
		})
	const left = toSummary(side(params.leftClanId), params.leftClanId)
	const right = toSummary(side(params.rightClanId), params.rightClanId)
	const leftStats = side(params.leftClanId)
		? toAggregateStats(side(params.leftClanId))
		: null
	const rightStats = side(params.rightClanId)
		? toAggregateStats(side(params.rightClanId))
		: null
	return {
		left,
		right,
		metrics: comparisonMetrics(left, right, leftStats, rightStats),
		aggregate: toAggregateStats(record),
		items,
	}
}

const toHistoryClan = (value: unknown): UnoHistoryClan | null => {
	const record = asRecord(value)
	const id = asString(first(record, ['id', 'clan_id', 'clanId']))
	if (!id) return null
	return {
		id,
		name: asString(first(record, ['name', 'clan_name', 'clanName'])),
		faction: asString(first(record, ['faction', 'alliance'])),
	}
}

const toHistoryReward = (value: unknown): UnoHistoryReward => {
	const record = asRecord(value)
	return {
		clanMoney: numberFrom(record, ['clanMoney', 'clan_money']),
		clanInfluence: numberFrom(record, ['clanInfluence', 'clan_influence']),
		sleeves: numberFrom(record, ['sleeves']),
		share: numberFrom(record, ['share']),
		ranks: asArray(record.ranks).flatMap((rank) => {
			const value = asString(rank)
			return value ? [value] : []
		}),
		bracket: asString(first(record, ['bracket'])),
		personalRandomLoot: asString(
			first(record, ['personalRandomLoot', 'personal_random_loot'])
		),
		containsBarterItems: asBoolean(
			first(record, ['containsBarterItems', 'contains_barter_items'])
		),
		eligibility: asString(first(record, ['eligibility'])),
	}
}

const toHistorySide = (value: unknown): UnoHistorySide | null => {
	if (!isRecord(value)) return null
	const record = value
	const reward = first(record, ['calculated_reward', 'calculatedReward'])
	return {
		clan: toHistoryClan(record.clan),
		counter1: numberFrom(record, ['counter_1', 'counter1']),
		counter2: numberFrom(record, ['counter_2', 'counter2']),
		counter3: numberFrom(record, ['counter_3', 'counter3']),
		reason: numberFrom(record, ['reason']),
		score: numberFrom(record, ['score']),
		rating: numberFrom(record, ['rating']),
		ratingPosition: numberFrom(record, [
			'rating_position',
			'ratingPosition',
		]),
		reward: isRecord(reward) ? toHistoryReward(reward) : null,
		creditedSleeves: numberFrom(record, [
			'credited_sleeves',
			'creditedSleeves',
		]),
	}
}

const toHistoryItem = (value: unknown): UnoHistoryItem | null => {
	if (!isRecord(value)) return null
	const record = value
	const gridId = asString(first(record, ['grid_id', 'gridId']))
	if (!gridId) return null
	return {
		gridId,
		group: numberFrom(record, ['group']),
		mode: asString(first(record, ['mode', 'type'])),
		date: asString(first(record, ['date', 'day'])),
		stage: numberFrom(record, ['stage']),
		time: asString(first(record, ['time', 'start_time', 'startTime'])),
		matchId: asString(first(record, ['match_id', 'matchId'])),
		mapId: asString(first(record, ['map_id', 'mapId', 'map'])),
		winnerId: asString(first(record, ['winner_id', 'winnerId'])),
		outcome: asString(first(record, ['outcome', 'result'])),
		actor: toHistorySide(record.actor),
		opponents: asArray(record.opponents)
			.map(toHistorySide)
			.filter((side): side is UnoHistorySide => side !== null),
	}
}

const toHistoryGridResult = (value: unknown): UnoHistoryGridResult | null => {
	if (!isRecord(value)) return null
	const record = value
	const gridId = asString(first(record, ['grid_id', 'gridId']))
	if (!gridId) return null
	return {
		gridId,
		group: numberFrom(record, ['group']),
		date: asString(first(record, ['date', 'day'])),
		mode: asString(first(record, ['mode', 'type'])),
		winnerId: asString(first(record, ['winner_id', 'winnerId'])),
		clientPlace: numberFrom(record, ['client_place', 'clientPlace']),
		placeTied: asBoolean(first(record, ['place_tied', 'placeTied'])),
	}
}

const toHistoryCoverage = (value: unknown): UnoHistoryCoverage | null => {
	if (!isRecord(value)) return null
	const record = value
	return {
		knownClanGroups: numberFrom(record, [
			'known_clan_groups',
			'knownClanGroups',
		]),
		downloadedClanGroups: numberFrom(record, [
			'downloaded_clan_groups',
			'downloadedClanGroups',
		]),
		allTimeComplete: asBoolean(
			first(record, ['all_time_complete', 'allTimeComplete'])
		),
		scope: asString(first(record, ['scope'])),
	}
}

const normalizeHistory = (payload: unknown): UnoHistoryResponse => {
	const record = asRecord(unwrap(payload))
	return {
		items: asArray(record.items)
			.map(toHistoryItem)
			.filter((item): item is UnoHistoryItem => item !== null),
		gridResults: asArray(record.grid_results ?? record.gridResults)
			.map(toHistoryGridResult)
			.filter((item): item is UnoHistoryGridResult => item !== null),
		coverage: toHistoryCoverage(record.coverage),
	}
}

const dateRangeQuery = (params: UnoDateRangeParams = {}) => ({
	from: params.from,
	to: params.to,
	date: params.date,
	mode: params.mode,
	timezone: params.timezone?.slice(0, UNO_REQUEST_LIMITS.timezone),
	season: params.season?.slice(0, UNO_REQUEST_LIMITS.text),
})

const toSeasonTierClan = (value: unknown): UnoSeasonTierClan | null => {
	const record = asRecord(value)
	const id = asString(first(record, ['id']))
	if (!id) return null
	return {
		id,
		name: asString(first(record, ['name'])) ?? '—',
		tag: asString(first(record, ['tag'])),
		faction: asString(first(record, ['faction'])),
		rating: asNumber(first(record, ['rating'])),
		position: asNumber(first(record, ['position'])),
		seasonPosition: asNumber(
			first(record, ['seasonPosition', 'season_position'])
		),
		flag: asBoolean(first(record, ['flag'])),
		memberCount: asNumber(first(record, ['memberCount', 'member_count'])),
	}
}

const toSeasonSubtier = (value: unknown): UnoSeasonSubtier | null => {
	const record = asRecord(value)
	const level = asNumber(first(record, ['level']))
	if (level === null) return null
	return {
		level,
		label: asString(first(record, ['label'])) ?? String(level),
		fromPosition: asNumber(
			first(record, ['fromPosition', 'from_position'])
		),
		toPosition: asNumber(first(record, ['toPosition', 'to_position'])),
		ratingMax: asNumber(first(record, ['ratingMax', 'rating_max'])),
		ratingMin: asNumber(first(record, ['ratingMin', 'rating_min'])),
		clans: asArray(record.clans)
			.map(toSeasonTierClan)
			.filter((clan): clan is UnoSeasonTierClan => clan !== null),
	}
}

const toSeasonTier = (value: unknown): UnoSeasonTier | null => {
	const record = asRecord(value)
	const rank = asString(first(record, ['rank']))
	if (!rank) return null
	return {
		rank,
		count: asNumber(first(record, ['count'])) ?? 0,
		subtiers: asArray(record.subtiers)
			.map(toSeasonSubtier)
			.filter((subtier): subtier is UnoSeasonSubtier => subtier !== null),
	}
}

const normalizeSeasonTiers = (
	payload: unknown,
	fallbackSeason: string
): UnoSeasonTiersResponse => {
	const record = asRecord(unwrap(payload))
	return {
		season: asString(first(record, ['season'])) ?? fallbackSeason,
		total: asNumber(first(record, ['total'])),
		observedAt: asString(first(record, ['observedAt', 'observed_at'])),
		ratingRulesVersion: asString(
			first(record, ['ratingRulesVersion', 'rating_rules_version'])
		),
		tiers: asArray(record.tiers)
			.map(toSeasonTier)
			.filter((tier): tier is UnoSeasonTier => tier !== null),
	}
}

class UnoService {
	async getLeaderboard(
		params: UnoLeaderboardParams = {}
	): Promise<UnoLeaderboardResponse> {
		const { data } = await apiClient.get('/api/v1/uno/leaderboard', {
			params: {
				q: params.q?.slice(0, UNO_REQUEST_LIMITS.text),
				faction: params.faction,
				rank: params.rank,
				limit:
					params.limit === undefined
						? undefined
						: Math.min(
								Math.max(1, params.limit),
								UNO_REQUEST_LIMITS.leaderboardLimit
							),
				offset:
					params.offset === undefined
						? undefined
						: Math.min(
								Math.max(0, params.offset),
								UNO_REQUEST_LIMITS.leaderboardOffset
							),
				season: params.season?.slice(0, UNO_REQUEST_LIMITS.text),
			},
		})
		return normalizeLeaderboard(data)
	}

	async getClans(): Promise<UnoClanSummary[]> {
		const { data } = await apiClient.get('/api/v1/uno/clans')
		return toSummaries(data)
	}

	async getClan(clanId: string): Promise<UnoClanResponse> {
		const { data } = await apiClient.get(
			`/api/v1/uno/clans/${encodeURIComponent(clanId)}`
		)
		return normalizeClan(data, clanId)
	}

	async getAnalytics(
		clanId: string,
		params: UnoDateRangeParams = {}
	): Promise<UnoAnalyticsResponse> {
		const { data } = await apiClient.get(
			`/api/v1/uno/clans/${encodeURIComponent(clanId)}/analytics`,
			{
				params: dateRangeQuery(params),
			}
		)
		return normalizeAnalytics(data)
	}

	async getVs(params: UnoVsParams): Promise<UnoComparisonResponse> {
		const { data } = await apiClient.get(
			`/api/v1/uno/clans/${encodeURIComponent(params.leftClanId)}/vs/${encodeURIComponent(params.rightClanId)}`,
			{ params: dateRangeQuery(params) }
		)
		const comparison = normalizeComparison(data, params)
		const [left, right] = await Promise.allSettled([
			this.getClan(params.leftClanId),
			this.getClan(params.rightClanId),
		])
		const resolvedLeft =
			left.status === 'fulfilled' ? left.value.clan : comparison.left
		const resolvedRight =
			right.status === 'fulfilled' ? right.value.clan : comparison.right
		return {
			...comparison,
			left: resolvedLeft,
			right: resolvedRight,
			metrics: comparison.metrics.length
				? comparison.metrics
				: comparisonMetrics(resolvedLeft, resolvedRight, null, null),
		}
	}

	async getRatingHistory(clanId: string): Promise<UnoMetric[]> {
		const { data } = await apiClient.get(
			`/api/v1/uno/clans/${encodeURIComponent(clanId)}/rating-history`
		)
		const record = asRecord(unwrap(data))
		return asArray(record.items)
			.map((item, index) => {
				const point = asRecord(item)
				return {
					key:
						asString(first(point, ['time'])) ??
						`rating-${index + 1}`,
					label:
						asString(first(point, ['time'])) ??
						`rating-${index + 1}`,
					value: asNumber(first(point, ['rating'])),
				}
			})
			.filter((item) => item.value !== null)
	}

	async getHistory(
		clanId: string,
		params: UnoDateRangeParams = {}
	): Promise<UnoHistoryResponse> {
		const { data } = await apiClient.get(
			`/api/v1/uno/clans/${encodeURIComponent(clanId)}/history`,
			{ params: dateRangeQuery(params) }
		)
		return normalizeHistory(data)
	}

	async getCalendar(
		params: UnoDateRangeParams = {}
	): Promise<UnoCalendarResponse> {
		const { data } = await apiClient.get('/api/v1/uno/calendar', {
			params: dateRangeQuery(params),
		})
		return normalizeCalendar(data)
	}

	async getGrids(params: UnoDateRangeParams = {}): Promise<UnoGridsResponse> {
		const { data } = await apiClient.get('/api/v1/uno/grids', {
			params: dateRangeQuery(params),
			noServerCache: true,
		})
		return normalizeGrids(data)
	}

	async getGrid(
		gridId: string,
		params: { q?: string; rank?: string } = {}
	): Promise<UnoGridDetailResponse> {
		const { data } = await apiClient.get(
			`/api/v1/uno/grids/${encodeURIComponent(gridId)}`,
			{ params, noServerCache: true }
		)
		return normalizeGridDetail(data, gridId)
	}

	async getGridGroup(
		gridId: string,
		number: number
	): Promise<UnoGridDetailResponse> {
		const { data } = await apiClient.get(
			`/api/v1/uno/grids/${encodeURIComponent(gridId)}/groups/${number}`,
			{ noServerCache: true }
		)
		return normalizeGridDetail(data, `${gridId}-group-${number}`)
	}

	async exportGrid(gridId: string): Promise<UnoGridDetailResponse> {
		const { data } = await apiClient.get(
			`/api/v1/uno/grids/${encodeURIComponent(gridId)}/export`,
			{ noServerCache: true }
		)
		return normalizeGridDetail(data, gridId)
	}

	async getCoverage(params: UnoDateRangeParams = {}): Promise<UnoMetric[]> {
		const { data } = await apiClient.get('/api/v1/uno/coverage', {
			params: dateRangeQuery(params),
		})
		return asArray(data)
			.map((item, index) => toMetric(item, `coverage-${index + 1}`))
			.filter((item): item is UnoMetric => item !== null)
	}

	async getSeasons(): Promise<UnoSeasonsResponse> {
		const { data } = await apiClient.get('/api/v1/uno/seasons')
		return {
			items: asArray(data).map((item, index) => {
				const record = asRecord(item)
				const period = Array.isArray(record.period)
					? record.period.filter(
							(value): value is string =>
								typeof value === 'string'
						)
					: []
				const status = asString(first(record, ['status', 'state']))
				return {
					id:
						asString(
							first(record, ['id', 'season_id', 'seasonId'])
						) ?? `season-${index + 1}`,
					title:
						asString(first(record, ['title', 'name', 'label'])) ??
						`Season ${index + 1}`,
					period,
					status,
					isCurrent:
						asBoolean(
							first(record, [
								'is_current',
								'isCurrent',
								'current',
							])
						) || status === 'current',
				}
			}),
		}
	}

	async getSeasonTiers(season: string): Promise<UnoSeasonTiersResponse> {
		const { data } = await apiClient.get('/api/v1/uno/season-tiers', {
			params: { season: season.slice(0, UNO_REQUEST_LIMITS.text) },
		})
		return normalizeSeasonTiers(data, season)
	}
}

export const unoService = new UnoService()
