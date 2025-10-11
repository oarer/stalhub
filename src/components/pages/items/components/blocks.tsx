'use client'

import React from 'react'

import type {
    InfoElement,
    TextInfoBlock,
    DamageDistanceInfoBlock,
    ElementListBlock,
} from '@/types/item.type'
import { messageToString, roundNumber, type Locale } from '@/utils/itemHelper'
import InfoElementRenderer from './InfoRenderer'

export const TextBlock: React.FC<{ block: TextInfoBlock; locale: Locale }> = ({
    block,
    locale,
}) => {
    const text = messageToString(block.text, locale)

    if (!text) return null

    return <p className="font-semibold">{text}</p>
}

export const DamageBlock: React.FC<{ block: DamageDistanceInfoBlock }> = ({
    block,
}) => (
    <section className="rounded-md border-l-4 border-red-500 bg-neutral-900 p-3">
        <h4 className="mb-2 font-semibold">Damage</h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-200">
            <div>Start: {roundNumber(block.startDamage)}</div>
            <div>End: {roundNumber(block.endDamage)}</div>
            <div>
                Decrease: {roundNumber(block.damageDecreaseStart)} →{' '}
                {roundNumber(block.damageDecreaseEnd)}
            </div>
            <div>Max distance: {roundNumber(block.maxDistance)}</div>
        </div>
    </section>
)

const HIDDEN_KEYS = new Set([
    'core.quality.common',
    'stalker.tooltip.artefact.not_probed',
    'stalker.tooltip.artefact.info.freshness',
    'stalker.tooltip.artefact.info.durability',
    'stalker.tooltip.artefact.info.max_durability',
])

const getElementKey = (el: InfoElement): string | undefined => {
    switch (el.type) {
        case 'key-value':
            return el.key.type === 'translation' ? el.key.key : undefined
        case 'item':
            return el.name.type === 'translation' ? el.name.key : undefined
        case 'text':
            return el.text.type === 'translation' ? el.text.key : undefined
        case 'numeric':
        case 'range':
            return el.name.type === 'translation' ? el.name.key : undefined
        default:
            return undefined
    }
}

export const ListBlock: React.FC<{
    block: ElementListBlock
    locale: Locale
}> = ({ block, locale }) => {
    if (!Array.isArray(block.elements) || block.elements.length === 0)
        return null

    const visible = block.elements.filter((el) => {
        const key = getElementKey(el)
        return !key || !HIDDEN_KEYS.has(key)
    })

    if (visible.length === 0) return null

    return (
        <section className="rounded-md border-l-4 border-blue-400 bg-neutral-900 p-3">
            {messageToString(block.title, locale) && (
                <h4 className="mb-2 font-semibold">
                    {messageToString(block.title, locale)}
                </h4>
            )}

            <div className="space-y-1">
                {visible.map((el, i) => (
                    <InfoElementRenderer el={el} key={i} locale={locale} />
                ))}
            </div>
        </section>
    )
}
