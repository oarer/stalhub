import type {
	InfoBlock,
	InfoElement,
	Item,
	Locale,
	Message,
} from '@/types/item.type'
import {
	hasFormatted,
	type ListLikeBlock,
	messageToString,
	roundNumber,
} from '@/utils/itemUtils'
import { getElementKeys, HIDDEN_KEYS } from '../hiddenKeys'
import { clampSharpening } from '../itemComparisonUtils'
import {
	type ComparisonDirection,
	getComparisonDirection,
} from './comparisonDirection'

export type ComparisonSideValue = {
	text: string
	numeric: number | null
}

export type ComparisonRow = {
	key: string
	label: string
	statKey: string
	direction: ComparisonDirection
	values: (ComparisonSideValue | null)[]
	best: number[]
	worst: number[]
	changed: boolean
}

export type ComparisonSection = {
	key: string
	title: string
	rows: ComparisonRow[]
}

type RawRow = {
	key: string
	label: string
	statKey: string
	value: ComparisonSideValue
}

type RawSection = {
	key: string
	title: string
	rows: RawRow[]
}

type MergedSide = {
	label: string
	statKey: string
	value: ComparisonSideValue
}

type MergedSection = {
	key: string
	title: string
	order: string[]
	labels: Map<string, string>
	sides: Map<string, MergedSide>[]
}

const hasVisibleElements = (block: ListLikeBlock): boolean =>
	(block.elements ?? []).some(
		(el) => !getElementKeys(el).some((key) => HIDDEN_KEYS.has(key))
	)

const collectComparisonBlocks = (
	infoBlocks: InfoBlock[] | undefined
): ListLikeBlock[] => {
	if (!Array.isArray(infoBlocks)) return []

	const out: ListLikeBlock[] = []

	for (const block of infoBlocks) {
		if (!block) continue

		if (block.type === 'list' || block.type === 'addStat') {
			if (hasVisibleElements(block)) out.push(block)
		} else if (block.type === 'grouped') {
			const detailed = collectComparisonBlocks(block.detailed)
			out.push(
				...(detailed.length > 0
					? detailed
					: collectComparisonBlocks(block.compact))
			)
		}
	}

	return out
}

const messageKey = (message?: Message): string => {
	if (!message) return ''
	if (message.type === 'translation') return `key:${message.key}`
	if (message.type === 'text') return `text:${message.text}`
	return ''
}

const formattedValue = (el: InfoElement, locale: Locale): string | null => {
	if (!hasFormatted(el)) return null
	return el.formatted?.value?.[locale] ?? null
}

const formatNumber = (value: number): string => roundNumber(value)

const getLabel = (
	el: InfoElement,
	locale: Locale
): { label: string; key: string; statKey: string } => {
	switch (el.type) {
		case 'numeric':
		case 'range':
		case 'threshold':
			return {
				label: messageToString(el.name, locale),
				key: messageKey(el.name),
				statKey: el.name?.type === 'translation' ? el.name.key : '',
			}
		case 'numericVariants':
			return {
				label: messageToString(el.name, locale),
				key: messageKey(el.name),
				statKey: el.name?.type === 'translation' ? el.name.key : '',
			}
		case 'key-value':
			return {
				label: messageToString(el.key, locale),
				key: messageKey(el.key),
				statKey: el.key?.type === 'translation' ? el.key.key : '',
			}
		case 'price':
			return {
				label: el.currency,
				key: `currency:${el.currency}`,
				statKey: '',
			}
		default:
			return { label: '', key: '', statKey: '' }
	}
}

const getValue = (
	el: InfoElement,
	locale: Locale,
	sharpening: number
): ComparisonSideValue | null => {
	switch (el.type) {
		case 'numeric':
			return {
				text: formattedValue(el, locale) ?? formatNumber(el.value),
				numeric: Number.isFinite(el.value) ? el.value : null,
			}
		case 'range':
			return {
				text:
					formattedValue(el, locale) ??
					`${formatNumber(el.min)} — ${formatNumber(el.max)}`,
				numeric: null,
			}
		case 'threshold':
			return {
				text:
					formattedValue(el, locale) ??
					`${formatNumber(el.value)} / ${formatNumber(el.limit)}`,
				numeric: Number.isFinite(el.value) ? el.value : null,
			}
		case 'numericVariants': {
			const values = Array.isArray(el.value) ? el.value : []
			if (values.length === 0) return null

			const index = Math.min(
				clampSharpening(sharpening),
				values.length - 1
			)
			const current = values[index]

			if (Array.isArray(current)) {
				return {
					text: `${formatNumber(current[0])} — ${formatNumber(current[1])}`,
					numeric: null,
				}
			}

			return {
				text: formatNumber(current),
				numeric: Number.isFinite(current) ? current : null,
			}
		}
		case 'key-value': {
			const value = messageToString(el.value, locale)
			return value ? { text: value, numeric: null } : null
		}
		case 'price':
			return {
				text: formattedValue(el, locale) ?? formatNumber(el.amount),
				numeric: Number.isFinite(el.amount) ? el.amount : null,
			}
		default:
			return null
	}
}

