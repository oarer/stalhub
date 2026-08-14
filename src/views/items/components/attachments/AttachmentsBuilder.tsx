'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { getLocale } from '@/lib/getLocale'
import { ItemsList } from '@/shared/components/ItemsList'
import type {
	AddStatBlock,
	ElementListBlock,
	Item,
	Locale,
	NumericElement,
} from '@/types/item.type'
import { messageToString, roundNumber } from '@/utils/itemUtils'
import { ListBlock } from '@/views/items/components/blocks'

const SLOT_ORDER = [
	'barrel',
	'collimator_sights',
	'forend',
	'mag',
	'pistol_handle',
	'other',
	'accessory',
]

export const getSlotKey = (category: string): string =>
	category.replace(/^attachment\//, '')

const getSlotOrder = (slotKey: string): number => {
	const index = SLOT_ORDER.indexOf(slotKey)
	return index === -1 ? SLOT_ORDER.length : index
}

const getIconUrl = (category: string, id: string): string =>
	`https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/${category}/${id}.png`

const getAttachmentWeight = (attachment: Item): number => {
	for (const block of attachment.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of block.elements ?? []) {
			if (
				el.type === 'numeric' &&
				el.name?.type === 'translation' &&
				el.name.key === 'core.tooltip.info.weight'
			) {
				return typeof el.value === 'number' ? el.value : 0
			}
		}
	}

	return 0
}

const getModifierElements = (attachment: Item): NumericElement[] => {
	const elements: NumericElement[] = []

	for (const block of attachment.infoBlocks) {
		if (block.type !== 'list') continue

		for (const el of block.elements ?? []) {
			if (el.type === 'numeric') elements.push(el)
		}
	}

	return elements
}

const formatModifierValue = (el: NumericElement, locale: Locale): string => {
	const formatted = el.formatted?.value?.[locale]
	if (formatted) return formatted

	if (typeof el.value !== 'number') return ''

	return `${roundNumber(el.value)}%`
}

const ModifiersPreview: React.FC<{ attachment: Item; locale: Locale }> = ({
	attachment,
	locale,
}) => {
	const modifiers = getModifierElements(attachment).slice(0, 3)

	if (modifiers.length === 0) return null

	return (
		<p className="mt-1 line-clamp-1 text-text-accent text-xs dark:text-neutral-400">
			{modifiers
				.map((el) => {
					const name = messageToString(el.name, locale)
					const value = formatModifierValue(el, locale)
					return name ? `${name}: ${value}` : value
				})
				.join(' · ')}
		</p>
	)
}

interface AttachmentsBuilderProps {
	attachments: Item[]
	selected: Record<string, string>
	onSelect: (category: string, attachmentId: string) => void
}

