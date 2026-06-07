import type { Build } from '@/types/build.type'
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
import { computeArtifactStatsFromParsed } from '@/views/calcs/builds/utils/computeArtifactStats'
import { parseItemStats } from '@/views/calcs/builds/utils/parseArtifact'

function getElementKey(el: InfoElement): string | null {
	if ('name' in el && el.name?.type === 'translation') return el.name.key
	return null
}

function getNumericValue(
	item: Item,
	key: string,
	locale: Locale,
	numericVariants = 0
): number {
	for (const block of item.infoBlocks) {
		if (block.type !== 'list' && block.type !== 'addStat') continue
		const elements = (block as ElementListBlock | AddStatBlock).elements
		if (!Array.isArray(elements)) continue
		for (const el of elements) {
			if (!el) continue
			if (getElementKey(el) !== key) continue
			if (el.type === 'numeric')
				return Number((el as NumericElement).value ?? 0)
			if (el.type === 'range') {
				const r = el as NumericRangeElement
				return (
					Number(r.min ?? 0) +
					(Number(r.max ?? 0) - Number(r.min ?? 0)) *
						(numericVariants / 15)
				)
			}
			if (el.type === 'numericVariants') {
				const vals = (el as NumericVariantsElement).value ?? []
				return Number(
					vals[
						Math.min(Math.max(numericVariants, 0), vals.length - 1)
					] ?? 0
				)
			}
		}
	}
	return 0
}

const BULLET_KEY = 'stalker.artefact_properties.factor.bullet_dmg_factor'
const HEALTH_KEY = 'stalker.artefact_properties.factor.health_bonus'

export function computePrimeFromBuild(
	build: Build,
	armors: Item[],
	containers: Item[],
	artefacts: Item[],
	consumables: Item[],
	locale: Locale
): number {
	const result: Record<string, number> = {}

	const containerItem = containers.find((c) => c.id === build.container?.id)
	const effectiveness = containerItem
		? getNumericValue(
				containerItem,
				'stalker.tooltip.backpack.stat_name.effectiveness',
				locale
			) / 100
		: 1
	const _innerProtection = containerItem
		? getNumericValue(
				containerItem,
				'stalker.tooltip.backpack.stat_name.inner_protection',
				locale
			) / 100
		: 0

	const KEYS = [BULLET_KEY, HEALTH_KEY]

	const armorItem = armors.find((a) => a.id === build.armor?.id)
	if (armorItem && build.armor) {
		for (const key of KEYS) {
			const val = getNumericValue(
				armorItem,
				key,
				locale,
				build.armor.level ?? 0
			)
			if (val !== 0) result[key] = (result[key] ?? 0) + val
		}
	}

	if (containerItem) {
		for (const key of KEYS) {
			const val = getNumericValue(containerItem, key, locale)
			if (val !== 0) result[key] = (result[key] ?? 0) + val
		}
	}

	for (const art of build.arts) {
		const item = artefacts.find((i) => i.id === art.itemId)
		if (!item) continue
		const parsed = parseItemStats(item, locale)
		const artStats = computeArtifactStatsFromParsed(
			art,
			parsed,
			art.selectedStats
		)
		for (const [key, stat] of Object.entries(artStats)) {
			const cleanKey = key.startsWith('add:') ? key.slice(4) : key
			if (cleanKey === BULLET_KEY || cleanKey === HEALTH_KEY) {
				result[cleanKey] = (result[cleanKey] ?? 0) + stat.final
			}
		}
	}

	for (const key of KEYS) {
		const val = result[key] ?? 0
		if (val > 0) result[key] = val * effectiveness
	}

	for (const boostId of Object.values(build.boost).filter(Boolean)) {
		const boostItem = consumables.find((c) => c.id === boostId)
		if (!boostItem) continue
		for (const key of KEYS) {
			const val = getNumericValue(boostItem, key, locale)
			if (val !== 0) result[key] = (result[key] ?? 0) + val
		}
	}

	const bulletRes = result[BULLET_KEY] ?? 0
	const vitality = result[HEALTH_KEY] ?? 0
	return ((100 + bulletRes) * (vitality + 100)) / 100
}
