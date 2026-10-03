'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import { Accordion } from '@/components/ui/Accordion'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import type {
	GroupedBlock,
	InfoBlock,
	InfoElement,
	Locale,
	Message,
	TextInfoBlock,
} from '@/types/item.type'
import type { AccordionItem } from '@/types/ui/accordion.type'
import { type ListLikeBlock, messageToString } from '@/utils/itemUtils'
import type { StatOverride } from './attachments/attachmentStats'
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
	'weapon.lore.attachment.all_suitable_targets',
	'core.tooltip.info.durability',
	'core.tooltip.info.max_durability',
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
	const t = useTranslations()

	const content = (
		<div className="flex items-center justify-between">
			<p className="font-semibold text-lg">{t('ui.input_sharpening')}</p>
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
		case 'threshold':
			return el.name.type === 'translation' ? [el.name.key] : []
		default:
			return []
	}
}

export const hasVisibleElements = (block: ListLikeBlock): boolean => {
	if (!Array.isArray(block.elements) || block.elements.length === 0)
		return false
	if (block.title?.type === 'translation' && HIDDEN_KEYS.has(block.title.key))
		return false
	return block.elements.some((el) => {
		const keys = getElementKeys(el)
		return !keys.some((k) => HIDDEN_KEYS.has(k))
	})
}

export const ListBlock: React.FC<{
	numericVariants: number
	block: ListLikeBlock
	locale: Locale
	statOverrides?: Map<string, StatOverride>
	withCard?: boolean
	className?: string
}> = ({
	block,
	locale,
	numericVariants,
	statOverrides,
	withCard = true,
	className,
}) => {
	if (!hasVisibleElements(block)) return null

	const content = (
		<>
			{messageToString(block.title, locale) && (
				<p className="font-semibold">
					{messageToString(block.title, locale)}
				</p>
			)}

			<BlockRows
				block={block}
				className={className}
				locale={locale}
				numericVariants={numericVariants}
				statOverrides={statOverrides}
			/>
		</>
	)

	return withCard ? <Card.Root>{content}</Card.Root> : content
}

type GroupedBlockProps = {
	numericVariants: number
	block: GroupedBlock
	locale: Locale
	statOverrides?: Map<string, StatOverride>
	withCard?: boolean
}

const MISC_LABELS: Record<Locale, string> = {
	ru: 'Прочее',
	en: 'Miscellaneous',
	es: 'Otros',
	fr: 'Divers',
	ko: '기타',
}

const getBlockTitle = (block: ListLikeBlock, locale: Locale): string =>
	messageToString(block.title, locale).trim()

const getVisibleElements = (block: ListLikeBlock): InfoElement[] => {
	if (!Array.isArray(block.elements)) return []
	return block.elements.filter((el) => {
		const keys = getElementKeys(el)
		return !keys.some((k) => HIDDEN_KEYS.has(k))
	})
}

type BlockRowsProps = {
	numericVariants: number
	block: ListLikeBlock
	locale: Locale
	statOverrides?: Map<string, StatOverride>
	className?: string
}

const BlockRows: React.FC<BlockRowsProps> = ({
	block,
	locale,
	numericVariants,
	statOverrides,
	className,
}) => (
	<div className={cn('space-y-0.5', className)}>
		{getVisibleElements(block).map((el, i) => (
			<InfoElementRenderer
				el={el}
				key={i}
				locale={locale}
				numericVariants={numericVariants}
				statOverrides={statOverrides}
			/>
		))}
	</div>
)

type BlockAccordionProps = BlockRowsProps & {
	itemKey: string
	title?: string
}

const BlockAccordion: React.FC<BlockAccordionProps> = ({
	itemKey,
	title,
	...rowsProps
}) => {
	const header =
		title?.trim() || MISC_LABELS[rowsProps.locale] || MISC_LABELS.en
	const items: AccordionItem[] = [
		{
			key: itemKey,
			title: header,
			content: <BlockRows {...rowsProps} />,
		},
	]
	return (
		<Accordion
			className="rounded-lg bg-card px-2 ring-2 ring-primary/30"
			items={items}
			selectionMode="multiple"
			size="sm"
			titleClass="px-0"
			variant={'ghost'}
		/>
	)
}

