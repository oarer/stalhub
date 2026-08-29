import type { Item, Locale } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import { CUSTOM_ROF_MAP } from '@/views/calcs/ttk/constants/ttk'
import {
	getAmmoPenetration,
	getAmmoType,
	getCompatibleAmmo,
} from '@/views/calcs/ttk/utils/ammo'
import { calcTTKAtDist } from '@/views/calcs/ttk/utils/ttk'

export type TierScenario = {
	bulletRes: number
	vitality: number
	hitZone: 'body' | 'head' | 'limbs'
}

export const DEFAULT_TIER_SCENARIO: TierScenario = {
	bulletRes: 400,
	vitality: 10,
	hitZone: 'body',
}

export function parseScenarioName(
	name: string | null | undefined
): TierScenario {
	if (!name) return DEFAULT_TIER_SCENARIO

	const resMatch = name.match(/(\d+)\s*HP/i)
	const vitMatch = name.match(/vit\S*\s*(\d+)/i)
	const zoneMatch = name.match(/\b(body|head|limbs)\b/i)

	const bulletRes = resMatch
		? Number(resMatch[1])
		: DEFAULT_TIER_SCENARIO.bulletRes
	const vitality = vitMatch
		? Number(vitMatch[1])
		: DEFAULT_TIER_SCENARIO.vitality
	const hitZone = zoneMatch
		? (zoneMatch[1].toLowerCase() as TierScenario['hitZone'])
		: DEFAULT_TIER_SCENARIO.hitZone

	return { bulletRes, vitality, hitZone }
}

export function pickBestAmmo(weapon: Item, ammoItems: Item[]): Item | null {
	const compatible = getCompatibleAmmo(ammoItems, getAmmoType(weapon))
	if (compatible.length === 0) return null
	return compatible.reduce((best, a) =>
		getAmmoPenetration(a) > getAmmoPenetration(best) ? a : best
	)
}

const SITE_VARIANT_INDEX = 15

const SETUP_COUNT = 400
const SETUP_HP_MIN = 400
const SETUP_HP_MAX = 800
const SETUP_VIT_MIN = 1.0
const SETUP_VIT_MAX = 1.3
const SETUP_VIT_START = 1.15
const SETUP_VIT_STEP = 0.005

type Setup = { bulletRes: number; vitality: number }

function buildSetups(count = SETUP_COUNT): Setup[] {
	const setups: Setup[] = []
	const step = count > 1 ? (SETUP_HP_MAX - SETUP_HP_MIN) / (count - 1) : 0
	const minTh = Math.round(SETUP_VIT_MIN * 1000)
	const maxTh = Math.round(SETUP_VIT_MAX * 1000)
	const stepTh = Math.round(SETUP_VIT_STEP * 1000)
	let vitTh = Math.round(SETUP_VIT_START * 1000)
	let randomState = 0x9e3779b9
	const nextRandom = () => {
		randomState ^= randomState << 13
		randomState ^= randomState >>> 17
		randomState ^= randomState << 5
		return (randomState >>> 0) / 0x100000000
	}
	for (let i = 0; i < count; i++) {
		const bulletRes = SETUP_HP_MIN + step * i
		setups.push({ bulletRes, vitality: vitTh / 1000 })
		if (vitTh === minTh) {
			vitTh = minTh + stepTh
		} else if (vitTh === maxTh) {
			vitTh = maxTh - stepTh
		} else {
			vitTh += nextRandom() < 0.5 ? stepTh : -stepTh
		}
	}
	return setups
}

export function isAggregateScenario(name: string | null | undefined): boolean {
	return Boolean(name && /HP\s*,\s*\d+\s*-\s*\d+\s*Vit/i.test(name))
}

export function computeAverageWeaponTTK(
	weapon: Item,
	ammoItems: Item[],
	hitZone: TierScenario['hitZone'],
	locale: Locale,
	variantIndex = SITE_VARIANT_INDEX
): { ttk: number; ammoName: string | null } {
	const bestAmmo = pickBestAmmo(weapon, ammoItems)
	const ammoName = bestAmmo ? messageToString(bestAmmo.name, locale) : null
	const useBurstRof = Boolean(CUSTOM_ROF_MAP[weapon.id])
	const setups = buildSetups()
	let total = 0
	let valid = 0
	for (const setup of setups) {
		const armor = setup.bulletRes / setup.vitality - 100
		const { ttk } = calcTTKAtDist(
			weapon,
			bestAmmo,
			armor,
			(setup.vitality - 1) * 100,
			hitZone,
			0,
			variantIndex,
			useBurstRof,
			null
		)
		if (ttk > 0 && Number.isFinite(ttk)) {
			total += ttk
			valid++
		}
	}
	return { ttk: valid > 0 ? total / valid : 0, ammoName }
}

export function computeWeaponTTK(
	weapon: Item,
	ammoItems: Item[],
	scenario: TierScenario,
	locale: Locale,
	variantIndex = SITE_VARIANT_INDEX
): { ttk: number; ammoName: string | null } {
	const bestAmmo = pickBestAmmo(weapon, ammoItems)
	const ammoName = bestAmmo ? messageToString(bestAmmo.name, locale) : null

	const useBurstRof = Boolean(CUSTOM_ROF_MAP[weapon.id])

	const { ttk } = calcTTKAtDist(
		weapon,
		bestAmmo,
		scenario.bulletRes,
		scenario.vitality,
		scenario.hitZone,
		0,
		variantIndex,
		useBurstRof,
		null
	)

	return { ttk, ammoName }
}

export function formatTierTtk(ttk: number): string {
	if (ttk <= 0 || !Number.isFinite(ttk)) return '—'
	return `${ttk.toFixed(2)}`
}
