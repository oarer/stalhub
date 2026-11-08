import { describe, expect, test } from 'bun:test'
import { selectHeroLoadout } from '@/views/player/components/hero/heroModelLoadout'
import type { PlayerGearResponse } from '@/types/playerGear.type'

function gear(
	items: Partial<PlayerGearResponse['items'][number]>[]
): PlayerGearResponse {
	return {
		name: 'Tester',
		items: items as PlayerGearResponse['items'],
	}
}

describe('player hero model loadout', () => {
	test('uses heavy stance and the preferred primary weapon', () => {
		const result = selectHeroLoadout(
			gear([
				{
					slotType: 'armor',
					render: { model: null, armor: { menuHeavy: true } },
				},
				{
					slotType: 'primary_weapon',
					render: {
						model: null,
						weapon: {
							menuClass: 'primary',
							attach: {
								bone: 'r_arm_wpn',
								position: [0, 0, 0],
								rotation: [0, 0, 0],
								scale: [1, 1, 1],
								fallback: true,
							},
						},
					},
				},
				{ slotType: 'melee', render: null },
			]),
			['menu_default_stand_primary_heavy']
		)

		expect(result.stance).toBe('heavy')
		expect(result.weaponClass).toBe('primary')
		expect(result.animationName).toBe('menu_default_stand_primary_heavy')
	})

	test('falls back to slim unarmed stance without gear metadata', () => {
		const result = selectHeroLoadout(gear([]), [
			'menu_default_stand_unarmed_slim',
			'menu_default_stand_unarmed_heavy',
		])

		expect(result.weaponClass).toBe('unarmed')
		expect(result.stance).toBe('slim')
		expect(result.animationName).toBe('menu_default_stand_unarmed_slim')
	})
})
