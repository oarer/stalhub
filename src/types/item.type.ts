import { type ArtifactAdditional } from '@/utils/artUtils'

export type Locale = 'ru' | 'en' | 'es' | 'fr'
export const LOCALE: Locale = 'ru'

export type LocalizedString = {
    [K in Locale]?: string
}

export type MessageText = {
    type: 'text'
    text: string
}

export type MessageTranslation = {
    type: 'translation'
    key: string
    args: object
    lines: { [key: string]: string }
}

export type Message = MessageText | MessageTranslation

export interface ItemEntry {
    data: string
    icon: string
    name: Message
}

export enum InfoColor {
    DEFAULT = 'DEFAULT',
    QUEST_ITEM = 'QUEST_ITEM',
    RANK_NEWBIE = 'RANK_NEWBIE',
    RANK_STALKER = 'RANK_STALKER',
    RANK_VETERAN = 'RANK_VETERAN',
    RANK_MASTER = 'RANK_MASTER',
    RANK_LEGEND = 'RANK_LEGEND',
    ART_QUALITY_UNCOMMON = 'ART_QUALITY_UNCOMMON',
    ART_QUALITY_SPECIAL = 'ART_QUALITY_SPECIAL',
    ART_QUALITY_RARE = 'ART_QUALITY_RARE',
    ART_QUALITY_EXCLUSIVE = 'ART_QUALITY_EXCLUSIVE',
    ART_QUALITY_LEGENDARY = 'ART_QUALITY_LEGENDARY',
    ART_QUALITY_UNIQUE = 'ART_QUALITY_UNIQUE',
}

export const infoColorMap: Record<InfoColor, string> = {
    [InfoColor.DEFAULT]: '#FFFFFF',
    [InfoColor.QUEST_ITEM]: '#ABF1F1',
    [InfoColor.RANK_NEWBIE]: '#9DEB9D',
    [InfoColor.RANK_STALKER]: '#9F9FED',
    [InfoColor.RANK_VETERAN]: '#BF5BAD',
    [InfoColor.RANK_MASTER]: '#EA9D9E',
    [InfoColor.RANK_LEGEND]: '#FFD700',
    [InfoColor.ART_QUALITY_UNCOMMON]: '#00FF00',
    [InfoColor.ART_QUALITY_SPECIAL]: '#00FFFF',
    [InfoColor.ART_QUALITY_RARE]: '#0000FF',
    [InfoColor.ART_QUALITY_EXCLUSIVE]: '#FF00FF',
    [InfoColor.ART_QUALITY_LEGENDARY]: '#FFD700',
    [InfoColor.ART_QUALITY_UNIQUE]: '#FF4500',
}

export enum BindState {
    NONE = 'NONE',
    NON_DROP = 'NON_DROP',
    PERSONAL_ON_USE = 'PERSONAL_ON_USE',
    PERSONAL_ON_GET = 'PERSONAL_ON_GET',
    PERSONAL = 'PERSONAL',
    PERSONAL_UNTIL = 'PERSONAL_UNTIL',
    PERSONAL_DROP_ON_GET = 'PERSONAL_DROP_ON_GET',
    PERSONAL_DROP = 'PERSONAL_DROP',
}

export type FormattedBlock = {
    formatted?: {
        value?: LocalizedString
        nameColor?: string
        valueColor?: string
    }
}

export type TextInfoBlock = {
    type: 'text'
    title: Message
    text: Message
}

export type ElementListBlock = {
    type: 'list'
    title: Message
    elements: InfoElement[]
}

export type PriceElement = {
    type: 'price'
    currency: string
    amount: number
} & FormattedBlock

export type ItemElement = {
    type: 'item'
    name: Message
} & FormattedBlock

export type TextElement = {
    type: 'text'
    text: Message
} & FormattedBlock

export type StringKVElement = {
    type: 'key-value'
    key: Message
    value: Message
} & FormattedBlock

export type NumericElement = {
    type: 'numeric'
    name: Message
    value: number
} & FormattedBlock

export type NumericRangeElement = {
    type: 'range'
    name: Message
    min: number
    max: number
} & FormattedBlock

export type Usage = {
    type: 'usage'
    name: Message
    value: number
} & FormattedBlock

export type NumericVariantsElement = {
    type: 'numericVariants'
    name: Message
    value: number[]
    nameColor?: string
    valueColor?: string
} & FormattedBlock

export type InfoElement =
    | PriceElement
    | ItemElement
    | TextElement
    | StringKVElement
    | NumericElement
    | NumericRangeElement
    | NumericVariantsElement
    | Usage

export type DamageDistanceInfoBlock = {
    type: 'damage'
    startDamage: number
    damageDecreaseStart: number
    endDamage: number
    damageDecreaseEnd: number
    maxDistance: number
} & FormattedBlock

export type InfoBlock =
    | TextInfoBlock
    | ElementListBlock
    | DamageDistanceInfoBlock
    | NumericVariantsElement

export interface Item {
    id: string
    category: string
    name: Message
    color: InfoColor
    status?: BindState
    infoBlocks: InfoBlock[]
}

// Auction types
export interface Lot {
    itemId: string
    amount: number
    startPrice: number
    currentPrice?: number
    buyoutPrice: number
    startTime: string
    endTime: string
    additional?: ArtifactAdditional
}
export interface LotsResponse {
    total: number
    lots: Lot[]
}

export interface LotHistory {
    amount: number
    price: number
    time: string
    additional?: ArtifactAdditional
}

export interface LotsHistoryResponse {
    total: number
    prices: LotHistory[]
}
