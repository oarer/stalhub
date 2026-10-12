import { expect, test } from 'bun:test'
import { arcadeMaps } from '@/data/arcadeMaps'
import {
	buildPlan,
	mapEval,
	optimalProfile,
	repNeededForInput,
	type SessionInput,
} from '@/views/calcs/sessions/utils/sessions'

const map = {
	...arcadeMaps[0],
	id: 'fixture',
	durationMin: 10,
	scoreForMax: 1000,
	killScore: 100,
	damageK: 1,
	captureFinishScore: 200,
	maxPersonal: 100,
	repMultiplier: 2,
	brtMultiplier: 0.5,
}
const input: SessionInput = {
	currentLevel: 1,
	currentPoints: 500,
	targetLevel: 2,
	hoursPerDay: 1,
	queueMin: 2,
	avgDamagePerKill: 100,
	includeCaptures: true,
	maxKillsPerMatch: 0,
	spartakBoost: 0,
}

test('capture baseline reduces required kills and caps enforce achievable score', () => {
	expect(optimalProfile(map, input)).toEqual({
		assists: 0,
		caps: 2,
		spots: 0,
		killsTarget: 3,
		damage: 300,
	})
	const result = mapEval(map, { ...input, maxKillsPerMatch: 2 })
	expect(result.score).toBe(800)
	expect(result.maxReached).toBe(false)
	expect(result.rep).toBe(160)
})

test('deathmatch removes captures and koth uses coverage scoring', () => {
	expect(
		optimalProfile({ ...map, scoreToWin: 100, scoreEnemyKill: 1 }, input)
			.caps
	).toBe(0)
	expect(
		optimalProfile(
			{ ...map, mode: 'koth', captureCoverageScore: 500 },
			input
		).killsTarget
	).toBe(0)
})

test('queue time floors matches per day and boosts rewards after cap', () => {
	const result = mapEval(map, { ...input, spartakBoost: 0.5 })
	expect(result.battlepoints).toBe(150)
	expect(result.rep).toBe(300)
	expect(result.brt).toBe(75)
	expect(result.matchesPerDay).toBe(5)
	expect(result.repPerDay).toBe(1500)
})

test('plan picks daily reputation throughput, not highest per-match reward', () => {
	const slow = { ...map, id: 'slow', durationMin: 58, maxPersonal: 200 }
	const result = buildPlan([slow, map], input)
	expect(result).toEqual({
		map,
		repNeeded: 9500,
		totalMatches: 48,
		matchesPerDay: 5,
		days: 10,
	})
})

test('empty maps or satisfied target have no work remaining', () => {
	expect(buildPlan([], input)).toBeNull()
	expect(repNeededForInput({ ...input, targetLevel: 0 })).toBe(0)
	expect(buildPlan([map], { ...input, targetLevel: 0 })?.totalMatches).toBe(0)
})

test('zero gaming hours currently reports zero days despite remaining matches', () => {
	const result = buildPlan([map], { ...input, hoursPerDay: 0 })
	expect(result?.totalMatches).toBe(48)
	expect(result?.days).toBe(0)
})
