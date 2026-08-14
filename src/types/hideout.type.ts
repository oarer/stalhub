import type { Message } from './item.type'

export interface Hideout {
	perks: Perk[]
	recipes: Recipe[]
}

interface Perk {
	id: string
	name: Name
	desc: Desc
}

interface Name {
	type: string
	key: string
	lines: Message
}

interface Desc {
	type: string
	key: string
	lines: Message
}

export interface Recipe {
	bench: string
	category: Category
	subcategory: Subcategory
	result: Result[]
	ingredients: Ingredient[]
	energy: number
	requirements: Requirements
}

interface Category {
	type: string
	key: string
	lines: Message
}

interface Subcategory {
	type: string
	key: string
	lines: Message
}

interface Result {
	item: string
	amount: number
	price: number | null
}

interface Ingredient {
	item: string
	amount: number
	price: number | null
}

interface Requirements {
	perks: Perks
	features: string[]
}

interface Perks {
	ammunition?: number
	armorer?: number
	pyrotechnics?: number
	engineering?: number
	materials?: number
	medicine?: number
	cooking?: number
	brewing?: number
}
