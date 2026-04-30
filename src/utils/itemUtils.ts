import { getLocale } from '@/lib/getLocale'
import type {
	InfoBlock,
	InfoElement,
	Item,
	Locale,
	Message,
} from '@/types/item.type'

export type Formatted = {
	value?: Record<string, string>
	nameColor?: string
	valueColor?: string
}

export const roundNumber = (n: number): string => {
	return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

export const isPriceElement = (
	el: InfoElement
): el is Extract<InfoElement, { type: 'price' }> => el.type === 'price'

export const isNumericVariantsBlock = (
	el: InfoElement
): el is Extract<InfoElement, { type: 'numericVariants' }> =>
	el.type === 'numericVariants'

export const isItemElement = (
	el: InfoElement
): el is Extract<InfoElement, { type: 'item' }> => el.type === 'item'

export const isTextElement = (
	el: InfoElement
): el is Extract<InfoElement, { type: 'text' }> => el.type === 'text'

export const isKeyValueElement = (
	el: InfoElement
): el is Extract<InfoElement, { type: 'key-value' }> => el.type === 'key-value'

export const isNumericElement = (
	el: InfoElement
): el is Extract<InfoElement, { type: 'numeric' }> => el.type === 'numeric'

export const isRangeElement = (
	el: InfoElement
): el is Extract<InfoElement, { type: 'range' }> => el.type === 'range'

export const isUsageElement = (
	el: InfoElement
): el is Extract<InfoElement, { type: 'usage' }> => el.type === 'usage'

export const hasFormatted = (v: unknown): v is { formatted?: Formatted } =>
	typeof v === 'object' && v !== null && 'formatted' in (v as object)

export const messageToString = (
	m: Message | undefined,
	locale: Locale
): string => {
	if (!m) return ''
	if (m.type === 'text') return m.text ?? ''
	if (m.type === 'translation') {
		return (
			m.lines?.[locale] ?? Object.values(m.lines ?? {})[0] ?? m.key ?? ''
		)
	}

	if (typeof m === 'object') {
		return (
			(m as Record<string, string>)[locale] ?? Object.values(m)[0] ?? ''
		)
	}

	return ''
}

export const humanizeCategory = (cat?: string) => {
	if (!cat) return ''
	return cat
		.split('/')
		.map((part) =>
			part.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
		)
		.join(' › ')
}

export const findCategoryInBlocks = (
	infoBlocks: InfoBlock[],
	locale?: Locale
) => {
	if (!Array.isArray(infoBlocks)) return ''

	const loc = locale ?? getLocale()

	for (const block of infoBlocks) {
		if (block?.type !== 'list' || !Array.isArray(block?.elements)) continue

		for (const el of block.elements) {
			if (el?.type !== 'key-value') continue

			if (
				el.key?.type === 'translation' &&
				el.key?.key === 'core.tooltip.info.category'
			) {
				if (el.value) {
					const translated = messageToString(el.value, loc)
					if (translated) return translated
				}
			}
		}
	}

	return ''
}

export const findContSizeInBlocks = (infoBlocks?: InfoBlock[]): number => {
	if (!Array.isArray(infoBlocks)) return 0

	for (const block of infoBlocks) {
		if (block?.type !== 'list' || !Array.isArray(block?.elements)) continue

		for (const el of block.elements) {
			if (el?.type !== 'numeric') continue

			if (
				el.name?.type === 'translation' &&
				el.name.key === 'stalker.tooltip.backpack.info.size'
			) {
				return el.value ?? 0
			}
		}
	}

	return 0
}

export const getCategoryLabel = (
	data?: Item | null,
	locale?: Locale
): string => {
	if (!data) return ''

	const fromBlocks = findCategoryInBlocks(data.infoBlocks, locale)
	if (fromBlocks) return fromBlocks

	if (typeof data.category === 'string' && data.category.length > 0) {
		return humanizeCategory(data.category)
	}

	return ''
}

export const getValueColorByRankKey = (msg?: Message): string | undefined => {
	if (msg?.type !== 'translation') return

	const rankColors: Record<string, string> = {
		'core.rank.legend': '#FFD700',
		'core.rank.master': '#EA9D9E',
		'core.rank.veteran': '#BF5BAD',
		'core.rank.stalker': '#9F9FED',
		'core.rank.newbie': '#9DEB9D',
		'core.rank.picklock': '#FFFFFF',
	}

	return rankColors[msg.key]
}
