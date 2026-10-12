import { describe, expect, test } from 'bun:test'
import {
	getAmmoType,
	getCompatibleAmmo,
	pickDefaultAmmo,
} from '@/views/calcs/ttk/utils/ammo'
import { getDmgPerShot } from '@/views/calcs/ttk/utils/damage'
import { getDamageVariant } from '@/views/calcs/ttk/utils/itemStats'
import { buildSeries } from '@/views/calcs/ttk/utils/series'
import { calcTTKAtDist } from '@/views/calcs/ttk/utils/ttk'
import { ammo, item, plate, translation, weapon } from './fixtures'

describe('ammo selection', () => {
	test.each(['556', '545', '762', '9', '939', '127', '23'])(
		'matches exact %s caliber, not numeric prefixes',
		(caliber) => {
			const match = ammo(caliber, 'bb')
			expect(
				getCompatibleAmmo(
					[ammo(`${caliber}0`), match, item('plain')],
					`item.wpn.display_ammo_types.${caliber}mm`
				)
			).toEqual([match])
		}
	)
	test.each([
		['12', '12gauge'],
		['10', '10gauge'],
	])('maps %s shotgun ammunition', (caliber, key) => {
		const match = ammo(caliber)
		expect(
			getCompatibleAmmo(
				[match, ammo('127')],
				`item.wpn.display_ammo_types.${key}`
			)
		).toEqual([match])
	})
	test('unknown caliber is empty and weapon ammo key is extracted', () => {
		expect(getAmmoType(weapon())).toBe('item.wpn.display_ammo_types.556mm')
		expect(getCompatibleAmmo([ammo()], 'unknown')).toEqual([])
	})
	test('defaults prefer armor piercing, then standard, then first available', () => {
		const special = ammo('556', 'special'),
			standard = ammo(),
			piercing = ammo('556', 'bb')
		expect(pickDefaultAmmo([special, standard, piercing])).toBe(piercing)
		expect(pickDefaultAmmo([special, standard])).toBe(standard)
		expect(pickDefaultAmmo([special])).toBe(special)
		expect(pickDefaultAmmo([])).toBeNull()
	})
})

