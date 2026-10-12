import { expect, test } from 'bun:test'
import {
	armorItemKeysForLevel,
	computeUpgrade,
} from '@/views/calcs/upgrade/utils/upgrade'

const costs = {
	artifactKey: 'art.blizzard_crystal',
	attemptCost: 100,
	useAmplifier: false,
	amplifierCost: 10,
	energyPrice: 2,
}

test('armor expected attempts use truncated geometric distribution at pity limit', () => {
	const result = computeUpgrade('armor', 3, 4, 'luck', costs)
	expect(result.totalAttempts).toBe(1.875)
	expect(result.totalParts).toBe(1.875)
	expect(result.totalTools).toBe(1.875)
	expect(result.totalMoney).toBe(198.75)
	expect(result.totalEnergy).toBe(0)
})

test('guarantee budgets sum all levels with per-band item prices', () => {
	const result = computeUpgrade('armor', 4, 6, 'guarantee', costs, {
		cheap_parts: 2,
		cheap_tools: 4,
		standard_parts: 10,
		standard_tools: 20,
	})
	expect(
		result.rows.map((r) => [r.targetLevel, r.attempts, r.levelCost])
	).toEqual([
		[5, 5, 530],
		[6, 10, 1300],
	])
	expect(result.totalAttempts).toBe(15)
	expect(result.totalMoney).toBe(1830)
	expect(result.totalParts).toBe(15)
})

test('zero item prices are retained while null and missing prices default', () => {
	expect(
		computeUpgrade('armor', 0, 1, 'luck', costs, {
			cheap_parts: 0,
			cheap_tools: null,
		}).totalMoney
	).toBe(103)
})

test.each([
	[5, 'cheap'],
	[6, 'standard'],
	[10, 'standard'],
	[11, 'advanced'],
	[15, 'advanced'],
] as const)('level %s selects %s material band', (level, band) => {
	const keys = armorItemKeysForLevel(Number(level))
	expect(keys.partsKey).toBe(`${band}_parts`)
	expect(keys.toolsKey).toBe(`${band}_tools`)
})

test('artifact expected attempts include increasing chance after failure', () => {
	const result = computeUpgrade('artefact', 0, 1, 'luck', costs)
	expect(result.totalAttempts).toBe(1.5)
	expect(result.totalEnergy).toBe(675)
	expect(result.totalMoney).toBe(1350)
	expect(result.totalTools).toBe(1.5)
	expect(result.durabilityAfter).toBe(0.99)
})

test('amplifier guarantees first artifact level and adds cost', () => {
	const result = computeUpgrade('artefact', 0, 1, 'guarantee', {
		...costs,
		useAmplifier: true,
	})
	expect(result.totalAttempts).toBe(1)
	expect(result.totalMoney).toBe(910)
	expect(result.durabilityAfter).toBe(1)
})

test('level 15 ignores amplifier chance but still charges amplifier', () => {
	const plain = computeUpgrade('artefact', 14, 15, 'luck', costs)
	const amplified = computeUpgrade('artefact', 14, 15, 'luck', {
		...costs,
		useAmplifier: true,
	})
	expect(amplified.totalAttempts).toBe(plain.totalAttempts)
	expect(amplified.totalMoney - plain.totalMoney).toBeCloseTo(
		plain.totalAttempts * 10
	)
})

test('unknown artifact has zero energy and high-level guarantee durability has a floor', () => {
	const result = computeUpgrade('artefact', 14, 15, 'guarantee', {
		...costs,
		artifactKey: 'unknown',
	})
	expect(result.totalEnergy).toBe(0)
	expect(result.durabilityAfter).toBe(0.2)
})

test('bounds clamp to 0..15 and equal/reversed ranges still upgrade one level', () => {
	expect(computeUpgrade('armor', -10, 99, 'luck', costs).rows).toHaveLength(
		15
	)
	expect(
		computeUpgrade('armor', 5, 2, 'luck', costs).rows.map(
			(r) => r.targetLevel
		)
	).toEqual([6])
	expect(
		computeUpgrade('armor', 15, 15, 'luck', costs).rows.map(
			(r) => r.targetLevel
		)
	).toEqual([15])
})
