import { expect, test } from 'bun:test'
import {
	computeAverageWeaponTTK,
	computeWeaponTTK,
	formatTierTtk,
	isAggregateScenario,
	parseScenarioName,
	pickBestAmmo,
} from '@/views/tierlists/utils/tier-ttk'
import { ammo, weapon } from './fixtures'

test('scenario parses case-insensitive HP/vitality/zone and defaults missing values', () => {
	expect(parseScenarioName('600 HP, Vit 20, HEAD')).toEqual({
		bulletRes: 600,
		vitality: 20,
		hitZone: 'head',
	})
	expect(parseScenarioName('limbs')).toEqual({
		bulletRes: 400,
		vitality: 10,
		hitZone: 'limbs',
	})
	expect(parseScenarioName(null)).toEqual({
		bulletRes: 400,
		vitality: 10,
		hitZone: 'body',
	})
	expect(isAggregateScenario('400-800 HP, 100-130 Vit')).toBe(true)
	expect(isAggregateScenario('400 HP, Vit 10')).toBe(false)
})

test('best ammo excludes incompatible high-penetration rounds and preserves first tie', () => {
	const best = ammo('556', 'bb', 50)
	expect(
		pickBestAmmo(weapon(), [
			ammo('939', 'bb', 100),
			best,
			ammo('556', 'tie', 50),
		])
	).toBe(best)
	expect(pickBestAmmo(weapon(), [ammo('939')])).toBeNull()
})

test('tier calculation integrates chosen ammo with resistance and localized label', () => {
	const selected = ammo('556', 'bb', 50)
	selected.name = {
		type: 'translation',
		key: 'item.amm.556bb.name',
		args: {},
		lines: { en: 'AP rounds', ru: 'ББ' },
	}
	const result = computeWeaponTTK(
		weapon(),
		[selected],
		{ bulletRes: 100, vitality: 0, hitZone: 'body' },
		'en'
	)
	expect(result).toEqual({ ttk: 0.30000000000000004, ammoName: 'AP rounds' })
})

test('aggregate setups are deterministic and slower weapons rank worse', () => {
	const fast = computeAverageWeaponTTK(weapon(), [], 'body', 'en')
	expect(computeAverageWeaponTTK(weapon(), [], 'body', 'en')).toEqual(fast)
	expect(fast.ttk).toBeGreaterThan(0)
	expect(
		computeAverageWeaponTTK(weapon({ rof: 300 }), [], 'body', 'en').ttk
	).toBeCloseTo(fast.ttk * 2)
})

test('invalid and one-shot TTK display as dash', () => {
	for (const value of [0, -1, Number.NaN, Number.POSITIVE_INFINITY])
		expect(formatTierTtk(value)).toBe('—')
	expect(formatTierTtk(1.234)).toBe('1.23')
})