const extractSections = (
	item: Item,
	sharpening: number,
	locale: Locale
): RawSection[] => {
	const sections: RawSection[] = []

	for (const block of collectComparisonBlocks(item.infoBlocks)) {
		if (
			block.title?.type === 'translation' &&
			HIDDEN_KEYS.has(block.title.key)
		)
			continue

		const elements = Array.isArray(block.elements) ? block.elements : []
		const counts = new Map<string, number>()
		const rows: RawRow[] = []

		for (const el of elements) {
			if (getElementKeys(el).some((key) => HIDDEN_KEYS.has(key))) continue

			const { label, key, statKey } = getLabel(el, locale)
			const value = getValue(el, locale, sharpening)
			if (!label || !value) continue

			const base = `${el.type}:${key || label}`
			const occurrence = counts.get(base) ?? 0
			counts.set(base, occurrence + 1)

			rows.push({
				key: `${base}#${occurrence}`,
				label,
				statKey,
				value,
			})
		}

		if (rows.length === 0) continue

		sections.push({
			key: messageKey(block.title) || 'root',
			title: messageToString(block.title, locale),
			rows,
		})
	}

	return sections
}

const ensureSection = (
	sections: Map<string, MergedSection>,
	order: string[],
	section: RawSection,
	columnCount: number
): MergedSection => {
	const existing = sections.get(section.key)
	if (existing) {
		if (!existing.title && section.title) existing.title = section.title
		return existing
	}

	const created: MergedSection = {
		key: section.key,
		title: section.title,
		order: [],
		labels: new Map(),
		sides: Array.from({ length: columnCount }, () => new Map()),
	}
	sections.set(section.key, created)
	order.push(section.key)
	return created
}

const getBestWorst = (
	values: (ComparisonSideValue | null)[],
	direction: ComparisonDirection
): { best: number[]; worst: number[] } => {
	if (!direction) return { best: [], worst: [] }

	const presentValues = values.filter(
		(value): value is ComparisonSideValue => value !== null
	)
	if (new Set(presentValues.map((value) => value.text)).size < 2)
		return { best: [], worst: [] }

	const numeric = values.map((value) => value?.numeric ?? null)
	const present = numeric.filter((value): value is number => value !== null)
	if (present.length < 2 || new Set(present).size < 2)
		return { best: [], worst: [] }

	const bestValue =
		direction === 'higher' ? Math.max(...present) : Math.min(...present)
	const worstValue =
		direction === 'higher' ? Math.min(...present) : Math.max(...present)

	const best: number[] = []
	const worst: number[] = []

	for (const [index, value] of numeric.entries()) {
		if (value === bestValue) best.push(index)
		if (value === worstValue) worst.push(index)
	}

	return { best, worst }
}

export const buildComparisonSections = (
	items: readonly Item[],
	sharpening: number,
	locale: Locale
): ComparisonSection[] => {
	if (items.length < 2) return []

	const merged = new Map<string, MergedSection>()
	const order: string[] = []

	for (const [index, item] of items.entries()) {
		for (const section of extractSections(item, sharpening, locale)) {
			const target = ensureSection(merged, order, section, items.length)
			for (const row of section.rows) {
				if (!target.order.includes(row.key)) target.order.push(row.key)
				if (!target.labels.has(row.key))
					target.labels.set(row.key, row.label)
				target.sides[index].set(row.key, {
					label: row.label,
					statKey: row.statKey,
					value: row.value,
				})
			}
		}
	}

	const result: ComparisonSection[] = []

	for (const key of order) {
		const section = merged.get(key)
		if (!section) continue

		const rows: ComparisonRow[] = []

		for (const rowKey of section.order) {
			const sides = section.sides.map(
				(column) => column.get(rowKey) ?? null
			)
			if (sides.every((side) => !side)) continue

			const values = sides.map((side) => side?.value ?? null)
			const present = values.filter(
				(value): value is ComparisonSideValue => value !== null
			)
			const statKey = sides.find((side) => side?.statKey)?.statKey ?? ''
			const direction = getComparisonDirection(statKey)
			const { best, worst } = getBestWorst(values, direction)
			const changed =
				present.length < values.length ||
				present.some((value) => value.text !== present[0]?.text)

			rows.push({
				key: rowKey,
				label: section.labels.get(rowKey) ?? '',
				statKey,
				direction,
				values,
				best,
				worst,
				changed,
			})
		}

		if (rows.length === 0) continue

		result.push({
			key,
			title: section.title,
			rows,
		})
	}

	return result
}

export const countDifferences = (
	sections: readonly ComparisonSection[]
): number =>
	sections.reduce(
		(total, section) =>
			total + section.rows.filter((row) => row.changed).length,
		0
	)
