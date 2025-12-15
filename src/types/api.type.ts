import type { InfoColor } from './item.type'

export interface AuctionParams {
    id: string
    limit?: number
    additional?: boolean
}

export interface ItemName {
    ru: string
    en: string
    es: string
    fr: string
}

export interface ItemListing {
    data: string
    icon: string
    name: ItemName
    color: InfoColor
}