export const AttachmentsBuilder: React.FC<AttachmentsBuilderProps> = ({
	attachments,
	selected,
	onSelect,
}) => {
	const t = useTranslations()
	const locale = getLocale()

	const [activeSlot, setActiveSlot] = useState<string | null>(null)
	const [previewId, setPreviewId] = useState<string | null>(null)
	const [filter, setFilter] = useState('')

	const groups = useMemo(() => {
		const bySlot = new Map<string, Item[]>()

		for (const attachment of attachments) {
			const slotKey = getSlotKey(attachment.category)
			const list = bySlot.get(slotKey) ?? []
			list.push(attachment)
			bySlot.set(slotKey, list)
		}

		return [...bySlot.entries()].sort(
			(a, b) => getSlotOrder(a[0]) - getSlotOrder(b[0])
		)
	}, [attachments])

	const activeAttachments = useMemo(
		() => groups.find(([key]) => key === activeSlot)?.[1] ?? [],
		[groups, activeSlot]
	)

	const activeSelectedId = activeSlot ? (selected[activeSlot] ?? null) : null

	const previewItem = useMemo(
		() => activeAttachments.find((i) => i.id === previewId) ?? null,
		[activeAttachments, previewId]
	)

	const closeModal = () => {
		setActiveSlot(null)
		setPreviewId(null)
		setFilter('')
	}

	const openSlot = (slotKey: string) => {
		setFilter('')
		setPreviewId(selected[slotKey] ?? null)
		setActiveSlot(slotKey)
	}

	const handleConfirm = () => {
		if (!activeSlot || !previewId) return

		if (selected[activeSlot] !== previewId) {
			onSelect(activeSlot, previewId)
		}

		closeModal()
	}

	const handleRemove = () => {
		if (!activeSlot || !activeSelectedId) return
		onSelect(activeSlot, activeSelectedId)
		closeModal()
	}

	if (attachments.length === 0) {
		return null
	}

	const selectedIds = Object.values(selected)

	return (
		<Card.Root>
			<Card.Header>
				<Card.Title className="text-base">
					{t('attachments.title')}
				</Card.Title>
			</Card.Header>

			<Card.Content className="space-y-2">
				{groups.map(([slotKey, slotAttachments]) => {
					const selectedId = selected[slotKey]
					const selectedAttachment = slotAttachments.find(
						(a) => a.id === selectedId
					)

					return (
						<button
							className="flex w-full cursor-pointer items-center gap-3 rounded-lg border-2 border-border/40 bg-background/40 p-2 text-left transition-colors hover:border-text-accent/50"
							key={slotKey}
							onClick={() => openSlot(slotKey)}
							type="button"
						>
							{selectedAttachment ? (
								<Image
									alt={
										messageToString(
											selectedAttachment.name,
											locale
										) || 'attachment'
									}
									className="size-9 object-contain"
									height={36}
									src={getIconUrl(
										selectedAttachment.category,
										selectedAttachment.id
									)}
									width={36}
								/>
							) : (
								<div className="flex size-9 shrink-0 items-center justify-center rounded-md border-2 border-border/60 border-dashed text-text-accent">
									<Icon icon="lucide:plus" />
								</div>
							)}

							<div className="min-h-10 min-w-0 flex-1">
								<h3 className="font-semibold text-sm text-text-accent uppercase tracking-wide dark:text-neutral-400">
									{t(`attachments.slot.${slotKey}`)}
								</h3>

								{selectedAttachment ? (
									<>
										<p className="truncate font-semibold text-sm">
											{messageToString(
												selectedAttachment.name,
												locale
											)}
										</p>
										<ModifiersPreview
											attachment={selectedAttachment}
											locale={locale}
										/>
									</>
								) : (
									<p className="text-sm text-text-accent">
										{t('attachments.empty_slot')}
									</p>
								)}
							</div>

							<Icon
								className="shrink-0 text-text-accent"
								icon="lucide:chevron-right"
							/>
						</button>
					)
				})}
			</Card.Content>

			{selectedIds.length > 0 && (
				<Card.Content className="border-border/50 border-t pt-3 text-sm">
					<p className="mb-1 font-semibold">
						{t('attachments.summary')}
					</p>
					<ul className="space-y-0.5">
						{selectedIds.map((id) => {
							const attachment = attachments.find(
								(a) => a.id === id
							)
							if (!attachment) return null

							const name = messageToString(
								attachment.name,
								locale
							)

							return (
								<li key={id}>
									{name}
									<span className="text-text-accent dark:text-neutral-400">
										{' — '}
										{getModifierElements(attachment)
											.map((el) =>
												formatModifierValue(el, locale)
											)
											.join(', ')}
									</span>
								</li>
							)
						})}
					</ul>
					<p className="mt-1 text-text-accent dark:text-neutral-400">
						{t('attachments.total_weight')}:{' '}
						{roundNumber(
							selectedIds.reduce((sum, id) => {
								const attachment = attachments.find(
									(a) => a.id === id
								)
								return (
									sum +
									(attachment
										? getAttachmentWeight(attachment)
										: 0)
								)
							}, 0)
						)}{' '}
						{t('unit.kg')}
					</p>
				</Card.Content>
			)}

			<Modal.Root
				onOpenChange={(open) => {
					if (!open) closeModal()
				}}
				open={activeSlot !== null}
			>
				<Modal.Content className="flex min-h-125 max-w-3xl flex-col">
					<Modal.Header>
						<Modal.Title>
							{activeSlot
								? t(`attachments.slot.${activeSlot}`)
								: ''}
						</Modal.Title>
					</Modal.Header>

					<Modal.Body className="flex min-h-0 flex-col gap-4 py-0">
						<Input
							className="w-full"
							label="build.labels.default"
							onChange={(e) => setFilter(e.target.value)}
							type="text"
							value={filter}
						/>

						<div className="relative grid min-h-0 grid-cols-1 gap-4 md:grid-cols-[50%_50%]">
							<div className="flex w-full flex-col gap-2">
								<ItemsList
									className="max-h-screen sm:h-91"
									emptyText={t('build.labels.not_found')}
									items={activeAttachments}
									locale={locale}
									onSelectItem={setPreviewId}
									query={filter}
									selectedItemId={previewId}
								/>
							</div>

							<div
								className={cn(
									'flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden bg-background px-3 py-3',
									previewItem
										? 'fixed inset-0 z-50 md:static md:flex'
										: 'hidden md:flex'
								)}
							>
								<div className="flex items-center justify-between gap-2">
									{previewItem ? (
										<>
											<Button
												className="px-2 md:hidden"
												onClick={() =>
													setPreviewId(null)
												}
												variant="ghost"
											>
												<Icon
													className="text-lg"
													icon="lucide:chevron-left"
												/>
											</Button>

											<Image
												alt={messageToString(
													previewItem.name,
													locale
												)}
												height={48}
												src={getIconUrl(
													previewItem.category,
													previewItem.id
												)}
												width={48}
											/>

											<h2 className="font-semibold text-lg">
												{messageToString(
													previewItem.name,
													locale
												)}
											</h2>
										</>
									) : (
										<h2 className="font-semibold text-text-accent">
											{t('attachments.select_prompt')}
										</h2>
									)}
								</div>

								<div className="max-h-full flex-1 overflow-y-auto md:max-h-56">
									<div className="flex flex-col gap-3">
										{previewItem?.infoBlocks
											?.filter(
												(
													b
												): b is
													| AddStatBlock
													| ElementListBlock =>
													(b.type === 'list' ||
														b.type === 'addStat') &&
													Array.isArray(b.elements) &&
													b.elements.length > 0
											)
											.map((block, idx) => (
												<ListBlock
													block={block}
													className="text-sm"
													key={idx}
													locale={locale}
													numericVariants={0}
													withCard={false}
												/>
											))}
									</div>
								</div>

								<div className="flex gap-2">
									{activeSelectedId && (
										<Button
											className="justify-center"
											onClick={handleRemove}
											variant="ghost"
										>
											{t('attachments.remove')}
										</Button>
									)}
									<Button
										className="flex-1 justify-center"
										disabled={!previewId}
										onClick={handleConfirm}
										variant="bordered"
									>
										{t('attachments.select')}
									</Button>
								</div>
							</div>
						</div>
					</Modal.Body>
				</Modal.Content>
			</Modal.Root>
		</Card.Root>
	)
}

export default AttachmentsBuilder
