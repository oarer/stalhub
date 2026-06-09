import type { ParsedItem } from '@/types/artifact.type'
import type {
	AddStatBlock,
	ElementListBlock,
	InfoElement,
	Item,
	Locale,
	NumericElement,
	NumericRangeElement,
} from '@/types/item.type'
import {
	isNumericElement,
	isRangeElement,
	messageToString,
} from '@/utils/itemUtils'

function createEmptyParsedItem(): ParsedItem {
	return {
		statRanges: {},
		baseStats: {},
		addStats: {},
		displayNames: {},
		localizedToKey: {},
	}
}

type StatPushers = ReturnType<typeof createStatPushers>

function createStatPushers() {
	const statRanges: ParsedItem['statRanges'] = {}
	const baseStats: ParsedItem['baseStats'] = {}
	const addStats: ParsedItem['addStats'] = {}
	const displayNames: ParsedItem['displayNames'] = {}
	const localizedToKey: ParsedItem['localizedToKey'] = {}

	function pushRange(
		key: string,
		v0: number,
		v100: number,
		display?: string,
		color?: string,
		isPercent?: boolean
	) {
		if (!key) return
		statRanges[key] = { v0, v100, color: color ?? 'inherit', isPercent }
		if (display) {
			displayNames[key] = display
			localizedToKey[display.trim().toLowerCase()] = key
		}
	}

	function pushBase(key: string, val: number, display?: string) {
		if (!key) return
		if (key in statRanges) return
		baseStats[key] = (baseStats[key] ?? 0) + val
		if (display) {
			displayNames[key] = display
			localizedToKey[display.trim().toLowerCase()] = key
		}
	}

	function pushAddRange(
		key: string,
		v0: number,
		v100: number,
		color: string,
		display?: string,
		isPercent?: boolean
	) {
		if (!key) return

		const prev = addStats[key]

		if (!prev) {
			addStats[key] = { v0, v100, color, isPercent }
		} else {
			addStats[key] = {
				v0: prev.v0 + v0,
				v100: prev.v100 + v100,
				color: prev.color || color,
				isPercent: prev.isPercent ?? isPercent,
			}
		}

		if (display) {
			displayNames[key] = display
			localizedToKey[display.trim().toLowerCase()] = key
		}
	}

	function toResult(): ParsedItem {
		return { statRanges, baseStats, addStats, displayNames, localizedToKey }
	}

	return { pushRange, pushBase, pushAddRange, toResult }
}

function extractStatKey(el: InfoElement): string | null {
	if (!isRangeElement(el)) return null
	if (isNumericElement(el)) return null

	return el.name.type === 'translation' && el.name.key.length > 0
		? el.name.key
		: null
}

function resolveDisplayName(
	el: InfoElement,
	key: string,
	locale: Locale
): string {
	if (!isRangeElement(el)) return key

	try {
		const s = messageToString(el.name, locale)
		return s && s.trim().length > 0 ? s : key
	} catch {
		return key
	}
}

function processAddStatBlock(
	block: AddStatBlock,
	locale: Locale,
	pushers: StatPushers
) {
	for (const el of block.elements) {
		if (!el) continue

		const key = extractStatKey(el)
		if (!key) continue

		const display = resolveDisplayName(el, key, locale)

		const colorRaw = el.formatted?.valueColor as string | undefined
		const color = colorRaw?.replace(/^#/, '') ?? ''
		const formattedVal = el.formatted?.value as
			| Record<string, string>
			| undefined
		const isPercent = Object.values(formattedVal ?? {}).some((s) =>
			s.includes('%')
		)

		if (el.type === 'numeric') {
			const v = Number(el.value ?? 0)
			if (Number.isFinite(v)) {
				pushers.pushAddRange(key, v, v, color, display, isPercent)
			}
		} else if (el.type === 'range') {
			const v0 = Number(el.min ?? 0)
			const v100 = Number(el.max ?? 0)
			if (!Number.isNaN(v0) && !Number.isNaN(v100)) {
				pushers.pushAddRange(key, v0, v100, color, display, isPercent)
			}
		}
	}
}

function processListBlock(
	block: ElementListBlock,
	locale: Locale,
	pushers: StatPushers
) {
	for (const el of block.elements) {
		if (!el) continue

		if (el.type === 'numeric' && 'name' in el) {
			const key = extractStatKey(el)
			if (!key) continue
			const display = resolveDisplayName(el, key, locale)
			const v = Number((el as NumericElement).value ?? 0)
			if (Number.isFinite(v)) pushers.pushBase(key, v, display)
		} else if (el.type === 'range' && 'name' in el) {
			const color = el.formatted?.valueColor
			const formattedVal = el.formatted?.value as
				| Record<string, string>
				| undefined
			const isPercent = Object.values(formattedVal ?? {}).some((s) =>
				s.includes('%')
			)

			const key = extractStatKey(el)
			if (!key) continue
			const display = resolveDisplayName(el, key, locale)
			const v0 = Number((el as NumericRangeElement).min ?? 0)
			const v100 = Number((el as NumericRangeElement).max ?? 0)
			if (!Number.isNaN(v0) && !Number.isNaN(v100))
				pushers.pushRange(key, v0, v100, display, color, isPercent)
		}
	}
}

export function parseItemStats(item: Item, locale: Locale): ParsedItem {
	if (!item?.infoBlocks || !Array.isArray(item.infoBlocks)) {
		return createEmptyParsedItem()
	}

	const pushers = createStatPushers()

	for (const block of item.infoBlocks) {
		if (
			!block ||
			!Array.isArray((block as ElementListBlock | AddStatBlock).elements)
		)
			continue

		if (block.type === 'addStat') {
			processAddStatBlock(block as AddStatBlock, locale, pushers)
		}

		if (block.type === 'list') {
			processListBlock(block as ElementListBlock, locale, pushers)
		}
	}

	return pushers.toResult()
}
