'use client'

import type {
    InfoElement,
    Locale,
    NumericVariantsElement,
} from '@/types/item.type'
import {
    messageToString,
    hasFormatted,
    roundNumber,
    getValueColorByRankKey,
} from '@/utils/itemUtils'

function normalizeColor(raw?: string): string | undefined {
    if (!raw) return undefined
    const trimmed = raw.trim()
    if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed
    if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed}`
    return undefined
}

export const ItemElement: React.FC<{
    el: Extract<InfoElement, { type: 'item' }>
    locale: Locale
}> = ({ el, locale }) => {
    const name = messageToString(el.name, locale)
    const nameColor = normalizeColor(el.formatted?.nameColor)
    const valueColor = normalizeColor(el.formatted?.valueColor)
    return (
        <div className="flex justify-between">
            <p
                className="font-semibold"
                style={nameColor ? { color: nameColor } : undefined}
            >
                {name}
            </p>
            <p
                className="text-sm"
                style={valueColor ? { color: valueColor } : undefined}
            >
                item
            </p>
        </div>
    )
}

export const TextElement: React.FC<{
    el: Extract<InfoElement, { type: 'text' }>
    locale: Locale
}> = ({ el, locale }) => {
    const text = messageToString(el.text, locale)
    const valueColor = normalizeColor(el.formatted?.valueColor)
    return (
        <p
            className="font-semibold"
            style={valueColor ? { color: valueColor } : undefined}
        >
            {text}
        </p>
    )
}

export const KeyValueElement: React.FC<{
    el: Extract<InfoElement, { type: 'key-value' }>
    locale: Locale
}> = ({ el, locale }) => {
    const key = messageToString(el.key, locale)
    const value = messageToString(el.value, locale)

    const nameColor = normalizeColor(el.formatted?.nameColor)
    const valueColor =
        normalizeColor(el.formatted?.valueColor) ||
        getValueColorByRankKey(el.value)

    return (
        <div className="flex justify-between">
            <p
                className="font-semibold"
                style={nameColor ? { color: nameColor } : undefined}
            >
                {key}
            </p>
            <p
                className="font-medium"
                style={valueColor ? { color: valueColor } : undefined}
            >
                {value}
            </p>
        </div>
    )
}

export const NumericElement: React.FC<{
    el: Extract<InfoElement, { type: 'numeric' }>
    locale: Locale
}> = ({ el, locale }) => {
    const name = messageToString(el.name, locale)
    const nameColor = normalizeColor(el.formatted?.nameColor)

    const display =
        hasFormatted(el) && el.formatted?.value?.[locale]
            ? el.formatted.value[locale]
            : roundNumber(el.value)

    return (
        <div className="flex justify-between">
            <p
                className="font-semibold"
                style={nameColor ? { color: nameColor } : undefined}
            >
                {name}
            </p>
            <p
                className="font-medium"
                style={nameColor ? { color: nameColor } : undefined}
            >
                {display}
            </p>
        </div>
    )
}

export const RangeElement: React.FC<{
    el: Extract<InfoElement, { type: 'range' }>
    locale: Locale
}> = ({ el, locale }) => {
    const name = messageToString(el.name, locale)
    const nameColor = normalizeColor(el.formatted?.nameColor)
    const valueColor = normalizeColor(el.formatted?.valueColor)

    const display =
        hasFormatted(el) && el.formatted?.value?.[locale]
            ? el.formatted.value[locale]
            : `${roundNumber(el.min)} — ${roundNumber(el.max)}`

    return (
        <div className="flex justify-between">
            <p
                className="font-semibold"
                style={nameColor ? { color: nameColor } : undefined}
            >
                {name}
            </p>
            <p
                className="font-medium"
                style={valueColor ? { color: valueColor } : undefined}
            >
                {display}
            </p>
        </div>
    )
}

export const UsageElement: React.FC<{
    el: Extract<InfoElement, { type: 'usage' }>
    locale: Locale
}> = ({ el, locale }) => {
    const name = messageToString(el.name, locale)
    const valueColor = normalizeColor(el.formatted?.valueColor)

    return (
        <p
            className="font-semibold"
            style={valueColor ? { color: valueColor } : undefined}
        >
            {name}
        </p>
    )
}

export const FallbackElement: React.FC<{ el: InfoElement }> = ({ el }) => {
    return (
        <div className="text-sm text-red-200">
            <pre className="text-xs whitespace-pre-wrap text-red-400">
                {JSON.stringify(el, null, 2)}
            </pre>
        </div>
    )
}

export const NumericVariantsElementRenderer: React.FC<{
    el: NumericVariantsElement
    locale: Locale
    numericVariants: number
}> = ({ el, locale, numericVariants }) => {
    const name = messageToString(el.name, locale) || ''
    const values = Array.isArray(el.value) ? el.value : []
    const maxIdx = Math.max(0, values.length - 1)

    const point = numericVariants

    const nameColor = normalizeColor(el.formatted?.nameColor)
    const valueColor = normalizeColor(el.formatted?.valueColor)

    const current = values[point] ?? null
    const format = (v: number) =>
        Number.isInteger(v) ? String(v) : v.toFixed(2)

    return (
        <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-4">
                <div>
                    <div
                        className="truncate font-semibold"
                        style={nameColor ? { color: nameColor } : undefined}
                    >
                        {name}
                    </div>
                    <div className="text-xs font-semibold text-neutral-400">
                        Заточка {point} (0—{maxIdx})
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div
                    className="text-lg font-medium"
                    style={valueColor ? { color: valueColor } : undefined}
                >
                    {current !== null ? format(current) : '—'}
                </div>
            </div>
        </div>
    )
}
