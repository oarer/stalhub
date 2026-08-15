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
}
export interface ItemListing {
	data: string
	icon: string
	name: ItemName
	color: InfoColor
}
