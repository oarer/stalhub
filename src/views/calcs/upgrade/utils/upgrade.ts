import { ARTEFACT_BASE_CHARGE_ENERGY } from '@/constants/artefact_meta.const'
import {
	ARTEFACT_AMPLIFIER_CHANCE_MODIFIER,
	ARTEFACT_AMPLIFIER_DURABILITY_LOSS_ON_FAIL,
	ARTEFACT_AMPLIFIER_MAX_LEVEL,
	ARTEFACT_DURABILITY_LOSS_ON_FAIL,
	ARTEFACT_MIN_DURABILITY,
	armorPityByBand,
	armorUpgradeLevels,
	artefactUpgradeLevels,
} from '@/constants/upgrade.const'
import type { UpgradeItemKey } from '@/types/upgrade.type'

export type UpgradeTarget = 'artefact' | 'armor'
export type UpgradeMode = 'luck' | 'guarantee'

export interface CostInputs {
	artifactKey: string
	attemptCost: number
	useAmplifier: boolean
	amplifierCost: number
	energyPrice: number
}

export interface UpgradeRow {
	targetLevel: number
	chance: number
	attempts: number
	partsPerAttempt: number
	toolsPerAttempt: number
	levelParts: number
	levelTools: number
	partsKey?: UpgradeItemKey
	toolsKey?: UpgradeItemKey
	costPerAttempt: number
	levelCost: number
	energyPerAttempt: number
	levelEnergy: number
	durabilityAfter?: number
}

export interface UpgradeResult {
	target: UpgradeTarget
	mode: UpgradeMode
	rows: UpgradeRow[]
	totalAttempts: number
	totalParts: number
	totalTools: number
	totalEnergy: number
	totalMoney: number
	durabilityAfter?: number
}

function armorExpectedAttempts(level: number): number {
	const { chance, maxAttempts } = armorUpgradeLevels[level]
	if (chance >= 1) return 1
	return Math.max(1, (1 - Math.pow(1 - chance, maxAttempts)) / chance)
}

function armorGuaranteeAttempts(level: number): number {
	return armorUpgradeLevels[level].maxAttempts
}

function artefactBaseChance(level: number, useAmplifier: boolean): number {
	const { chance } = artefactUpgradeLevels[level]
	if (useAmplifier && level <= ARTEFACT_AMPLIFIER_MAX_LEVEL) {
		return Math.min(1, chance * ARTEFACT_AMPLIFIER_CHANCE_MODIFIER)
	}
	return chance
}

function artefactChanceAtAttempt(
	level: number,
	fails: number,
	useAmplifier: boolean
): number {
	const { additionalChanceOnFail } = artefactUpgradeLevels[level]
	return Math.min(
		1,
		artefactBaseChance(level, useAmplifier) + additionalChanceOnFail * fails
	)
}

function artefactExpectedAttempts(
	level: number,
	useAmplifier: boolean
): number {
	if (artefactChanceAtAttempt(level, 0, useAmplifier) >= 1) return 1

	let expected = 0
	let failProduct = 1
	for (let fails = 0; fails < 10000 && failProduct > 1e-12; fails += 1) {
		expected += failProduct
		failProduct *= 1 - artefactChanceAtAttempt(level, fails, useAmplifier)
	}
	return expected
}

function artefactGuaranteeAttempts(
	level: number,
	useAmplifier: boolean
): number {
	if (artefactChanceAtAttempt(level, 0, useAmplifier) >= 1) return 1
	const { additionalChanceOnFail } = artefactUpgradeLevels[level]
	if (additionalChanceOnFail <= 0) return Number.POSITIVE_INFINITY
	const base = artefactBaseChance(level, useAmplifier)
	return Math.floor((1 - base) / additionalChanceOnFail) + 1
}

function artefactDurabilityAfter(
	attempts: number,
	useAmplifier: boolean
): number {
	const loss = useAmplifier
		? ARTEFACT_AMPLIFIER_DURABILITY_LOSS_ON_FAIL
		: ARTEFACT_DURABILITY_LOSS_ON_FAIL
	const fails = Math.max(0, attempts - 1)
	return Math.max(ARTEFACT_MIN_DURABILITY, 1 - fails * loss)
}

export function artefactEnergyPerAttempt(
	level: number,
	baseChargeEnergy: number
): number {
	const { chargeCostModifier } = artefactUpgradeLevels[level]
	return baseChargeEnergy * chargeCostModifier
}

