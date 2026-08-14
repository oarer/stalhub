import type { Message } from './item.type'

export type CurrencyType = 'barter' | 'barter_coins' | 'crimson_shell'

export type BarterResponse = {
	settlement_required_level: string
	settlement_titles: Message[]
	used_in: UsedInItem[]
	recipes: BarterRecipeResult[]
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