describe('damage and time to kill', () => {
	test.each([
		[0, 40],
		[10, 40],
		[20, 30],
		[30, 20],
		[50, 20],
	])('distance %s interpolates to %s damage', (distance, expected) => {
		expect(getDmgPerShot(weapon(), null, 'body', distance, 0)).toBe(
			expected
		)
	})
	test('combines ammo, modules, hit zones and body-only plates', () => {
		const mods = { startMult: 2, endMult: 1, headMult: 25 }
		expect(
			getDmgPerShot(
				weapon(),
				ammo('556', 'st', 0, 50),
				'head',
				0,
				0,
				plate(),
				mods
			)
		).toBeCloseTo(210)
		expect(getDmgPerShot(weapon(), null, 'body', 0, 0, plate())).toBe(20)
		expect(getDmgPerShot(weapon(), null, 'limbs', 0, 0, plate())).toBe(32)
	})
	test('overlapping first/last magazine bonuses multiply', () => {
		expect(
			getDmgPerShot(
				weapon(),
				null,
				'body',
				0,
				0,
				null,
				{ startMult: 1, endMult: 1, first5Bonus: 50, last5Bonus: 100 },
				0,
				3,
				5
			)
		).toBe(120)
	})
	test('hold variants interpolate and clamp charge duration and variant index', () => {
		const w = weapon({ id: '969kl' })
		w.infoBlocks.push({
			type: 'list',
			title: translation('variants'),
			elements: [
				{
					type: 'numericVariants',
					name: translation(
						'core.tooltip.stat_name.damage_type.direct'
					),
					value: [
						[20, 60],
						[40, 80],
					],
				},
			],
		})
		expect(getDamageVariant(w, -1, -1)).toBe(20)
		expect(getDamageVariant(w, 0, 0.25)).toBe(40)
		expect(getDamageVariant(w, 99, 1)).toBe(80)
		w.id = 'normal'
		expect(getDamageVariant(w, 0)).toBe(60)
	})
	test('first shot is immediate, reload only occurs after magazine is exhausted', () => {
		expect(
			calcTTKAtDist(
				weapon({ damage: 100, mag: 1 }),
				null,
				0,
				0,
				'body',
				0,
				0,
				false
			)
		).toEqual({ shots: 1, ttk: 0 })
		expect(
			calcTTKAtDist(weapon({ mag: 3 }), null, 0, 0, 'body', 0, 0, false)
		).toEqual({ shots: 3, ttk: 0.2 })
		expect(
			calcTTKAtDist(weapon({ mag: 2 }), null, 0, 0, 'body', 0, 0, false)
		).toEqual({ shots: 3, ttk: 2.2 })
	})
	test('penetration reduces resistance before vitality scaling', () => {
		const result = calcTTKAtDist(
			weapon(),
			ammo('556', 'bb', 50),
			100,
			100,
			'body',
			0,
			0,
			false
		)
		expect(result.shots).toBe(8)
		expect(result.ttk).toBeCloseTo(0.7)
	})
	test('plate absorbs the breaking shot and subsequent shots are unplated', () => {
		expect(
			calcTTKAtDist(weapon(), null, 0, 0, 'body', 0, 0, false, plate())
		).toEqual({ shots: 3, ttk: 0.2 })
		expect(
			calcTTKAtDist(
				weapon(),
				null,
				0,
				0,
				'body',
				0,
				0,
				false,
				plate(50, 1000)
			).shots
		).toBe(5)
		expect(
			calcTTKAtDist(weapon(), null, 0, 0, 'body', 0, 0, false, plate(), 0)
				.shots
		).toBe(3)
	})
	test('magazine bonuses restart after reload', () => {
		const result = calcTTKAtDist(
			weapon({ damage: 10, mag: 6 }),
			null,
			0,
			0,
			'body',
			0,
			0,
			false,
			null,
			undefined,
			{ startMult: 1, endMult: 1, first5Bonus: 100 }
		)
		expect(result.shots).toBe(5)
		const extended = calcTTKAtDist(
			weapon({ damage: 10, mag: 6 }),
			null,
			0,
			100,
			'body',
			0,
			0,
			false,
			null,
			undefined,
			{ startMult: 1, endMult: 1, first5Bonus: 100 }
		)
		expect(extended.shots).toBe(11)
		expect(extended.ttk).toBe(3)
	})
	test('custom burst cadence includes inter-burst delay', () => {
		const w = weapon({ id: 'y37kw', damage: 25 })
		expect(
			calcTTKAtDist(w, null, 0, 0, 'body', 0, 0, true).ttk
		).toBeCloseTo(0.25)
		expect(
			calcTTKAtDist(w, null, 0, 0, 'body', 0, 0, false).ttk
		).toBeCloseTo(0.3)
	})
	test('missing damage and zero rate return an empty result', () => {
		expect(calcTTKAtDist(item(), null, 0, 0, 'body', 0, 0, false)).toEqual({
			shots: 0,
			ttk: 0,
		})
		expect(
			calcTTKAtDist(weapon({ rof: 0 }), null, 0, 0, 'body', 0, 0, false)
		).toEqual({ shots: 0, ttk: 0 })
		expect(
			calcTTKAtDist(
				weapon({ damage: 0 }),
				null,
				0,
				0,
				'body',
				0,
				0,
				false
			)
		).toEqual({ shots: 0, ttk: 0 })
	})
	test('chart includes fractional final distance once', () => {
		const points = buildSeries(
			weapon({ maxDistance: 2.5 }),
			null,
			0,
			0,
			'body',
			0,
			false
		).points
		expect(points).toEqual(
			[0, 1, 2, 2.5].map((x) => ({ x, y: 0.2, shots: 3 }))
		)
		expect(
			buildSeries(item(), null, 0, 0, 'body', 0, false).points
		).toEqual([])
	})
})