export function computeUpgrade(
	target: UpgradeTarget,
	fromLevel: number,
	toLevel: number,
	mode: UpgradeMode,
	costs: CostInputs,
	itemPrices?: Partial<Record<UpgradeItemKey, number | null>>
): UpgradeResult {
	const rows: UpgradeRow[] = []
	let totalAttempts = 0
	let totalParts = 0
	let totalTools = 0
	let totalEnergy = 0
	let totalMoney = 0
	let durabilityAfter: number | undefined

	const clampedFrom = Math.max(0, Math.min(14, fromLevel))
	const clampedTo = Math.max(clampedFrom + 1, Math.min(15, toLevel))

	for (let level = clampedFrom + 1; level <= clampedTo; level += 1) {
		const chance =
			target === 'artefact'
				? artefactBaseChance(level, costs.useAmplifier)
				: armorUpgradeLevels[level].chance

		const attempts =
			target === 'artefact'
				? mode === 'guarantee'
					? artefactGuaranteeAttempts(level, costs.useAmplifier)
					: artefactExpectedAttempts(level, costs.useAmplifier)
				: mode === 'guarantee'
					? armorGuaranteeAttempts(level)
					: armorExpectedAttempts(level)

		if (target === 'artefact') {
			const { supportItemsRequired } = artefactUpgradeLevels[level]
			const baseChargeEnergy = costs.artifactKey
				? (ARTEFACT_BASE_CHARGE_ENERGY[costs.artifactKey] ?? 0)
				: 0
			const energyPerAttempt = artefactEnergyPerAttempt(
				level,
				baseChargeEnergy
			)
			const toolsPerAttempt = supportItemsRequired
			const amplifierCost = costs.useAmplifier ? costs.amplifierCost : 0

			const moneyPerAttempt =
				energyPerAttempt * costs.energyPrice + amplifierCost
			const levelDurabilityAfter = artefactDurabilityAfter(
				attempts,
				costs.useAmplifier
			)

			if (levelDurabilityAfter !== undefined) {
				durabilityAfter =
					durabilityAfter === undefined
						? levelDurabilityAfter
						: Math.min(durabilityAfter, levelDurabilityAfter)
			}

			const levelEnergy = attempts * energyPerAttempt
			const levelTools = attempts * toolsPerAttempt
			const levelMoney = attempts * moneyPerAttempt
			rows.push({
				targetLevel: level,
				chance,
				attempts,
				partsPerAttempt: 0,
				toolsPerAttempt,
				levelParts: 0,
				levelTools,
				costPerAttempt: moneyPerAttempt,
				levelCost: levelMoney,
				energyPerAttempt,
				levelEnergy,
				durabilityAfter: levelDurabilityAfter,
			})

			totalEnergy += levelEnergy
			totalMoney += levelMoney
		} else {
			const { partsRequired, toolsRequired } = armorUpgradeLevels[level]
			const { partsKey, toolsKey } = armorItemKeysForLevel(level)
			const partsItemCost =
				itemPrices?.[partsKey] ?? DEFAULT_ITEM_PRICE
			const toolsItemCost = itemPrices?.[toolsKey] ?? DEFAULT_ITEM_PRICE
			const partsPerAttempt = partsRequired
			const toolsPerAttempt = toolsRequired
			const moneyPerAttempt =
				costs.attemptCost +
				partsRequired * partsItemCost +
				toolsRequired * toolsItemCost
			const levelParts = attempts * partsPerAttempt
			const levelTools = attempts * toolsPerAttempt
			const levelMoney = attempts * moneyPerAttempt
			rows.push({
				targetLevel: level,
				chance,
				attempts,
				partsPerAttempt,
				toolsPerAttempt,
				levelParts,
				levelTools,
				partsKey,
				toolsKey,
				costPerAttempt: moneyPerAttempt,
				levelCost: levelMoney,
				energyPerAttempt: 0,
				levelEnergy: 0,
			})

			totalMoney += levelMoney
		}

		totalAttempts += attempts
		totalParts += rows[rows.length - 1].levelParts
		totalTools += rows[rows.length - 1].levelTools
	}

	return {
		target,
		mode,
		rows,
		totalAttempts,
		totalParts,
		totalTools,
		totalEnergy,
		totalMoney,
		durabilityAfter,
	}
}

export function armorBandPity(level: number): number | null {
	const band = armorPityByBand.find(
		(b) => level >= b.minLevel && level <= b.maxLevel
	)
	if (!band) return null
	return Math.round((band.minFails + band.maxFails) / 2)
}

const DEFAULT_ITEM_PRICE = 3

export function armorItemKeysForLevel(level: number): {
	partsKey: UpgradeItemKey
	toolsKey: UpgradeItemKey
} {
	if (level <= 5) {
		return { partsKey: 'cheap_parts', toolsKey: 'cheap_tools' }
	}
	if (level <= 10) {
		return { partsKey: 'standard_parts', toolsKey: 'standard_tools' }
	}
	return { partsKey: 'advanced_parts', toolsKey: 'advanced_tools' }
}
