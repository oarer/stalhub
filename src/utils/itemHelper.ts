import type { InfoElement, Message } from '@/types/item.type'

export type Locale = 'ru' | 'en' | 'es' | 'fr'
export const LOCALE: Locale = 'ru'

export type Formatted = {
    value?: Record<string, string>
    nameColor?: string
    valueColor?: string
}

export const isPriceElement = (
    el: InfoElement
): el is Extract<InfoElement, { type: 'price' }> => el.type === 'price'

export const isItemElement = (
    el: InfoElement
): el is Extract<InfoElement, { type: 'item' }> => el.type === 'item'

export const isTextElement = (
    el: InfoElement
): el is Extract<InfoElement, { type: 'text' }> => el.type === 'text'

export const isKeyValueElement = (
    el: InfoElement
): el is Extract<InfoElement, { type: 'key-value' }> => el.type === 'key-value'

export const isNumericElement = (
    el: InfoElement
): el is Extract<InfoElement, { type: 'numeric' }> => el.type === 'numeric'

export const isRangeElement = (
    el: InfoElement
): el is Extract<InfoElement, { type: 'range' }> => el.type === 'range'

export const hasFormatted = (v: unknown): v is { formatted?: Formatted } =>
    typeof v === 'object' && v !== null && 'formatted' in (v as object)

export const messageToString = (
    m: Message | undefined,
    locale: Locale = LOCALE
): string => {
    if (!m) return ''
    if (m.type === 'text') return m.text ?? ''
    if (m.type === 'translation') {
        return (
            m.lines?.[locale] ?? Object.values(m.lines ?? {})[0] ?? m.key ?? ''
        )
    }
    return ''
}

export const roundNumber = (n: number): string => {
    return Number.isInteger(n) ? String(n) : n.toFixed(2)
}
