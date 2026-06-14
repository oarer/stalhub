'use client'

import type {
	AddStatBlock,
	ElementListBlock,
	InfoElement,
	Item,
	Locale,
	NumericElement,
	NumericRangeElement,
	NumericVariantsElement,
} from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'

export const BUILD_HIDDEN_STAT_KEYS = new Set<string>([
	'stalker.tooltip.item.lifesaver_sniper.info.trigger_damage',
])

export const BUILD_STAT_COLORS: Record<string, string> = {
	'stalker.tooltip.item.lifesaver_sniper.info.blocking_damage': '#EEEEEE',
	'stalker.tooltip.item.lifesaver.info.recharge': '#EEEEEE',
	'stalker.tooltip.item.lifesaver.info.cost': '#EEEEEE',
}

export const HIDDEN_STAT_KEYS = new Set([
	'core.tooltip.info.weight',
	'core.tooltip.info.durability',
	'core.tooltip.info.max_durability',
	'stalker.tooltip.artefact.not_probed',
	'stalker.tooltip.artefact.info.freshness',
	'stalker.tooltip.artefact.info.durability',
	'stalker.tooltip.artefact.info.max_durability',
	'stalker.lore.armor_artefact.info.compatible_backpacks',
	'general.armor.compatibility.backpacks.superheavy',
	'stalker.lore.armor_artefact.info.compatible_containers',
	'general.armor.compatibility.containers.bulky',
	'item.att.temp_model_armor.additional_stats_tip',
	'core.tooltip.stat_name.damage_type.direct',
	'stalker.tooltip.medicine.info.toxicity',
	'stalker.tooltip.medicine.info.duration',
	'stalker.tooltip.medicine.info.priority',
	'stalker.tooltip.backpack.stat_name.inner_protection',
	'stalker.tooltip.backpack.stat_name.effectiveness',
	'stalker.tooltip.backpack.info.size',
])

type RelevantBlock = ElementListBlock | AddStatBlock

const isRelevantBlock = (
	block: NonNullable<Item['infoBlocks']>[number]
): block is RelevantBlock => {
	return block.type === 'list' || block.type === 'addStat'
}

const getBlockElements = (block: RelevantBlock): InfoElement[] => {
	return Array.isArray(block.elements) ? block.elements : []
}

const findElementByKey = (item: Item, key: string): InfoElement | null => {
	if (!item.infoBlocks) return null

	for (const block of item.infoBlocks) {
		if (!isRelevantBlock(block)) continue

		for (const el of getBlockElements(block)) {
			if (!el) continue
			if (getElementKey(el) === key) return el
		}
	}

	return null
}

export function isNumericEl(el: InfoElement): el is NumericElement {
	return el.type === 'numeric'
}

export function isRangeEl(el: InfoElement): el is NumericRangeElement {
	return el.type === 'range'
}

export function isNumericVariantsEl(
	el: InfoElement
): el is NumericVariantsElement {
	return el.type === 'numericVariants'
}

export function getElementKey(el: InfoElement): string | null {
	if ('name' in el && el.name?.type === 'translation') {
		return el.name.key
	}
	return null
}

export function getItemKeys(item: Item): Set<string> {
	const keys = new Set<string>()
	if (!item.infoBlocks) return keys

	for (const block of item.infoBlocks) {
		if (!isRelevantBlock(block)) continue

		for (const el of getBlockElements(block)) {
			if (!el) continue
			const key = getElementKey(el)
			if (key) keys.add(key)
		}
	}

	return keys
}

export function getNumericValue(
	item: Item,
	key: string,
	numericVariants: number = 0
): number {
	const el = findElementByKey(item, key)
	if (!el) return 0

	if (isNumericEl(el)) {
		return Number(el.value ?? 0)
	}

	if (isRangeEl(el)) {
		const min = Number(el.min ?? 0)
		const max = Number(el.max ?? 0)
		const percent = numericVariants / 15
		return min + (max - min) * percent
	}

	if (isNumericVariantsEl(el)) {
		const values = el.value ?? []
		const index = Math.min(Math.max(numericVariants, 0), values.length - 1)
		return Number(values[index] ?? 0)
	}

	return 0
}

export function getDisplayName(
	item: Item,
	key: string,
	locale: Locale
): string {
	const el = findElementByKey(item, key)
	if (!el) return key

	if ('name' in el) {
		return messageToString(el.name, locale)
	}

	return key
}
