import type { Item } from '@/types/item.type'
import type { TTKSeries } from '../components/TTKChart'
import { type HitZone } from '../constants/ttk'
import { getDamageBlock } from './itemStats'
import { calcTTKAtDist } from './ttk'

export function buildSeries(
	weapon: Item,
	ammo: Item | null,
	bulletRes: number,
	vitality: number,
	hitZone: HitZone,
	variantIndex: number,
	useBurstRof: boolean,
	plate?: Item | null,
	plateDurability?: number
): TTKSeries {
	const block = getDamageBlock(weapon)
	const label =
		weapon.name?.type === 'translation' ? (weapon.name.lines?.ru ?? '') : ''

	if (!block) return { label, color: '', labelColor: '', points: [] }

	const step = 1
	const points: { x: number; y: number; shots: number }[] = []

	for (let d = 0; d <= block.maxDistance; d += step) {
		const result = calcTTKAtDist(
			weapon,
			ammo,
			bulletRes,
			vitality,
			hitZone,
			d,
			variantIndex,
			useBurstRof,
			plate,
			plateDurability
		)
		points.push({
			x: d,
			y: result.ttk,
			shots: result.shots,
		})
	}

	if (points[points.length - 1]?.x !== block.maxDistance) {
		const result = calcTTKAtDist(
			weapon,
			ammo,
			bulletRes,
			vitality,
			hitZone,
			block.maxDistance,
			variantIndex,
			useBurstRof,
			plate,
			plateDurability
		)
		points.push({
			x: block.maxDistance,
			y: result.ttk,
			shots: result.shots,
		})
	}

	return { label, color: '', labelColor: '', points }
}