export const GroupedBlockView: React.FC<GroupedBlockProps> = ({
	block,
	locale,
	numericVariants,
	statOverrides,
	withCard = true,
}) => {
	const compact = (block.compact ?? []).filter(hasVisibleElements)
	const detailed = (block.detailed ?? []).filter(hasVisibleElements)

	if (compact.length === 0 && detailed.length === 0) return null

	const content = (
		<>
			{compact.map((b, i) =>
				getBlockTitle(b, locale) ? (
					<BlockAccordion
						block={b}
						itemKey={`compact-${i}`}
						key={`compact-${i}`}
						locale={locale}
						numericVariants={numericVariants}
						statOverrides={statOverrides}
						title={getBlockTitle(b, locale)}
					/>
				) : (
					<ListBlock
						block={b}
						key={`compact-${i}`}
						locale={locale}
						numericVariants={numericVariants}
						statOverrides={statOverrides}
						withCard={withCard}
					/>
				)
			)}
			{detailed.map((b, i) => (
				<BlockAccordion
					block={b}
					itemKey={`detailed-${i}-${getBlockTitle(b, locale)}`}
					key={`detailed-${i}`}
					locale={locale}
					numericVariants={numericVariants}
					statOverrides={statOverrides}
					title={getBlockTitle(b, locale)}
				/>
			))}
		</>
	)

	return content
}

type InfoBlocksRendererProps = {
	infoBlocks: InfoBlock[]
	locale: Locale
	numericVariants: number
	statOverrides?: Map<string, StatOverride>
}

/**
 * Ordered renderer for stat blocks.
 * `text` / `damage` blocks are rendered elsewhere and skipped here.
 * Untitled head blocks stay as plain cards; every titled block becomes
 * its own collapsible accordion category. Blocks after a top-level
 * `show-all-toggle` marker are all collapsed into per-category accordions.
 */
export const InfoBlocksRenderer: React.FC<InfoBlocksRendererProps> = ({
	infoBlocks,
	locale,
	numericVariants,
	statOverrides,
}) => {
	if (!Array.isArray(infoBlocks) || infoBlocks.length === 0) return null

	const toggleIndex = infoBlocks.findIndex(
		(b) => b?.type === 'show-all-toggle'
	)
	const head =
		toggleIndex === -1 ? infoBlocks : infoBlocks.slice(0, toggleIndex)
	const tail = toggleIndex === -1 ? [] : infoBlocks.slice(toggleIndex + 1)

	const renderHeadBlock = (block: InfoBlock, key: string) => {
		if (!block) return null
		if (block.type === 'list' || block.type === 'addStat') {
			if (!hasVisibleElements(block)) return null
			const title = getBlockTitle(block, locale)
			return title ? (
				<BlockAccordion
					block={block}
					itemKey={key}
					key={key}
					locale={locale}
					numericVariants={numericVariants}
					statOverrides={statOverrides}
					title={title}
				/>
			) : (
				<ListBlock
					block={block}
					key={key}
					locale={locale}
					numericVariants={numericVariants}
					statOverrides={statOverrides}
				/>
			)
		}
		if (block.type === 'grouped') {
			const hasVisible =
				(block.compact ?? []).some(hasVisibleElements) ||
				(block.detailed ?? []).some(hasVisibleElements)
			if (!hasVisible) return null
			return (
				<GroupedBlockView
					block={block}
					key={key}
					locale={locale}
					numericVariants={numericVariants}
					statOverrides={statOverrides}
				/>
			)
		}
		return null
	}

	const renderTailBlock = (block: InfoBlock, key: string) => {
		if (!block) return null
		if (block.type === 'list' || block.type === 'addStat') {
			if (!hasVisibleElements(block)) return null
			return (
				<BlockAccordion
					block={block}
					itemKey={key}
					key={key}
					locale={locale}
					numericVariants={numericVariants}
					statOverrides={statOverrides}
					title={getBlockTitle(block, locale)}
				/>
			)
		}
		if (block.type === 'grouped') {
			const hasVisible =
				(block.compact ?? []).some(hasVisibleElements) ||
				(block.detailed ?? []).some(hasVisibleElements)
			if (!hasVisible) return null
			return (
				<GroupedBlockView
					block={block}
					key={key}
					locale={locale}
					numericVariants={numericVariants}
					statOverrides={statOverrides}
				/>
			)
		}
		return null
	}

	return (
		<>
			{head.map((block, i) => renderHeadBlock(block, `head-${i}`))}
			{tail.map((block, i) => renderTailBlock(block, `tail-${i}`))}
		</>
	)
}
