import type { ElementListBlock, Item } from '@/types/item.type'

export function getPlateDamageAbsorption(plate: Item): number {
	for (const block of plate.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'numeric' &&
				el.name?.type === 'translation' &&
				el.name.key ===
					'stalker.tooltip.armor_plate.stat_name.damage_absorption'
			) {
				return el.value ?? 0
			}
		}
	}

	return 0
}

export function getPlateMaxDurability(plate: Item): number {
	for (const block of plate.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'numeric' &&
				el.name?.type === 'translation' &&
				el.name.key === 'stalker.tooltip.armor_plate.stat_name.armor'
			) {
				return el.value ?? 0
			}
		}
	}

	return 0
}
