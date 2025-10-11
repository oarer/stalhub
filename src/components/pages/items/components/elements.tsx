'use client'

import React from 'react'

import type { InfoElement } from '@/types/item.type'
import {
    messageToString,
    hasFormatted,
    roundNumber,
    type Locale,
} from '@/utils/itemHelper'

export const PriceElement: React.FC<{
    el: Extract<InfoElement, { type: 'price' }>
    locale: Locale
}> = ({ el }) => (
    <div className="flex justify-between text-sm">
        <div className="text-gray-300">Price</div>
        <div className="font-medium">
            {el.amount} {el.currency}
        </div>
    </div>
)

export const ItemElement: React.FC<{
    el: Extract<InfoElement, { type: 'item' }>
    locale: Locale
}> = ({ el, locale }) => (
    <div className="flex justify-between">
        <div className="text-gray-300">{messageToString(el.name, locale)}</div>
        <div className="text-sm text-gray-200">item</div>
    </div>
)

export const TextElement: React.FC<{
    el: Extract<InfoElement, { type: 'text' }>
    locale: Locale
}> = ({ el, locale }) => (
    <div className="text-gray-200">{messageToString(el.text, locale)}</div>
)

export const KeyValueElement: React.FC<{
    el: Extract<InfoElement, { type: 'key-value' }>
    locale: Locale
}> = ({ el, locale }) => (
    <div className="flex justify-between border-b border-gray-700 py-1">
        <div className="text-gray-300">{messageToString(el.key, locale)}</div>
        <div className="font-medium">{messageToString(el.value, locale)}</div>
    </div>
)

export const NumericElement: React.FC<{
    el: Extract<InfoElement, { type: 'numeric' }>
    locale: Locale
}> = ({ el, locale }) => {
    const name = messageToString(el.name, locale)
    const display =
        hasFormatted(el) && el.formatted?.value?.[locale]
            ? el.formatted.value[locale]
            : roundNumber(el.value)
    return (
        <div className="flex justify-between border-b border-gray-700 py-1">
            <div className="text-gray-300">{name}</div>
            <div className="font-medium">{display}</div>
        </div>
    )
}

export const RangeElement: React.FC<{
    el: Extract<InfoElement, { type: 'range' }>
    locale: Locale
}> = ({ el, locale }) => {
    const name = messageToString(el.name, locale)
    const display =
        hasFormatted(el) && el.formatted?.value?.[locale]
            ? el.formatted.value[locale]
            : `${roundNumber(el.min)} — ${roundNumber(el.max)}`
    return (
        <div className="flex justify-between border-b border-gray-700 py-1">
            <div className="text-gray-300">{name}</div>
            <div className="font-medium">{display}</div>
        </div>
    )
}

export const FallbackElement: React.FC<{ el: InfoElement }> = ({ el }) => (
    <div className="text-sm text-gray-200">
        <pre className="text-xs whitespace-pre-wrap text-gray-400">
            {JSON.stringify(el, null, 2)}
        </pre>
    </div>
)
