'use client'

import React from 'react'

import type { InfoElement } from '@/types/item.type'
import {
    isPriceElement,
    isItemElement,
    isTextElement,
    isKeyValueElement,
    isNumericElement,
    isRangeElement,
} from '@/utils/itemHelper'
import {
    PriceElement,
    ItemElement,
    TextElement,
    KeyValueElement,
    NumericElement,
    RangeElement,
    FallbackElement,
} from './elements'
import type { Locale } from '@/utils/itemHelper'

export const InfoElementRenderer: React.FC<{
    el: InfoElement
    locale: Locale
}> = ({ el, locale }) => {
    if (isPriceElement(el)) return <PriceElement el={el} locale={locale} />
    if (isItemElement(el)) return <ItemElement el={el} locale={locale} />
    if (isTextElement(el)) return <TextElement el={el} locale={locale} />
    if (isKeyValueElement(el))
        return <KeyValueElement el={el} locale={locale} />
    if (isNumericElement(el)) return <NumericElement el={el} locale={locale} />
    if (isRangeElement(el)) return <RangeElement el={el} locale={locale} />
    return <FallbackElement el={el} />
}

export default InfoElementRenderer
