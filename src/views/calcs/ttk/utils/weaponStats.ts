import type {
	DamageDistanceInfoBlock,
	ElementListBlock,
	Item,
} from '@/types/item.type'

import type { TTKSeries } from '../components/TTKChart'
import { CUSTOM_ROF_MAP, HitZone } from '../constants/ttk'

export function getNumericStat(item: Item, key: string): number {
	for (const block of item.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'numeric' &&
				el.name?.type === 'translation' &&
				el.name.key === key
			) {
				return el.value ?? 0
			}
		}
	}

	return 0
}

export function getDamageVariant(item: Item, variantIndex: number): number {
	for (const block of item.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'numericVariants' &&
				el.name?.type === 'translation' &&
				el.name.key === 'core.tooltip.stat_name.damage_type.direct'
			) {
				const values = el.value ?? []
				if (!values.length) return 0

				const idx = Math.min(Math.max(variantIndex, 0), values.length - 1)
				return values[idx] ?? 0
			}
		}
	}

	return 0
}

export function getDamageBlock(
	item: Item | undefined | null
): DamageDistanceInfoBlock | null {
	if (!item) return null

	for (const block of item.infoBlocks) {
		if (block.type === 'damage') return block as DamageDistanceInfoBlock
	}

	return null
}

export function getDamageModifiers(item: Item): {
	head: number
	limbs: number
} {
	for (const block of item.infoBlocks) {
		if (block.type !== 'list') continue

		const b = block as ElementListBlock

		if (
			b.title?.type === 'translation' &&
			b.title.key === 'weapon.tooltip.weapon.info.damage_modifiers'
		) {
			let head = 1.4
			let limbs = 0.8

			for (const el of b.elements ?? []) {
				if (el.type !== 'text' || el.text?.type !== 'translation') continue

				const args = el.text.args as Record<string, string> | undefined
				const mod = Number.parseFloat(args?.modifier ?? '1')

				if (el.text.key === 'weapon.tooltip.weapon.head_damage_modifier') {
					head = Number.isFinite(mod) ? mod : head
				}

				if (el.text.key === 'weapon.tooltip.weapon.limbs_damage_modifier') {
					limbs = Number.isFinite(mod) ? mod : limbs
				}
			}

			return { head, limbs }
		}
	}

	return { head: 1.4, limbs: 0.8 }
}

export function getAmmoType(item: Item): string {
	for (const block of item.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'key-value' &&
				el.key?.type === 'translation' &&
				el.key.key === 'weapon.tooltip.weapon.info.ammo_type'
			) {
				return el.value?.type === 'translation' ? el.value.key : ''
			}
		}
	}

	return ''
}

export function getAmmoDamageBonus(ammo: Item): number {
	for (const block of ammo.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'numeric' &&
				el.name?.type === 'translation' &&
				el.name.key === 'weapon.tooltip.bullet.stat_name.damage'
			) {
				return el.value ?? 0
			}
		}
	}

	return 0
}

export function getDamageAt(
	block: DamageDistanceInfoBlock,
	dist: number
): number {
	const {
		startDamage,
		endDamage,
		damageDecreaseStart,
		damageDecreaseEnd,
	} = block

	if (dist <= damageDecreaseStart) return startDamage
	if (dist >= damageDecreaseEnd) return endDamage

	const t =
		(dist - damageDecreaseStart) /
		(damageDecreaseEnd - damageDecreaseStart)

	return startDamage + t * (endDamage - startDamage)
}

export const AMMO_TYPE_MAP: Record<string, string[]> = {
	'item.wpn.display_ammo_types.556mm': ['item.amm.556'],
	'item.wpn.display_ammo_types.545mm': ['item.amm.545'],
	'item.wpn.display_ammo_types.762mm': ['item.amm.762'],
	'item.wpn.display_ammo_types.9mm': ['item.amm.9'],
	'item.wpn.display_ammo_types.939mm': ['item.amm.939'],
	'item.wpn.display_ammo_types.127mm': ['item.amm.127'],
	'item.wpn.display_ammo_types.12gauge': ['item.amm.12'],
	'item.wpn.display_ammo_types.10gauge': ['item.amm.10'],
	'item.wpn.display_ammo_types.23mm': ['item.amm.23'],
}

export function getCompatibleAmmo(
	ammoItems: Item[],
	ammoTypeKey: string
): Item[] {
	const prefixes = AMMO_TYPE_MAP[ammoTypeKey]
	if (!prefixes) return []

	return ammoItems.filter((a) => {
		const nameKey = a.name?.type === 'translation' ? a.name.key : ''
		if (!nameKey.startsWith('item.amm.')) return false

		const normalized = nameKey.replace(/\.name$/, '')
		const itemCaliber = normalized.split('.')[2]?.match(/^\d+/)?.[0]
		if (!itemCaliber) return false

		return prefixes.some((p) => p === `item.amm.${itemCaliber}`)
	})
}

