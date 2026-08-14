'use client'

import type React from 'react'

import type { InfoElement, Locale } from '@/types/item.type'
import {
	isItemElement,
	isKeyValueElement,
	isNumericElement,
	isNumericVariantsBlock,
	isRangeElement,
	isTextElement,
	isUsageElement,
} from '@/utils/itemUtils'
import type { StatOverride } from './attachments/attachmentStats'
import {
	FallbackElement,
	ItemElement,
	KeyValueElement,
	NumericElement,
	NumericVariantsElementRenderer,
	RangeElement,
	TextElement,
	UsageElement,
} from './elements'

const InfoElementRenderer: React.FC<{
	numericVariants: number
	el: InfoElement
	locale: Locale
	statOverrides?: Map<string, StatOverride>
}> = ({ el, locale, numericVariants, statOverrides }) => {
	if (isItemElement(el)) return <ItemElement el={el} locale={locale} />
	if (isTextElement(el)) return <TextElement el={el} locale={locale} />
	if (isKeyValueElement(el))
		return <KeyValueElement el={el} locale={locale} />
	if (isNumericElement(el)) {
		const key = el.name?.type === 'translation' ? el.name.key : undefined
		const override = key ? statOverrides?.get(key) : undefined

		return <NumericElement el={el} locale={locale} override={override} />
	}
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
