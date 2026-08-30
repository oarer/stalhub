import type { ArtQuality, Item } from './item.type'

export type ItemsParams = {
	type:
		| 'artefact'
		| 'armor'
		| 'containers'
		| 'consumables'
		| 'weapons'
		| 'ammo'
		| 'plates'
}

export type ItemsResponse = Record<string, Item>

export type Art = {
	instance_id: string
	item_id: string
	percent: number
	potential: number
	selected_stats: (string | null)[]
	quality_class: ArtQuality
}

export type Armor = {
	id: string
	level: number
}

type Container = {
	id: string
	slots: (string | null)[]
}

export enum BoostCategory {
	LONG_TIME_MEDICINE = 'item.effects.effect_type.long_time_medicine',
	SHORT_TIME_MEDICINE = 'item.effects.effect_type.short_time_medicine',
	MOBILITY = 'item.effects.effect_type.mobility',
	ACCUMULATION = 'item.effects.effect_type.accumulation',
	HEALING = 'item.effects.effect_type.healing',
	PROTECTION = 'item.effects.effect_type.protection',
}

export const BoostButtons: Record<BoostCategory, string> = {
	[BoostCategory.LONG_TIME_MEDICINE]: 'lucide:heart-pulse',
	[BoostCategory.SHORT_TIME_MEDICINE]: 'lucide:pill',
	[BoostCategory.MOBILITY]: 'lucide:move',
	[BoostCategory.ACCUMULATION]: 'lucide:layers',
	[BoostCategory.HEALING]: 'lucide:sparkles',
	[BoostCategory.PROTECTION]: 'lucide:shield',
}


export type Build = {
	arts: Art[]
	boost: Record<BoostCategory, string | null>
	armor: Armor | null
	container?: Container | null
}

export type BuildDefaults = {
	art: {
		percent: number
		potential: number
	}
	armor: {
		level: number
	}
}

export type ModalManagerProps = {
	type: 'armor' | 'cont'
	clickType: 'LMB' | 'RMB'
	onClose: () => void
}

export type ModalProps = {
	onClose: () => void
}

export const percentButtons = [
	{
		value: 100,
		color: 'ring-neutral-600 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600',
	},
	{
		value: 115,
		color: 'ring-[#9DEB9D60] bg-[#9DEB9D20] hover:bg-[#9DEB9D40] active:bg-[#9DEB9D60]',
	},
	{
		value: 130,
		color: 'ring-[#9F9FED60] bg-[#9F9FED20] hover:bg-[#9F9FED40] active:bg-[#9F9FED60]',
	},
	{
		value: 145,
		color: 'ring-[#BF5BAD60] bg-[#BF5BAD20] hover:bg-[#BF5BAD40] active:bg-[#BF5BAD60]',
	},
	{
		value: 160,
		color: 'ring-[#EA9D9E60] bg-[#EA9D9E20] hover:bg-[#EA9D9E40] active:bg-[#EA9D9E60]',
	},
	{
		value: 175,
		color: 'ring-[#FFD70060] bg-[#FFD70020] hover:bg-[#FFD70040] active:bg-[#FFD70060]',
	},
]

export const potentialButtons = [0, 5, 10, 15] as const
