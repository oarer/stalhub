import type { Item } from '@/types/item.type'
import { collectListElements } from '@/utils/itemUtils'

export function getPlateDamageAbsorption(plate: Item): number {
	for (const el of collectListElements(plate.infoBlocks)) {
		if (
			el.type === 'numeric' &&
			el.name?.type === 'translation' &&
			el.name.key ===
				'stalker.tooltip.armor_plate.stat_name.damage_absorption'
		) {
			return el.value ?? 0
		}
	}

	return 0
}

export function getPlateMaxDurability(plate: Item): number {
	for (const el of collectListElements(plate.infoBlocks)) {
		if (
			el.type === 'numeric' &&
			el.name?.type === 'translation' &&
			el.name.key === 'stalker.tooltip.armor_plate.stat_name.armor'
		) {
			return el.value ?? 0
		}
	}

	return 0
}
