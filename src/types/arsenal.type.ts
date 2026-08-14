import type { Message } from './item.type'

export interface ArsenalResponse {
	updatedAt: string
	total: number
	items: Item[]
}

export interface Item {
	name: Message
	drop: boolean
	reputation: number
	weight: number
	currentPrice: number
	limit?: number
}
