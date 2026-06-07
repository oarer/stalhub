import type {
	DamageDistanceInfoBlock,
	ElementListBlock,
	Item,
} from '@/types/item.type'

import type { TTKSeries } from '../components/TTKChart'

export function getNumericStat(item: Item, key: string): number {
	for (const block of item.infoBlocks) {
		if (block.type !== 'list') continue
		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'numeric' &&
				el.name?.type === 'translation' &&
				el.name.key === key
			)
				return el.value ?? 0
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
				const idx = Math.min(
					Math.max(variantIndex, 0),
					values.length - 1
				)
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
				if (el.type === 'text' && el.text?.type === 'translation') {
					const args = el.text.args as
						| Record<string, string>
						| undefined
					const mod = parseFloat(args?.modifier ?? '1')
					if (
						el.text.key ===
						'weapon.tooltip.weapon.head_damage_modifier'
					)
						head = mod
					if (
						el.text.key ===
						'weapon.tooltip.weapon.limbs_damage_modifier'
					)
						limbs = mod
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
			)
				return el.value?.type === 'translation' ? el.value.key : ''
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
			)
				return el.value ?? 0
		}
	}
	return 0
}

export function getDamageAt(
	block: DamageDistanceInfoBlock,
	dist: number
): number {
	const { startDamage, endDamage, damageDecreaseStart, damageDecreaseEnd } =
		block
	if (dist <= damageDecreaseStart) return startDamage
	if (dist >= damageDecreaseEnd) return endDamage
	const t =
		(dist - damageDecreaseStart) / (damageDecreaseEnd - damageDecreaseStart)
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
		return prefixes.some((p) => nameKey.startsWith(p))
	})
}

export function getAmmoPenetration(ammo: Item): number {
	for (const block of ammo.infoBlocks) {
		if (block.type !== 'list') continue
		for (const el of (block as ElementListBlock).elements ?? []) {
			if (
				el.type === 'numeric' &&
				el.name?.type === 'translation' &&
				el.name.key ===
					'weapon.tooltip.bullet.stat_name.armor_penetration'
			)
				return el.value ?? 0
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
				el.name.key ===
					'stalker.tooltip.armor_plate.stat_name.damage_absorption'
			)
				return el.value ?? 0
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
			)
				return el.value ?? 0
		}
	}
	return 0
}

export function getDmgPerShot(
	weapon: Item,
	ammo: Item | null,
	hitZone: 'body' | 'head' | 'limbs',
	dist: number,
	variantIndex: number,
	plate?: Item | null,
	currentPlateDurability?: number
): number {
	const block = getDamageBlock(weapon)
	if (!block) return 0
	const variantBase =
		getDamageVariant(weapon, variantIndex) || block.startDamage
	const scale = variantBase / block.startDamage
	const scaledStart = block.startDamage * scale
	const scaledEnd = block.endDamage * scale
	let baseDmg: number
	if (dist <= block.damageDecreaseStart) baseDmg = scaledStart
	else if (dist >= block.damageDecreaseEnd) baseDmg = scaledEnd
	else {
		const t =
			(dist - block.damageDecreaseStart) /
			(block.damageDecreaseEnd - block.damageDecreaseStart)
		baseDmg = scaledStart + t * (scaledEnd - scaledStart)
	}
	const ammoDmgBonus = ammo ? getAmmoDamageBonus(ammo) : 0
	const rawDmg = baseDmg * (1 + ammoDmgBonus / 100)
	const mods = getDamageModifiers(weapon)
	const zoneMult =
		hitZone === 'head' ? mods.head : hitZone === 'limbs' ? mods.limbs : 1
	const dmg = rawDmg * zoneMult

	if (hitZone === 'body' && plate && (currentPlateDurability ?? 1) > 0) {
		const absorption = getPlateDamageAbsorption(plate)
		return dmg - dmg * (absorption / 100)
	}

	return dmg
}

export function getReloadTime(weapon: Item, shots: number): number {
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
	hitZone: 'body' | 'head' | 'limbs',
	dist: number,
	variantIndex: number,
	plate?: Item | null,
	plateDurability?: number
): number {
	const rof = getNumericStat(
		weapon,
		'weapon.tooltip.weapon.info.rate_of_fire'
	)
	if (rof <= 0) return 0

	// No plate simulation needed — use simple formula
	if (!plate || hitZone !== 'body') {
		const dmg = getDmgPerShot(weapon, ammo, hitZone, dist, variantIndex)
		if (dmg <= 0) return 0
		const shots = Math.ceil(hp / dmg)
		return (shots - 1) * (60 / rof) + getReloadTime(weapon, shots)
	}

	// Simulate shot-by-shot with plate durability drain
	const dmgNaked = getDmgPerShot(weapon, ammo, hitZone, dist, variantIndex)
	const dmgPlated = getDmgPerShot(
		weapon,
		ammo,
		hitZone,
		dist,
		variantIndex,
		plate,
		1
	)
	if (dmgNaked <= 0) return 0

	const absorption = getPlateDamageAbsorption(plate)
	const drainPerShot = dmgNaked * (absorption / 100) // durability drained per shot

	let durability = plateDurability ?? getPlateMaxDurability(plate)
	let remainingHp = hp
	let shots = 0

	while (remainingHp > 0) {
		const dmg = durability > 0 ? dmgPlated : dmgNaked
		remainingHp -= dmg
		durability -= drainPerShot
		shots++
		if (shots > 10000) break // safety
	}

	return (shots - 1) * (60 / rof) + getReloadTime(weapon, shots)
}

export function buildSeries(
	weapon: Item,
	ammo: Item | null,
	hp: number,
	hitZone: 'body' | 'head' | 'limbs',
	variantIndex: number,
	plate?: Item | null,
	plateDurability?: number
): TTKSeries {
	const block = getDamageBlock(weapon)
	const label =
		weapon.name?.type === 'translation' ? (weapon.name.lines?.ru ?? '') : ''
	if (!block) return { label, color: '', points: [] }
	const step = Math.max(1, Math.round(block.maxDistance / 80))
	const points: { x: number; y: number }[] = []
	for (let d = 0; d <= block.maxDistance; d += step)
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
	if (points[points.length - 1]?.x !== block.maxDistance)
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
	return { label, color: '', points }
}
