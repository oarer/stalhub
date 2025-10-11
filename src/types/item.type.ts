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
}

export type ItemElement = {
    type: 'item'
    name: Message
}

export type TextElement = {
    type: 'text'
    text: Message
}

export type StringKVElement = {
    type: 'key-value'
    key: Message
    value: Message
}

export type NumericElement = {
    type: 'numeric'
    name: Message
    value: number
}

export type NumericRangeElement = {
    type: 'range'
    name: Message
    min: number
    max: number
}

export type InfoElement =
    | PriceElement
    | ItemElement
    | TextElement
    | StringKVElement
    | NumericElement
    | NumericRangeElement

export type DamageDistanceInfoBlock = {
    type: 'damage'
    startDamage: number
    damageDecreaseStart: number
    endDamage: number
    damageDecreaseEnd: number
    maxDistance: number
}

export type InfoBlock =
    | TextInfoBlock
    | ElementListBlock
    | DamageDistanceInfoBlock

export interface Item {
    id: string
    category: string
    name: Message
    color: InfoColor
    status?: BindState
    infoBlocks: InfoBlock[]
}
