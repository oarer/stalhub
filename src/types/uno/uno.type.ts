export interface UnoAggregateStats {
	fights: number | null
	wins: number | null
	losses: number | null
	winRate: number | null
	grids: number | null
	gridsWon: number | null
	bestClientPlace: number | null
	averageClientPlace: number | null
	monthlyGrids: number | null
}

export interface UnoBreakdown {
	key: string
	label: string
	matches: number | null
	wins: number | null
	losses: number | null
	winRate: number | null
	score: number | null
}

export interface UnoMetric {
	key: string
	label: string
	value: number | string | null
	unit?: string | null
}

export interface UnoClanSummary {
	id: string
	name: string
	tag: string | null
	faction: string | null
	tier: string | null
	levelRaw: number | string | null
	influence: number | null
	memberLimit: number | null
	memberCount: number | null
	rating: number | null
	position: number | null
	observedAt: string | null
}

export interface UnoLeaderboardResponse {
	items: UnoClanSummary[]
	total: number | null
	snapshot: string | null
	season: string | null
	source: string | null
	observedAt: string | null
}

export interface UnoClanResponse {
	clan: UnoClanSummary
	metrics: UnoMetric[]
}

export interface UnoAnalyticsResponse {
	stats: UnoAggregateStats
	metrics: UnoMetric[]
	grids: UnoBreakdown[]
	modes: UnoBreakdown[]
	maps: UnoBreakdown[]
	monthlyGrids: UnoBreakdown[]
}

export interface UnoComparisonResponse {
	left: UnoClanSummary
	right: UnoClanSummary
	metrics: Array<{
		key: string
		label: string
		left: number | string | null
		right: number | string | null
		unit?: string | null
	}>
	aggregate: UnoAggregateStats
	items: UnoBreakdown[]
}

export interface UnoCalendarDay {
	key: string
	date: string | null
	mode: string | null
	status: string | null
	number: number | null
	gridsCount: number | null
}

export interface UnoCalendarResponse {
	items: UnoCalendarDay[]
	from: string | null
	to: string | null
	season: string | null
}

export interface UnoGridMetadata {
	key: string
	label: string
	value: number | string | boolean | null
}

export interface UnoGridSummary {
	id: string
	mode: string | null
	time: string | null
	number: number | string | null
	date: string | null
	groupsCount: number | null
	status: string | null
	metadata: UnoGridMetadata[]
}

export interface UnoGridsResponse {
	items: UnoGridSummary[]
	total: number | null
}

export interface UnoGridClan {
	id: string
	name: string | null
	faction: string | null
	place: number | null
	score: number | null
	share: number | null
	sleeves: number | null
	tied: boolean | null
}

export interface UnoGridMatch {
	number: number
	map: string | null
	status: string | null
	bracket: string | null
	winnerId: string | null
	clans: UnoGridClan[]
}

export interface UnoGridStage {
	number: number
	time: string | null
	state: number | null
	matches: UnoGridMatch[]
}

export interface UnoGridGroup {
	number: number
	winner: UnoGridClan | null
	status: string | null
	tier: string | null
	tierMax: string | null
	rankMin: number | null
	rankMax: number | null
	missingCards: number | null
	clans: UnoGridClan[]
	stages: UnoGridStage[]
}

export interface UnoGridCoverage {
	complete: boolean
	expectedGroups: number | null
	downloadedGroups: number | null
	missingGroups: number[]
}

export interface UnoGridDetailResponse {
	grid: {
		id: string
		mode: string | null
		date: string | null
		time: string | null
		number: number | null
		groupsCount: number | null
		observedAt: string | null
	}
	coverage: UnoGridCoverage | null
	groups: UnoGridGroup[]
}

export interface UnoSeason {
	id: string
	title: string
	period: string[]
	status: string | null
	isCurrent: boolean
}

export interface UnoSeasonsResponse {
	items: UnoSeason[]
}

export interface UnoSeasonTierClan {
	id: string
	name: string
	tag: string | null
	faction: string | null
	rating: number | null
	position: number | null
	seasonPosition: number | null
	flag: boolean | null
	memberCount: number | null
}

export interface UnoSeasonSubtier {
	level: number
	label: string
	fromPosition: number | null
	toPosition: number | null
	ratingMax: number | null
	ratingMin: number | null
	clans: UnoSeasonTierClan[]
}

export interface UnoSeasonTier {
	rank: string
	count: number
	subtiers: UnoSeasonSubtier[]
}

export interface UnoSeasonTiersResponse {
	season: string
	total: number | null
	observedAt: string | null
	ratingRulesVersion: string | null
	tiers: UnoSeasonTier[]
}

export interface UnoLeaderboardParams {
	q?: string
	faction?: string
	rank?: string
	limit?: number
	offset?: number
	season?: string
}

export interface UnoDateRangeParams {
	from?: string
	to?: string
	date?: string
	mode?: 'brawl' | 'tournament' | 'base_capture'
	season?: string
	timezone?: string
}

export interface UnoVsParams extends UnoDateRangeParams {
	leftClanId: string
	rightClanId: string
}

export interface UnoHistoryClan {
	id: string
	name: string | null
	faction: string | null
}

export interface UnoHistoryReward {
	clanMoney: number | null
	clanInfluence: number | null
	sleeves: number | null
	share: number | null
	ranks: string[]
	bracket: string | null
	personalRandomLoot: string | null
	containsBarterItems: boolean
	eligibility: string | null
}

export interface UnoHistorySide {
	clan: UnoHistoryClan | null
	counter1: number | null
	counter2: number | null
	counter3: number | null
	reason: number | null
	score: number | null
	rating: number | null
	ratingPosition: number | null
	reward: UnoHistoryReward | null
	creditedSleeves: number | null
}

export interface UnoHistoryItem {
	gridId: string
	group: number | null
	mode: string | null
	date: string | null
	stage: number | null
	time: string | null
	matchId: string | null
	mapId: string | null
	winnerId: string | null
	outcome: string | null
	actor: UnoHistorySide | null
	opponents: UnoHistorySide[]
}

export interface UnoHistoryGridResult {
	gridId: string
	group: number | null
	date: string | null
	mode: string | null
	winnerId: string | null
	clientPlace: number | null
	placeTied: boolean
}

export interface UnoHistoryCoverage {
	knownClanGroups: number | null
	downloadedClanGroups: number | null
	allTimeComplete: boolean
	scope: string | null
}

export interface UnoHistoryResponse {
	items: UnoHistoryItem[]
	gridResults: UnoHistoryGridResult[]
	coverage: UnoHistoryCoverage | null
}
