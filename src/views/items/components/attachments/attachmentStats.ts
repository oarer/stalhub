import type {
	ElementListBlock,
	Item,
	Message,
	NumericElement,
} from '@/types/item.type'

export const WEIGHT_KEY = 'core.tooltip.info.weight'
export const CLIP_SIZE_KEY = 'weapon.tooltip.weapon.info.clip_size'
export const SPEED_MODIFIER_KEY =
	'stalker.artefact_properties.factor.speed_modifier'

const FACTOR_MAP: Record<string, string> = {
	'weapon.stat_factor.spread': 'weapon.tooltip.weapon.info.spread',
	'weapon.stat_factor.hip_spread': 'weapon.tooltip.weapon.info.hip_spread',
	'weapon.stat_factor.recoil': 'weapon.tooltip.weapon.info.recoil',
	'weapon.stat_factor.horizontal_recoil':
		'weapon.tooltip.weapon.info.horizontal_recoil',
	'weapon.stat_factor.draw_time': 'weapon.tooltip.weapon.info.draw_time',
	'weapon.stat_factor.aim_switch_time':
		'weapon.tooltip.weapon.info.aim_switch',
}

const ABSOLUTE_MAP: Record<string, string> = {
	'weapon.tooltip.magazine.info.reload_time':
		'weapon.tooltip.magazine.info.reload_time',
	'weapon.tooltip.magazine.info.reload_time_tactical':
		'weapon.tooltip.magazine.info.reload_time_tactical',
	'weapon.tooltip.magazine.info.clip_size': CLIP_SIZE_KEY,
}

const LOWER_IS_BETTER = new Set([
	'weapon.tooltip.weapon.info.spread',
	'weapon.tooltip.weapon.info.hip_spread',
	'weapon.tooltip.weapon.info.recoil',
	'weapon.tooltip.weapon.info.horizontal_recoil',
	'weapon.tooltip.weapon.info.draw_time',
	'weapon.tooltip.weapon.info.aim_switch',
	'weapon.tooltip.magazine.info.reload_time',
	'weapon.tooltip.magazine.info.reload_time_tactical',
	WEIGHT_KEY,
])

const HIGHER_IS_BETTER = new Set([CLIP_SIZE_KEY, SPEED_MODIFIER_KEY])

export type StatOverride = {
	base: number
	modified: number
	deltaPct: number
	improved: boolean
}

const getTranslationKey = (name?: Message): string | null =>
	name?.type === 'translation' ? name.key : null

const getNumericElements = (
	item: Item
): (NumericElement & { key: string | null })[] => {
	const result: (NumericElement & { key: string | null })[] = []

	for (const block of item.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of (block as ElementListBlock).elements ?? []) {
			if (el.type !== 'numeric') continue

			result.push({
				...el,
				key: getTranslationKey(el.name),
			})
		}
	}

	return result
}

export const getWeaponBaseStats = (
	weapon: Item
): Map<string, { base: number; element: NumericElement }> => {
	const map = new Map<string, { base: number; element: NumericElement }>()

	for (const el of getNumericElements(weapon)) {
		if (!el.key) continue

		const current = map.get(el.key)
		if (!current || current.element.value === undefined) {
			map.set(el.key, { base: el.value ?? 0, element: el })
		}
	}

	return map
}

const round = (v: number): number => Math.round(v * 10_000) / 10_000

export const computeStatOverrides = (
	weapon: Item,
	selectedAttachments: Item[]
): Map<string, StatOverride> => {
	const factors = new Map<string, number>()
	const absolutes = new Map<string, number>()
	const additives = new Map<string, number>()
	let totalWeight = 0

	for (const attachment of selectedAttachments) {
		for (const el of getNumericElements(attachment)) {
			if (!el.key || typeof el.value !== 'number') continue

			const value = el.value

			if (el.key === WEIGHT_KEY) {
				totalWeight += value
				continue
			}

			if (el.key === 'weapon.stat_factor.equipped_speed_modifier') {
				additives.set(
					SPEED_MODIFIER_KEY,
					(additives.get(SPEED_MODIFIER_KEY) ?? 0) + value
				)
				continue
			}

			if (el.key === 'weapon.tooltip.magazine.info.additive_clip_size') {
				additives.set(
					CLIP_SIZE_KEY,
					(additives.get(CLIP_SIZE_KEY) ?? 0) + value
				)
				continue
			}

			const factorKey = FACTOR_MAP[el.key]
			if (factorKey) {
				factors.set(
					factorKey,
					(factors.get(factorKey) ?? 1) * (1 + value / 100)
				)
				continue
			}

			const absoluteKey = ABSOLUTE_MAP[el.key]
			if (absoluteKey) {
				absolutes.set(absoluteKey, value)
			}
		}
	}

	const baseStats = getWeaponBaseStats(weapon)
	const overrides = new Map<string, StatOverride>()

	for (const [statKey, { base }] of baseStats) {
		let modified = base

		if (absolutes.has(statKey)) {
			modified = absolutes.get(statKey) as number
		}

		const factor = factors.get(statKey)
		if (factor !== undefined) {
			modified = round(base * factor)
		}

		const additive = additives.get(statKey)
		if (additive !== undefined) {
			modified = round(modified + additive)
		}

		if (statKey === WEIGHT_KEY) {
			modified = round(base + totalWeight)
		}

		const delta = modified - base
		if (Math.abs(delta) < 1e-9) continue

		const deltaPct = Math.abs(base) < 1e-9 ? 0 : round((delta / base) * 100)

		const improved = HIGHER_IS_BETTER.has(statKey)
			? delta > 0
			: LOWER_IS_BETTER.has(statKey)
				? delta < 0
				: false

		overrides.set(statKey, { base, modified, deltaPct, improved })
	}

	return overrides
}
