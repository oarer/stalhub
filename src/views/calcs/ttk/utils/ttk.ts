import type { Item } from '@/types/item.type'
import { CUSTOM_ROF_MAP, type CustomRof, type HitZone } from '../constants/ttk'
import { getAmmoPenetration } from './ammo'
import { getDmgPerShot, getShotsToKill, getShotsToKillWithPlate } from './damage'
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

export function getReloadTime(weapon: Item, shots: number): number {
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
	plateDurability?: number
): { ttk: number; shots: number } {
	const rofConfig = getWeaponRofConfig(weapon, useBurstRof)
	if (rofConfig.rof <= 0) return { ttk: 0, shots: 0 }

	const penetration = ammo ? getAmmoPenetration(ammo) : 0

	const effectiveHp =
		((100 + bulletRes * (1 - penetration / 100)) * (vitality + 100)) / 100

	if (!plate || hitZone !== 'body') {
		const dmg = getDmgPerShot(weapon, ammo, hitZone, dist, variantIndex)
		const shots = getShotsToKill(effectiveHp, dmg)
		if (shots <= 0) return { ttk: 0, shots: 0 }

		if (rofConfig.rof) {
			return {
				ttk:
					calcBurstTTK(shots, rofConfig) +
					getReloadTime(weapon, shots),
				shots,
			}
		}

		const shotInterval = 60 / rofConfig.rof
		return {
			ttk: (shots - 1) * shotInterval + getReloadTime(weapon, shots),
			shots,
		}
	}

	const dmgNaked = getDmgPerShot(weapon, ammo, hitZone, dist, variantIndex)
	if (dmgNaked <= 0) return { ttk: 0, shots: 0 }

	const dmgPlated = getDmgPerShot(
		weapon,
		ammo,
		hitZone,
		dist,
		variantIndex,
		plate
	)

	const absorption = getPlateDamageAbsorption(plate)
	const drainPerShot = dmgNaked * (absorption / 100)
	const durability = plateDurability ?? getPlateMaxDurability(plate)

	const shots = getShotsToKillWithPlate(
		effectiveHp,
		dmgPlated,
		dmgNaked,
		drainPerShot,
		durability
	)

	if (rofConfig.rof) {
		return {
			ttk: calcBurstTTK(shots, rofConfig) + getReloadTime(weapon, shots),
			shots,
		}
	}

	const shotInterval = 60 / rofConfig.rof
	return {
		ttk: (shots - 1) * shotInterval + getReloadTime(weapon, shots),
		shots,
	}
}
