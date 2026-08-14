import type { Message, MessageTranslation } from './item.type'

export type CurrencyType = 'barter' | 'barter_coins' | 'crimson_shell'

export type BarterResponse = {
	settlement_required_level: string
	settlement_titles: Message[]
	used_in: UsedInItem[]
	recipes: BarterRecipeResult[]
}

export type BarterRequiredItem = {
	item: string
	amount: number
}

export type BarterOffer = {
	currency: string
	cost: number
	requiredItems: BarterRequiredItem[]
}

export type BarterRecipe = {
	settlementRequiredLevel: number
	item: string
	offers: BarterOffer[]
}

export type SettlementTitle = {
	type: string
	key: string
	args: Record<string, never>
	lines: MessageTranslation['lines']
}

export type BarterEntry = {
	settlementTitle: SettlementTitle
	recipes: BarterRecipe[]
}

export type ListingItem = {
	data: string
	icon: string
	name: Message
	color: string
}

export type UsedInItem = {
	item_id: string
	category: string
	lines: Message
	color: string
}

export type BarterItemResult = {
	amount: number
	lines: Message
	category: string
	color: string
}

export type BarterRecipeResult = {
	money: number
	items: BarterItemResult[]
}
