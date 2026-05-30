'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { HoverCard } from '@/components/ui/HoverCard'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { getLocale } from '@/lib/getLocale'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { useBuildStore } from '@/stores/useBuild.store'
import { BoostButtons, type BoostCategory } from '@/types/build.type'
import {
	type AddStatBlock,
	type ElementListBlock,
	InfoColor,
	type Item,
	infoColorMap,
} from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import { ItemsList } from '@/views/builds/model/components/artifacts'
import { ListBlock } from '@/views/items/components/blocks'

const CATEGORIES = Object.keys(BoostButtons) as BoostCategory[]

function getBoostsByCategory(items: Item[], category: BoostCategory): Item[] {
	return items.filter((item) => {
		const searchIn = JSON.stringify(item.infoBlocks).toLowerCase()
		return searchIn.includes(category.toLowerCase())
	})
}

function BoostSelectModal({
	category,
	items,
	selectedBoostId,
	onSelect,
	onRemove,
}: {
	category: BoostCategory
	items: Item[]
	selectedBoostId: string | null
	onSelect: (boostId: string) => void
	onRemove: () => void
}) {
	const locale = getLocale()
	const [previewId, setPreviewId] = useState<string | null>(selectedBoostId)

	const t = useTranslations()

	const categoryItems = getBoostsByCategory(items, category)
	const selectedItem = categoryItems.find((i) => i.id === previewId)
	const selectedItemData = items.find((i) => i.id === selectedBoostId)
	const [filter, setFilter] = useState('')
	const [open, setOpen] = useState(false)

	const visibleItems = useMemo(() => {
		const q = filter.trim().toLowerCase()

		if (!q) return categoryItems

		return categoryItems.filter((it) =>
			messageToString(it.name, locale).toLowerCase().includes(q)
		)
	}, [categoryItems, filter, locale])

	useEffect(() => {
		setPreviewId(selectedBoostId)
	}, [selectedBoostId])

	return (
		<Modal.Root onOpenChange={setOpen} open={open}>
			<Modal.Trigger
				asChild
				className="size-14 cursor-pointer justify-center rounded-xl bg-white/60 p-2 shadow-sm hover:bg-neutral-300 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
				variant={'secondary'}
			>
				{selectedBoostId && selectedItemData ? (
					<HoverCard.Root>
						<HoverCard.Trigger>
							<Image
								alt={messageToString(
									selectedItemData.name,
									locale
								)}
								className="h-10 w-10 object-contain"
								height={42}
								src={`https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/${selectedItemData.category}/${selectedItemData.id}.png`}
								width={42}
							/>
						</HoverCard.Trigger>
						<HoverCard.Content className="min-w-80" side="top">
							<div className="relative gap-2">
								<p
									className="mb-4"
									style={{
										color:
											infoColorMap[
												selectedItemData.color as InfoColor
											] || InfoColor.DEFAULT,
									}}
								>
									{messageToString(
										selectedItemData.name,
										locale
									)}
								</p>
								{selectedItem?.infoBlocks
									.filter(
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
									.filter(
										(_, idx) =>
											idx !== 0 && idx !== 5 && idx !== 1
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
								<Button
									className="absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full p-0 ring-transparent"
									onClick={(e) => {
										onRemove()
										e.stopPropagation()
									}}
									variant={'danger'}
								>
									<Icon
										className="text-lg"
										icon="lucide:trash"
									/>
								</Button>
							</div>
						</HoverCard.Content>
					</HoverCard.Root>
				) : (
					<Icon className="size-7" icon={BoostButtons[category]} />
				)}
			</Modal.Trigger>
			<Modal.Content className="max-w-206">
				<Modal.Header>
					<Modal.Title>
						{t('modals.builds.consumables.pick_boost')}{' '}
						<span className="text-border">
							{t(`boost.${category.split('.').pop()!}`)}
						</span>
					</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<div className="flex gap-4">
						<Card.Root className="min-w-95 ring-border/20">
							<Card.Header>
								<Input
									className="px-2 text-[14px]"
									label="ui.input_label"
									onChange={(e) => setFilter(e.target.value)}
									value={filter}
								/>
							</Card.Header>

							<ItemsList
								className="max-h-90 max-w-90"
								favoriteType="boost"
								items={visibleItems}
								locale={locale}
								onSelectItem={(id) => setPreviewId(id)}
								selectedItemId={previewId}
							/>
						</Card.Root>
						<Card.Root className="min-w-95 ring-border/20">
							<Card.Header>
								<Card.Title
									style={{
										color:
											infoColorMap[
												selectedItem?.color as InfoColor
											] || InfoColor.DEFAULT,
									}}
								>
									{selectedItem
										? `| ${messageToString(selectedItem.name, locale)}`
										: `| ${t('modals.builds.consumables.header')}`}
								</Card.Title>
							</Card.Header>

							<Card.Content className="flex h-full flex-col justify-between">
								<div className="flex flex-col gap-3">
									{selectedItem?.infoBlocks
										.filter(
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
										.filter(
											(_, idx) =>
												idx !== 0 &&
												idx !== 5 &&
												idx !== 1
										)
										.map((block, idx) => (
											<ListBlock
												block={block}
												key={idx}
												locale={locale}
												numericVariants={0}
												withCard={false}
											/>
										))}
								</div>

								<Button
									className="justify-center"
									disabled={!previewId}
									onClick={() => {
										onSelect(previewId!)
										setOpen(false)
									}}
									variant="bordered"
								>
									Выбрать
								</Button>
							</Card.Content>
						</Card.Root>
					</div>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}

export default function ConsumablesModalLite() {
	const { data: items } = useSuspenseQuery(
		itemsQueries.get({ type: 'consumables' })
	)

	const boost = useBuildStore((s) => s.build.boost)
	const setBoost = useBuildStore((s) => s.setBoost)
	const removeBoost = useBuildStore((s) => s.removeBoost)

	const handleSelect = (category: BoostCategory) => (boostId: string) => {
		setBoost(category, boostId)
	}

	return (
		<div className="grid w-full grid-cols-3 justify-items-center gap-4">
			{CATEGORIES.map((category) => (
				<BoostSelectModal
					category={category}
					items={items}
					key={category}
					onRemove={() => removeBoost(category)}
					onSelect={handleSelect(category)}
					selectedBoostId={boost[category]}
				/>
			))}
		</div>
	)
}
