import type { DamageDistanceInfoBlock, Item } from '@/types/item.type'
import { type HitZone } from '../constants/ttk'
import { getAmmoDamageBonus } from './ammo'
import { getDamageBlock, getDamageModifiers, getDamageVariant } from './itemStats'
import { getPlateDamageAbsorption } from './plate'

export function getDamageAt(
	block: DamageDistanceInfoBlock,
	dist: number,
	startOverride?: number,
	endOverride?: number
): number {
	const startDamage = startOverride ?? block.startDamage
	const endDamage = endOverride ?? block.endDamage

	if (dist <= block.damageDecreaseStart) return startDamage
	if (dist >= block.damageDecreaseEnd) return endDamage

	const range = block.damageDecreaseEnd - block.damageDecreaseStart
	if (range <= 0) return endDamage

	const t = (dist - block.damageDecreaseStart) / range

	return startDamage + t * (endDamage - startDamage)
}

export function getShotsToKill(hp: number, dmg: number): number {
	if (hp <= 0 || dmg <= 0) return 0
	return Math.ceil(hp / dmg)
}

export function getShotsToKillWithPlate(
	hp: number,
	dmgPlated: number,
	dmgNaked: number,
	drainPerShot: number,
	durability: number
): number {
	if (dmgPlated <= 0) return 0

	const shotsToBreak =
		durability > 0 ? Math.ceil(durability / drainPerShot) : 0
	const dmgBeforeBreak = shotsToBreak * dmgPlated

	if (dmgBeforeBreak >= hp) {
		return Math.ceil(hp / dmgPlated)
	}

	if (dmgNaked <= 0) return 0

	const remaining = hp - dmgBeforeBreak
	return shotsToBreak + Math.ceil(remaining / dmgNaked)
}

export function getDmgPerShot(
	weapon: Item,
	ammo: Item | null,
	hitZone: HitZone,
	dist: number,
	variantIndex: number,
	plate?: Item | null
): number {
	const block = getDamageBlock(weapon)
	if (!block) return 0

	const variantBase = getDamageVariant(weapon, variantIndex)
	const startDamage = variantBase > 0 ? variantBase : block.startDamage
	const baseRatio =
		block.startDamage > 0 ? startDamage / block.startDamage : 1

	let dmg = getDamageAt(block, dist) * baseRatio

	const ammoDmgBonus = ammo ? getAmmoDamageBonus(ammo) : 0
	dmg *= 1 + ammoDmgBonus / 100

	const mods = getDamageModifiers(weapon)
	const zoneMult =
		hitZone === 'head' ? mods.head : hitZone === 'limbs' ? mods.limbs : 1

	dmg *= zoneMult

	if (hitZone === 'body' && plate) {
		const absorption = getPlateDamageAbsorption(plate)
		dmg *= 1 - absorption / 100
	}

	return Math.max(0, dmg)
}
