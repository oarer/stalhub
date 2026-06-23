import type { ElementListBlock, Item } from '@/types/item.type'

export function getAmmoType(item: Item): string {
	for (const block of item.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'key-value' &&
				el.key?.type === 'translation' &&
				el.key.key === 'weapon.tooltip.weapon.info.ammo_type'
			) {
				return el.value?.type === 'translation' ? el.value.key : ''
			}
		}
	}

	return ''
}

export function getAmmoDamageBonus(ammo: Item): number {
	for (const block of ammo.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'numeric' &&
				el.name?.type === 'translation' &&
				el.name.key === 'weapon.tooltip.bullet.stat_name.damage'
			) {
				return el.value ?? 0
			}
		}
	}

	return 0
}

export function getAmmoPenetration(ammo: Item): number {
	for (const block of ammo.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'numeric' &&
				el.name?.type === 'translation' &&
				el.name.key === 'weapon.tooltip.bullet.stat_name.piercing'
			) {
				return el.value ?? 0
			}
		}
	}

	return 0
}

export const AMMO_TYPE_MAP: Record<string, string[]> = {
	'item.wpn.display_ammo_types.556mm': ['item.amm.556'],
	'item.wpn.display_ammo_types.545mm': ['item.amm.545'],
	'item.wpn.display_ammo_types.762mm': ['item.amm.762'],
	'item.wpn.display_ammo_types.9mm': ['item.amm.9'],
	'item.wpn.display_ammo_types.939mm': ['item.amm.939'],
	'item.wpn.display_ammo_types.127mm': ['item.amm.127'],
	'item.wpn.display_ammo_types.12gauge': ['item.amm.12'],
	'item.wpn.display_ammo_types.10gauge': ['item.amm.10'],
	'item.wpn.display_ammo_types.23mm': ['item.amm.23'],
}

export function getCompatibleAmmo(
	ammoItems: Item[],
	ammoTypeKey: string
): Item[] {
	const prefixes = AMMO_TYPE_MAP[ammoTypeKey]
	if (!prefixes) return []

	return ammoItems.filter((a) => {
		const nameKey = a.name?.type === 'translation' ? a.name.key : ''
		if (!nameKey.startsWith('item.amm.')) return false

		const normalized = nameKey.replace(/\.name$/, '')
		const itemCaliber = normalized.split('.')[2]?.match(/^\d+/)?.[0]
		if (!itemCaliber) return false

		return prefixes.some((p) => p === `item.amm.${itemCaliber}`)
	})
}
