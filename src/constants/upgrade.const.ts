export const MAX_UPGRADE_LEVEL = 15

export const ARMOR_MIN_DURABILITY_RATIO_TO_UPGRADE = 0.2

export const ARTEFACT_MIN_DURABILITY = 0.2
export const ARTEFACT_DURABILITY_LOSS_ON_FAIL = 0.02
export const ARTEFACT_AMPLIFIER_DURABILITY_LOSS_ON_FAIL = 0.05
export const ARTEFACT_AMPLIFIER_CHANCE_MODIFIER = 2
export const ARTEFACT_AMPLIFIER_MAX_LEVEL = 14

export type ArmorUpgradeLevel = {
	chance: number
	maxAttempts: number
	partsRequired: number
	toolsRequired: number
	repairCostModifier: number
}

export const armorUpgradeLevels: Record<number, ArmorUpgradeLevel> = {
	1: {
		chance: 1,
		maxAttempts: 1,
		partsRequired: 1,
		toolsRequired: 1,
		repairCostModifier: 1.01,
	},
	2: {
		chance: 1,
		maxAttempts: 2,
		partsRequired: 1,
		toolsRequired: 1,
		repairCostModifier: 1.04,
	},
	3: {
		chance: 1,
		maxAttempts: 3,
		partsRequired: 1,
		toolsRequired: 1,
		repairCostModifier: 1.08,
	},
	4: {
		chance: 0.5,
		maxAttempts: 4,
		partsRequired: 1,
		toolsRequired: 1,
		repairCostModifier: 1.11,
	},
	5: {
		chance: 0.45,
		maxAttempts: 5,
		partsRequired: 1,
		toolsRequired: 1,
		repairCostModifier: 1.15,
	},
	6: {
		chance: 0.4,
		maxAttempts: 10,
		partsRequired: 1,
		toolsRequired: 1,
		repairCostModifier: 1.2,
	},
	7: {
		chance: 0.3,
		maxAttempts: 15,
		partsRequired: 1,
		toolsRequired: 1,
		repairCostModifier: 1.25,
	},
	8: {
		chance: 0.25,
		maxAttempts: 20,
		partsRequired: 1,
		toolsRequired: 1,
		repairCostModifier: 1.29,
	},
	9: {
		chance: 0.2,
		maxAttempts: 25,
		partsRequired: 1,
		toolsRequired: 1,
		repairCostModifier: 1.32,
	},
	10: {
		chance: 0.1,
		maxAttempts: 30,
		partsRequired: 1,
		toolsRequired: 1,
		repairCostModifier: 1.35,
	},
	11: {
		chance: 0.07,
		maxAttempts: 35,
		partsRequired: 1,
		toolsRequired: 1,
		repairCostModifier: 1.38,
	},
	12: {
		chance: 0.05,
		maxAttempts: 40,
		partsRequired: 2,
		toolsRequired: 1,
		repairCostModifier: 1.41,
	},
	13: {
		chance: 0.039,
		maxAttempts: 50,
		partsRequired: 2,
		toolsRequired: 1,
		repairCostModifier: 1.44,
	},
	14: {
		chance: 0.025,
		maxAttempts: 60,
		partsRequired: 2,
		toolsRequired: 1,
		repairCostModifier: 1.47,
	},
	15: {
		chance: 0.019,
		maxAttempts: 70,
		partsRequired: 2,
		toolsRequired: 1,
		repairCostModifier: 1.5,
	},
}

export const armorPityByBand: {
	minLevel: number
	maxLevel: number
	minFails: number
	maxFails: number
}[] = [
	{ minLevel: 6, maxLevel: 10, minFails: 40, maxFails: 70 },
	{ minLevel: 11, maxLevel: 15, minFails: 75, maxFails: 105 },
]

export type ArtefactUpgradeLevel = {
	chance: number
	additionalChanceOnFail: number
	chargeCostModifier: number
	supportItemsRequired: number
}

export const artefactUpgradeLevels: Record<number, ArtefactUpgradeLevel> = {
	1: {
		chance: 0.5,
		additionalChanceOnFail: 0.5,
		chargeCostModifier: 1.0,
		supportItemsRequired: 1,
	},
	2: {
		chance: 0.167,
		additionalChanceOnFail: 0.0556,
		chargeCostModifier: 1.04,
		supportItemsRequired: 1,
	},
	3: {
		chance: 0.1,
		additionalChanceOnFail: 0.02,
		chargeCostModifier: 1.08,
		supportItemsRequired: 1,
	},
	4: {
		chance: 0.071,
		additionalChanceOnFail: 0.0102,
		chargeCostModifier: 1.11,
		supportItemsRequired: 1,
	},
	5: {
		chance: 0.056,
		additionalChanceOnFail: 0.0062,
		chargeCostModifier: 1.15,
		supportItemsRequired: 1,
	},
	6: {
		chance: 0.042,
		additionalChanceOnFail: 0.0042,
		chargeCostModifier: 1.2,
		supportItemsRequired: 1,
	},
	7: {
		chance: 0.033,
		additionalChanceOnFail: 0.0033,
		chargeCostModifier: 1.25,
		supportItemsRequired: 1,
	},
	8: {
		chance: 0.028,
		additionalChanceOnFail: 0.0028,
		chargeCostModifier: 1.29,
		supportItemsRequired: 1,
	},
	9: {
		chance: 0.024,
		additionalChanceOnFail: 0.0024,
		chargeCostModifier: 1.32,
		supportItemsRequired: 1,
	},
	10: {
		chance: 0.02,
		additionalChanceOnFail: 0.002,
		chargeCostModifier: 1.35,
		supportItemsRequired: 1,
	},
	11: {
		chance: 0.017,
		additionalChanceOnFail: 0.0017,
		chargeCostModifier: 1.38,
		supportItemsRequired: 2,
	},
	12: {
		chance: 0.015,
		additionalChanceOnFail: 0.0015,
		chargeCostModifier: 1.41,
		supportItemsRequired: 2,
	},
	13: {
		chance: 0.014,
		additionalChanceOnFail: 0.0014,
		chargeCostModifier: 1.44,
		supportItemsRequired: 2,
	},
	14: {
		chance: 0.012,
		additionalChanceOnFail: 0.0012,
		chargeCostModifier: 1.47,
		supportItemsRequired: 2,
	},
	15: {
		chance: 0.011,
		additionalChanceOnFail: 0.0011,
		chargeCostModifier: 1.5,
		supportItemsRequired: 3,
	},
}
