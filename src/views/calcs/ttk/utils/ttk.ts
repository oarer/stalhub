import type { Item } from '@/types/item.type'
import { CUSTOM_ROF_MAP, type CustomRof, type HitZone } from '../constants/ttk'
import { getAmmoPenetration } from './ammo'
import { getDmgPerShot, type ModuleDamageMods } from './damage'
import { getNumericStat } from './itemStats'
import { getPlateDamageAbsorption, getPlateMaxDurability } from './plate'

function getWeaponRofConfig(weapon: Item, useBurst: boolean): CustomRof {
	if (useBurst && CUSTOM_ROF_MAP[weapon.id]) {
		return CUSTOM_ROF_MAP[weapon.id]
	}
	return {
		rof: getNumericStat(weapon, 'weapon.tooltip.weapon.info.rate_of_fire'),
	}
}

function calcBurstTTK(shots: number, rofConfig: CustomRof): number {
	const burstSize = rofConfig.burstSize ?? 3
	const burstDelay = rofConfig.burstDelay ?? 150
	const bulletDelayMs = 60000 / rofConfig.rof

	const bursts = Math.ceil(shots / burstSize)
	const queueDelay = (bursts - 1) * burstDelay
	const inBurstDelay = (shots - bursts) * bulletDelayMs

	return (queueDelay + inBurstDelay) / 1000
}

function getReloadTime(weapon: Item, shots: number): number {
	if (shots <= 0) return 0

	const mag = getNumericStat(weapon, 'weapon.tooltip.weapon.info.clip_size')
	if (mag <= 0 || shots <= mag) return 0

	const reloads = Math.floor((shots - 1) / mag)
	const reloadTime = getNumericStat(
		weapon,
		'weapon.tooltip.magazine.info.reload_time'
	)

	return reloads * reloadTime
}

export function calcTTKAtDist(
	weapon: Item,
	ammo: Item | null,
	bulletRes: number,
	vitality: number,
	hitZone: HitZone,
	dist: number,
	variantIndex: number,
	useBurstRof: boolean,
	plate?: Item | null,
	plateDurability?: number,
	moduleMods?: ModuleDamageMods,
	holdTime = 0
): { ttk: number; shots: number } {
	const rofConfig = getWeaponRofConfig(weapon, useBurstRof)
	if (rofConfig.rof <= 0) return { ttk: 0, shots: 0 }

	const isBurst = useBurstRof && !!CUSTOM_ROF_MAP[weapon.id]
	const computeTtk = (shots: number) =>
		(isBurst
			? calcBurstTTK(shots, rofConfig)
			: (shots - 1) * (60 / rofConfig.rof)) + getReloadTime(weapon, shots)

	const penetration = ammo ? getAmmoPenetration(ammo) : 0

	const effectiveHp =
		((100 + bulletRes * (1 - penetration / 100)) * (vitality + 100)) / 100

	const mag = getNumericStat(weapon, 'weapon.tooltip.weapon.info.clip_size')
	const shotInMag = (shotNumber: number) =>
		mag > 0 ? ((shotNumber - 1) % mag) + 1 : shotNumber

	const dmgForShot = (shotNumber: number, plated: boolean) =>
		getDmgPerShot(
			weapon,
			ammo,
			hitZone,
			dist,
			variantIndex,
			plated ? plate : undefined,
			moduleMods,
			holdTime,
			shotInMag(shotNumber),
			mag
		)

	if (!plate || hitZone !== 'body') {
		let hp = effectiveHp
		let shots = 0
		let guard = 0
		while (hp > 0 && guard < 100000) {
			guard++
			const dmg = dmgForShot(shots + 1, false)
			if (dmg <= 0) break
			hp -= dmg
			shots++
		}
		if (shots <= 0 || hp > 0) return { ttk: 0, shots: 0 }
		return { ttk: computeTtk(shots), shots }
	}

	const absorption = getPlateDamageAbsorption(plate) / 100
	const durability = plateDurability ?? getPlateMaxDurability(plate)
	const plateDmgMult = moduleMods?.plateDamageMult ?? 0

	let hp = effectiveHp
	let dura = durability
	let shots = 0
	let guard = 0
	while (hp > 0 && guard < 100000) {
		guard++
		const plated = dura > 0
		const shotNumber = shots + 1
		const dmg = dmgForShot(shotNumber, plated)
		if (dmg <= 0) break

		if (plated) {
			const nakedDmg = dmgForShot(shotNumber, false)
			dura -= nakedDmg * absorption * (1 + plateDmgMult / 100)
		}

		hp -= dmg
		shots++
	}
	if (shots <= 0 || hp > 0) return { ttk: 0, shots: 0 }
	return { ttk: computeTtk(shots), shots }
}
