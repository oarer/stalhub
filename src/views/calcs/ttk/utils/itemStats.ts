import type {
	DamageDistanceInfoBlock,
	InfoBlock,
	Item,
} from '@/types/item.type'
import { collectListBlocks, collectListElements } from '@/utils/itemUtils'
import { HOLD_MAX_TIME, isHoldWeapon } from '../constants/ttk'

export function getNumericStat(item: Item, key: string): number {
	for (const el of collectListElements(item.infoBlocks)) {
		if (
			el.type === 'numeric' &&
			el.name?.type === 'translation' &&
			el.name.key === key
		) {
			return el.value ?? 0
		}
	}

	return 0
}

export function getDamageVariant(
	item: Item,
	variantIndex: number,
	holdTime = 0
): number {
	let values: number[] | [number, number][] = []

	for (const el of collectListElements(item.infoBlocks)) {
		if (
			el.type === 'numericVariants' &&
			el.name?.type === 'translation' &&
			el.name.key === 'core.tooltip.stat_name.damage_type.direct'
		) {
			values = el.value ?? []
			break
		}
	}

	if (!values.length) return 0
	const idx = Math.min(Math.max(variantIndex, 0), values.length - 1)
	const v = values[idx] ?? null
	if (v === null) return 0
	if (Array.isArray(v)) {
		const pair = v as [number, number]
		if (isHoldWeapon(item.id)) {
			const t = Math.max(0, Math.min(1, (holdTime ?? 0) / HOLD_MAX_TIME))
			const min = pair[0] ?? 0
			const max = pair[1] ?? 0
			return min + t * (max - min)
		}
		return Math.max(pair[0] ?? 0, pair[1] ?? 0)
	}
	return v
}

export function getDamageBlock(
	item: Item | undefined | null
): DamageDistanceInfoBlock | null {
	if (!item) return null

	const find = (
		blocks: InfoBlock[] | undefined
	): DamageDistanceInfoBlock | null => {
		if (!Array.isArray(blocks)) return null
		for (const block of blocks) {
			if (!block) continue
			if (block.type === 'damage') {
				return block as DamageDistanceInfoBlock
			}
			if (block.type === 'grouped') {
				const nested = find(block.compact) ?? find(block.detailed)
				if (nested) return nested
			}
		}
		return null
	}

	return find(item.infoBlocks)
}

export function getDamageModifiers(item: Item): {
	head: number
	limbs: number
} {
	for (const block of collectListBlocks(item.infoBlocks)) {
		if (
			block.title?.type === 'translation' &&
			block.title.key === 'weapon.tooltip.weapon.info.damage_modifiers'
		) {
			let head = 1.4
			let limbs = 0.8

			for (const el of block.elements ?? []) {
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
