import type {
	DamageDistanceInfoBlock,
	ElementListBlock,
	Item,
} from '@/types/item.type'

export function getNumericStat(item: Item, key: string): number {
	for (const block of item.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'numeric' &&
				el.name?.type === 'translation' &&
				el.name.key === key
			) {
				return el.value ?? 0
			}
		}
	}

	return 0
}

export function getDamageVariant(item: Item, variantIndex: number): number {
	let values: number[] = []

	for (const block of item.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'numericVariants' &&
				el.name?.type === 'translation' &&
				el.name.key === 'core.tooltip.stat_name.damage_type.direct'
			) {
				values = el.value ?? []
				break
			}
		}
		if (values.length) break
	}

	if (!values.length) return 0
	const idx = Math.min(Math.max(variantIndex, 0), values.length - 1)
	return values[idx] ?? 0
}

export function getDamageBlock(
	item: Item | undefined | null
): DamageDistanceInfoBlock | null {
	if (!item) return null

	for (const block of item.infoBlocks) {
		if (block.type === 'damage') {
			return block as DamageDistanceInfoBlock
		}
	}

	return null
}

export function getDamageModifiers(item: Item): {
	head: number
	limbs: number
} {
	for (const block of item.infoBlocks) {
		if (block.type !== 'list') continue

		const b = block as ElementListBlock

		if (
			b.title?.type === 'translation' &&
			b.title.key === 'weapon.tooltip.weapon.info.damage_modifiers'
		) {
			let head = 1.4
			let limbs = 0.8

			for (const el of b.elements ?? []) {
				if (el.type !== 'text' || el.text?.type !== 'translation')
					continue

				const args = el.text.args as Record<string, string> | undefined
				const mod = Number.parseFloat(args?.modifier ?? '1')

				if (
					el.text.key === 'weapon.tooltip.weapon.head_damage_modifier'
				) {
					head = Number.isFinite(mod) ? mod : head
				}

				if (
					el.text.key ===
					'weapon.tooltip.weapon.limbs_damage_modifier'
				) {
					limbs = Number.isFinite(mod) ? mod : limbs
				}
			}

			return { head, limbs }
		}
	}

	return { head: 1.4, limbs: 0.8 }
}
