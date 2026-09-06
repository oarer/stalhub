import type { ArcadeMapData } from '@/data/arcadeMaps'

export const ARCADE_REP_PER_LEVEL = 10000

export const DEFAULT_ASSISTS = 0
export const DEFAULT_SPOTS = 0

export interface SessionInput {
	currentLevel: number
	currentPoints: number
	targetLevel: number
	hoursPerDay: number
	queueMin: number
	avgDamagePerKill: number
	includeCaptures: boolean
	maxKillsPerMatch: number
	spartakBoost: number
}

export interface MatchProfile {
	assists: number
	caps: number
	spots: number
	killsTarget: number
	damage: number
}

export interface MapEval {
	map: ArcadeMapData
	profile: MatchProfile
	score: number
	battlepoints: number
	rep: number
	brt: number
	matchMin: number
	matchesPerDay: number
	repPerDay: number
	repPerHour: number
	maxReached: boolean
}

export interface BattlePlan {
	map: ArcadeMapData
	repNeeded: number
	totalMatches: number
	matchesPerDay: number
	days: number
}

export const isTeamDeathmatch = (map: ArcadeMapData) =>
	map.kind === 'battlefield' &&
	map.scoreToWin <= 100 &&
	map.scoreEnemyKill === 1

export const captureScore = (map: ArcadeMapData) => {
	if (map.mode === 'koth') return map.captureCoverageScore
	return map.captureFinishScore
}

export const optimalProfile = (
	map: ArcadeMapData,
	input: SessionInput
): MatchProfile => {
	const hasCapturePoints =
		input.includeCaptures && captureScore(map) > 0 && !isTeamDeathmatch(map)
	const caps = hasCapturePoints ? (map.mode === 'breakthrough' ? 1 : 2) : 0
	const assists = DEFAULT_ASSISTS
	const spots = DEFAULT_SPOTS

	const baselineScore =
		assists * map.assistScore +
		caps * captureScore(map) +
		spots * map.spotScore

	const perKillScore = map.killScore + input.avgDamagePerKill * map.damageK
	const rawTarget =
		perKillScore > 0
			? Math.max(
					0,
					Math.ceil((map.scoreForMax - baselineScore) / perKillScore)
				)
			: map.scoreForMax
	const killsTarget =
		input.maxKillsPerMatch > 0
			? Math.min(rawTarget, input.maxKillsPerMatch)
			: rawTarget

	return {
		assists,
		caps,
		spots,
		killsTarget,
		damage: killsTarget * input.avgDamagePerKill,
	}
}

export const scoreForProfile = (map: ArcadeMapData, profile: MatchProfile) =>
	Math.floor(
		profile.killsTarget * map.killScore +
			profile.assists * map.assistScore +
			profile.caps * captureScore(map) +
			profile.spots * map.spotScore +
			profile.damage * map.damageK
	)

export const battlepointsForScore = (map: ArcadeMapData, score: number) => {
	if (map.scoreForMax <= 0) return 0
	return Math.min(
		map.maxPersonal,
		Math.round((score * map.maxPersonal) / map.scoreForMax)
	)
}

export const mapEval = (map: ArcadeMapData, input: SessionInput): MapEval => {
	const profile = optimalProfile(map, input)
	const score = scoreForProfile(map, profile)
	const maxReached = score >= map.scoreForMax
	const battlepoints = Math.round(
		battlepointsForScore(map, score) * (1 + input.spartakBoost)
	)
	const rep = Math.round(battlepoints * map.repMultiplier)
	const brt = battlepoints * map.brtMultiplier
	const matchMin = map.durationMin + input.queueMin
	const matchesPerDay =
		matchMin > 0 ? Math.floor((input.hoursPerDay * 60) / matchMin) : 0
	const repPerDay = matchesPerDay * rep
	const repPerHour = input.hoursPerDay > 0 ? repPerDay / input.hoursPerDay : 0

	return {
		map,
		profile,
		score,
		battlepoints,
		rep,
		brt,
		matchMin,
		matchesPerDay,
		repPerDay,
		repPerHour,
		maxReached,
	}
}

export const repNeededForInput = (input: SessionInput) => {
	const missing =
		(input.targetLevel - input.currentLevel) * ARCADE_REP_PER_LEVEL
	return Math.max(0, missing - input.currentPoints)
}

export const buildPlan = (
	maps: ArcadeMapData[],
	input: SessionInput
): BattlePlan | null => {
	if (maps.length === 0) return null

	const best = maps
		.map((map) => mapEval(map, input))
		.sort((a, b) => {
			if (b.repPerDay !== a.repPerDay) return b.repPerDay - a.repPerDay
			return b.repPerHour - a.repPerHour
		})[0]

	const repNeeded = repNeededForInput(input)
	if (repNeeded <= 0 || best.rep <= 0) {
		return {
			map: best.map,
			repNeeded,
			totalMatches: 0,
			matchesPerDay: best.matchesPerDay,
			days: 0,
		}
	}

	const totalMatches = Math.ceil(repNeeded / best.rep)
	const days =
		best.matchesPerDay > 0
			? Math.ceil(totalMatches / best.matchesPerDay)
			: 0

	return {
		map: best.map,
		repNeeded,
		totalMatches,
		matchesPerDay: best.matchesPerDay,
		days,
	}
}
