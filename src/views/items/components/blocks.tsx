'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import type {
	AddStatBlock,
	ElementListBlock,
	InfoElement,
	Locale,
	Message,
	TextInfoBlock,
} from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import InfoElementRenderer from './InfoRenderer'

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

export const NumericVariantsCard: React.FC<{
	numericVariants: number
	onChange: (v: number) => void
	withCard?: boolean
}> = ({ numericVariants, onChange, withCard = true }) => {
	const content = (
		<div className="flex items-center justify-between">
			<p className="font-semibold text-lg">Заточка</p>
			<Input
				className="m-1 w-fit px-2 py-2"
				max={15}
				min={0}
				onChange={(e) => onChange(Number(e.target.value))}
				type="number"
				value={numericVariants}
			/>
		</div>
	)

	return withCard ? (
		<Card.Root className="py-1">{content}</Card.Root>
	) : (
		content
	)
}

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

type Block = ElementListBlock | AddStatBlock

export const ListBlock: React.FC<{
	numericVariants: number
	block: Block
	locale: Locale
	withCard?: boolean
	className?: string
}> = ({ block, locale, numericVariants, withCard = true, className }) => {
	if (!Array.isArray(block.elements) || block.elements.length === 0)
		return null

	const visible = block.elements.filter((el) => {
		const keys = getElementKeys(el)
		return !keys.some((k) => HIDDEN_KEYS.has(k))
	})

	if (visible.length === 0) return null

	const content = (
		<>
			{messageToString(block.title, locale) && (
				<p className="font-semibold">
					{messageToString(block.title, locale)}
				</p>
			)}

			<div className={cn('space-y-0.5', className)}>
				{visible.map((el, i) => (
					<InfoElementRenderer
						el={el}
						key={i}
						locale={locale}
						numericVariants={numericVariants}
					/>
				))}
			</div>
		</>
	)

	return withCard ? <Card.Root>{content}</Card.Root> : content
}
