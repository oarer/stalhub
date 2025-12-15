'use client'

import React from 'react'

import type {
    InfoElement,
    TextInfoBlock,
    DamageDistanceInfoBlock,
    ElementListBlock,
    Locale,
    Message,
} from '@/types/item.type'
import { messageToString, roundNumber } from '@/utils/itemUtils'
import InfoElementRenderer from './InfoRenderer'
import { Card, CardContent } from '@/components/ui/Card'

const HIDDEN_KEYS = new Set([
    'core.quality.common',
    'stalker.tooltip.artefact.not_probed',
    'stalker.tooltip.artefact.info.freshness',
    'stalker.tooltip.artefact.info.durability',
    'stalker.tooltip.artefact.info.max_durability',
    'stalker.lore.armor_artefact.info.compatible_backpacks',
    'general.armor.compatibility.backpacks.superheavy',
    'stalker.lore.armor_artefact.info.compatible_containers',
    'general.armor.compatibility.containers.bulky',
    'item.att.temp_model_armor.additional_stats_tip',
    'core.tooltip.stat_name.damage_type.direct',
])

export const TextBlock: React.FC<{ block: TextInfoBlock; locale: Locale }> = ({
    block,
    locale,
}) => {
    const keys = [block.title, block.text]
        .filter((msg): msg is Message => !!msg)
        .flatMap((msg) => (msg.type === 'translation' ? [msg.key] : []))

    if (keys.some((k) => HIDDEN_KEYS.has(k))) return null

    const text = messageToString(block.text, locale)
    if (!text) return null

    return (
        <p className="space-y-2 text-center font-semibold">
            {text.split('\\n\\n').map((line, i) => (
                <React.Fragment key={i}>
                    {line}
                    <br />
                </React.Fragment>
            ))}
        </p>
    )
}

export const DamageBlock: React.FC<{ block: DamageDistanceInfoBlock }> = ({
    block,
}) => (
    <Card>
        <CardContent>
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
        </CardContent>
    </Card>
)

const getElementKeys = (el: InfoElement): string[] => {
    switch (el.type) {
        case 'key-value':
            return el.key.type === 'translation' ? [el.key.key] : []
        case 'item':
            return el.name.type === 'translation' ? [el.name.key] : []
        case 'text':
            return el.text.type === 'translation' ? [el.text.key] : []
        case 'numeric':
        case 'range':
            return el.name.type === 'translation' ? [el.name.key] : []
        default:
            return []
    }
}

export const ListBlock: React.FC<{
    numericVariants: number
    block: ElementListBlock
    locale: Locale
}> = ({ block, locale, numericVariants }) => {
    if (!Array.isArray(block.elements) || block.elements.length === 0)
        return null

    const visible = block.elements.filter((el) => {
        const keys = getElementKeys(el)
        return !keys.some((k) => HIDDEN_KEYS.has(k))
    })

    if (visible.length === 0) return null

    return (
        <Card>
            {messageToString(block.title, locale) && (
                <p className="font-semibold">
                    {messageToString(block.title, locale)}
                </p>
            )}

            <div className="space-y-0.5">
                {visible.map((el, i) => (
                    <InfoElementRenderer
                        el={el}
                        key={i}
                        locale={locale}
                        numericVariants={numericVariants}
                    />
                ))}
            </div>
        </Card>
    )
}
