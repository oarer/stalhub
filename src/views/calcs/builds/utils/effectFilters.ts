import type { ComboboxOption } from '@/components/ui/Combobox'
import type { Item, Locale } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import { HIDDEN_STAT_KEYS } from '../model/components/hooks/itemStatsUtils'
import { isDebuffColor } from './artCalculations'

export type EffectFilterMap = {
	posSet: Set<string>
	negSet: Set<string>
}

type ColoredStat = { color: string; displayName: string }

function getElementKey(el: unknown): string | null {
	const name = (el as { name?: { type?: string; key?: string } })?.name
	if (name && name.type === 'translation' && name.key) return name.key
	return null
}

function isStatElement(el: unknown): boolean {
	const type = (el as { type?: string })?.type
	return type === 'numeric' || type === 'range' || type === 'numericVariants'
}

export function getEffectsStats(item: Item, locale: Locale): Record<string, ColoredStat> {
	const result: Record<string, ColoredStat> = {}

	for (const block of item.infoBlocks ?? []) {
		if (block.type !== 'list' && block.type !== 'addStat') continue
		if (!Array.isArray((block as { elements?: unknown[] }).elements)) continue

		for (const el of (block as { elements: unknown[] }).elements) {
			if (!el || !isStatElement(el)) continue

			const key = getElementKey(el)
			if (!key) continue
			if (HIDDEN_STAT_KEYS.has(key)) continue

			if (!(key in result)) {
				const colorRaw = (el as { formatted?: { valueColor?: string } })
					?.formatted?.valueColor
				const color = colorRaw
					? String(colorRaw).replace(/^#/, '')
					: ''

				let displayName = key
				try {
					const name = (el as { name?: unknown })?.name
					const s = messageToString(
						name as never,
						locale
					)
					if (s && s.trim().length > 0) displayName = s
				} catch {
					// ignore
				}

				result[key] = { color, displayName }
			}
		}
	}

	return result
}

function buildEffectsMap(
	items: Item[],
	locale: Locale
): Map<string, Record<string, ColoredStat>> {
	const map = new Map<string, Record<string, ColoredStat>>()
	for (const item of items) {
		map.set(item.id, getEffectsStats(item, locale))
	}
	return map
}

export function buildEffectFilterMap(
	items: Item[],
	locale: Locale
): EffectFilterMap {
	const posSet = new Set<string>()
	const negSet = new Set<string>()

	for (const effects of buildEffectsMap(items, locale).values()) {
		for (const [key, val] of Object.entries(effects)) {
			if (isDebuffColor(val.color)) {
				negSet.add(key)
			} else {
				posSet.add(key)
			}
		}
	}

	return { posSet, negSet }
}

export function buildEffectOptions(
	items: Item[],
	locale: Locale
): ComboboxOption[] {
	const { posSet, negSet } = buildEffectFilterMap(items, locale)

	const posLabels = new Map<string, string>()
	const negLabels = new Map<string, string>()

	for (const effects of buildEffectsMap(items, locale).values()) {
		for (const [key, val] of Object.entries(effects)) {
			if (negSet.has(key)) {
				negLabels.set(key, val.displayName)
			} else if (posSet.has(key)) {
				posLabels.set(key, val.displayName)
			}
		}
	}

	return [
		...Array.from(posLabels.entries()).map(([value, label]) => ({
			value,
			label,
		})),
		...Array.from(negLabels.entries()).map(([value, label]) => ({
			value,
			label,
		})),
	].sort((a, b) => b.label.localeCompare(a.label))
}

export function filterItemsByEffects(
	items: Item[],
	locale: Locale,
	positiveStats: string[],
	negativeStats: string[]
): Item[] {
	if (positiveStats.length === 0 && negativeStats.length === 0) return items

	const effectsMap = buildEffectsMap(items, locale)

	return items.filter((item) => {
		const effects = effectsMap.get(item.id)

		if (positiveStats.length > 0) {
			const hasPositive = positiveStats.every(
				(key) =>
					effects &&
					key in effects &&
					!isDebuffColor(effects[key].color)
			)
			if (!hasPositive) return false
		}

		if (negativeStats.length > 0) {
			const hasNegative = negativeStats.every(
				(key) =>
					effects &&
					key in effects &&
					isDebuffColor(effects[key].color)
			)
			if (!hasNegative) return false
		}

		return true
	})
}

export function buildPositiveNegativeOptions(
	items: Item[],
	locale: Locale
): { positiveOptions: ComboboxOption[]; negativeOptions: ComboboxOption[] } {
	const posMap = new Map<string, string>()
	const negMap = new Map<string, string>()

	for (const effects of buildEffectsMap(items, locale).values()) {
		for (const [key, val] of Object.entries(effects)) {
			if (isDebuffColor(val.color)) {
				negMap.set(key, val.displayName)
			} else {
				posMap.set(key, val.displayName)
			}
		}
	}

	return {
		positiveOptions: Array.from(posMap.entries())
			.map(([value, label]) => ({ value, label }))
			.sort((a, b) => b.label.localeCompare(a.label)),
		negativeOptions: Array.from(negMap.entries())
			.map(([value, label]) => ({ value, label }))
			.sort((a, b) => b.label.localeCompare(a.label)),
	}
}
