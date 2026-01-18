'use client'

import React from 'react'

import type { InfoElement, Locale } from '@/types/item.type'
import {
    isItemElement,
    isTextElement,
    isKeyValueElement,
    isNumericElement,
    isRangeElement,
    isUsageElement,
    isNumericVariantsBlock,
} from '@/utils/itemUtils'
import {
    ItemElement,
    TextElement,
    KeyValueElement,
    NumericElement,
    RangeElement,
    FallbackElement,
    UsageElement,
    NumericVariantsElementRenderer,
} from './elements'

export const InfoElementRenderer: React.FC<{
    numericVariants: number
    el: InfoElement
    locale: Locale
}> = ({ el, locale, numericVariants }) => {
    if (isItemElement(el)) return <ItemElement el={el} locale={locale} />
    if (isTextElement(el)) return <TextElement el={el} locale={locale} />
    if (isKeyValueElement(el))
        return <KeyValueElement el={el} locale={locale} />
    if (isNumericElement(el)) return <NumericElement el={el} locale={locale} />
    if (isRangeElement(el)) return <RangeElement el={el} locale={locale} />
    if (isUsageElement(el)) return <UsageElement el={el} locale={locale} />
    if (isNumericVariantsBlock(el))
        return (
            <NumericVariantsElementRenderer
                el={el}
                locale={locale}
                numericVariants={numericVariants}
            />
        )
    return <FallbackElement el={el} />
}

export default InfoElementRenderer