export function getAmmoPenetration(ammo: Item): number {
	for (const block of ammo.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'numeric' &&
				el.name?.type === 'translation' &&
				el.name.key === 'weapon.tooltip.bullet.stat_name.armor_penetration'
			) {
				return el.value ?? 0
			}
		}
	}

	return 0
}

export function getPlateDamageAbsorption(plate: Item): number {
	for (const block of plate.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'numeric' &&
				el.name?.type === 'translation' &&
				el.name.key === 'stalker.tooltip.armor_plate.stat_name.damage_absorption'
			) {
				return el.value ?? 0
			}
		}
	}

	return 0
}

export function getPlateMaxDurability(plate: Item): number {
	for (const block of plate.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'numeric' &&
				el.name?.type === 'translation' &&
				el.name.key === 'stalker.tooltip.armor_plate.stat_name.armor'
			) {
				return el.value ?? 0
			}
		}
	}

	return 0
}

function getShotsToKill(effectiveHp: number, damagePerShot: number): number {
	if (effectiveHp <= 0 || damagePerShot <= 0) return 0
	return Math.floor((effectiveHp - 1e-9) / damagePerShot) + 1
}

export function getDmgPerShot(
	weapon: Item,
	ammo: Item | null,
	hitZone: HitZone,
	dist: number,
	variantIndex: number,
	plate?: Item | null,
): number {
	const block = getDamageBlock(weapon)
	if (!block) return 0

	const variantBase = getDamageVariant(weapon, variantIndex)
	const start = variantBase > 0 ? variantBase : block.startDamage

	const scale = start / block.startDamage
	const scaledBlock: DamageDistanceInfoBlock = {
		...block,
		startDamage: block.startDamage * scale,
		endDamage: block.endDamage * scale,
	}

	let dmg = getDamageAt(scaledBlock, dist)

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
	hp: number,
	hitZone: HitZone,
	dist: number,
	variantIndex: number,
	plate?: Item | null,
	plateDurability?: number,
): number {
	const rof = CUSTOM_ROF_MAP[weapon.id] ?? getNumericStat(
		weapon,
		'weapon.tooltip.weapon.info.rate_of_fire'
	)
	if (rof <= 0) return 0

	const shotInterval = 60 / rof

	if (!plate || hitZone !== 'body') {
		const dmg = getDmgPerShot(weapon, ammo, hitZone, dist, variantIndex)
		const shots = getShotsToKill(hp, dmg)
		if (shots <= 0) return 0

		return (shots - 1) * shotInterval + getReloadTime(weapon, shots)
	}

	const dmgNaked = getDmgPerShot(weapon, ammo, hitZone, dist, variantIndex)
	if (dmgNaked <= 0) return 0

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

	let durability = plateDurability ?? getPlateMaxDurability(plate)
	let remainingHp = hp
	let shots = 0

	while (remainingHp > 0) {
		const dmg = durability > 0 ? dmgPlated : dmgNaked

		remainingHp -= dmg
		durability -= drainPerShot
		shots++

		if (shots > 10000) break
	}

	return (shots - 1) * shotInterval + getReloadTime(weapon, shots)
}

export function buildSeries(
	weapon: Item,
	ammo: Item | null,
	hp: number,
	hitZone: HitZone,
	variantIndex: number,
	plate?: Item | null,
	plateDurability?: number,
): TTKSeries {
	const block = getDamageBlock(weapon)
	const label =
		weapon.name?.type === 'translation' ? (weapon.name.lines?.ru ?? '') : ''

	if (!block) return { label, color: '', points: [] }

	const step = Math.max(1, Math.round(block.maxDistance / 80))
	const points: { x: number; y: number }[] = []

	for (let d = 0; d <= block.maxDistance; d += step) {
		points.push({
			x: d,
			y: calcTTKAtDist(
				weapon,
				ammo,
				hp,
				hitZone,
				d,
				variantIndex,
				plate,
				plateDurability
			),
		})
	}

	if (points[points.length - 1]?.x !== block.maxDistance) {
		points.push({
			x: block.maxDistance,
			y: calcTTKAtDist(
				weapon,
				ammo,
				hp,
				hitZone,
				block.maxDistance,
				variantIndex,
				plate,
				plateDurability
			),
		})
	}

	return { label, color: '', points }
}