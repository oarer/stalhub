import type {
	DamageDistanceInfoBlock,
	InfoElement,
	Item,
	MessageTranslation,
} from '@/types/item.type'
import { InfoColor } from '@/types/item.type'

export function translation(key: string): MessageTranslation {
	return { type: 'translation', key, args: {}, lines: { ru: key, en: key } }
}

export function numeric(key: string, value: number): InfoElement {
	return { type: 'numeric', name: translation(key), value }
}

export function item(id = 'fixture', elements: InfoElement[] = []): Item {
	return {
		id,
		category: 'weapon',
		name: translation(id),
		color: InfoColor.DEFAULT,
		infoBlocks: [{ type: 'list', title: translation('stats'), elements }],
	}
}

export function weapon(
	options: {
		id?: string
		damage?: number
		endDamage?: number
		rof?: number
		mag?: number
		reload?: number
		maxDistance?: number
	} = {}
): Item {
	const result = item(options.id, [
		numeric('weapon.tooltip.weapon.info.rate_of_fire', options.rof ?? 600),
		numeric('weapon.tooltip.weapon.info.clip_size', options.mag ?? 30),
		numeric(
			'weapon.tooltip.magazine.info.reload_time',
			options.reload ?? 2
		),
		{
			type: 'key-value',
			key: translation('weapon.tooltip.weapon.info.ammo_type'),
			value: translation('item.wpn.display_ammo_types.556mm'),
		},
	])
	const block: DamageDistanceInfoBlock = {
		type: 'damage',
		startDamage: options.damage ?? 40,
		endDamage: options.endDamage ?? 20,
		damageDecreaseStart: 10,
		damageDecreaseEnd: 30,
		maxDistance: options.maxDistance ?? 40,
	}
	result.infoBlocks.push(block)
	return result
}

export function ammo(
	caliber = '556',
	suffix = 'st',
	penetration = 0,
	bonus = 0
): Item {
	return item(`item.amm.${caliber}${suffix}.name`, [
		numeric('weapon.tooltip.bullet.stat_name.piercing', penetration),
		numeric('weapon.tooltip.bullet.stat_name.damage', bonus),
	])
}

export function plate(absorption = 50, durability = 20): Item {
	return item('plate', [
		numeric(
			'stalker.tooltip.armor_plate.stat_name.damage_absorption',
			absorption
		),
		numeric('stalker.tooltip.armor_plate.stat_name.armor', durability),
	])
}
