import type { InfoColor, ItemName } from './item.type'

export enum Regions {
	RU = 'RU',
	EU = 'EU',
	NA = 'NA',
	SEA = 'SEA',
	NEA = 'NEA',
}

export interface AuctionParams {
	region?: Regions
	id: string
	limit?: number
	offset?: number
	additional?: boolean
	uno?: boolean
}
export interface ItemListing {
	data: string
	icon?: string
	uno?: boolean
	name: ItemName
	color: InfoColor
}
