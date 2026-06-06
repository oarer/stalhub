'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { HoverCard } from '@/components/ui/HoverCard'
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
import { ListBlock } from '@/views/items/components/blocks'
import { ItemPickerModal } from './ItemPickerModal'

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
	const t = useTranslations()

	const [showModal, setShowModal] = useState(false)
	const [previewId, setPreviewId] = useState<string | null>(selectedBoostId)

	const categoryItems = useMemo(
		() => getBoostsByCategory(items, category),
		[items, category]
	)

	const selectedItemData =
		categoryItems.find((i) => i.id === selectedBoostId) ?? null

	useEffect(() => {
		setPreviewId(selectedBoostId)
	}, [selectedBoostId])

	const handleConfirm = () => {
		if (!previewId) return
		onSelect(previewId)
		setShowModal(false)
	}

	return (
		<>
			<button
				className="flex size-14 cursor-pointer items-center justify-center rounded-xl bg-white/60 p-2 shadow-sm transition hover:bg-neutral-300 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
				onClick={() => setShowModal(true)}
				type="button"
			>
				{selectedBoostId && selectedItemData ? (
					<HoverCard.Root>
						<HoverCard.Trigger className="flex items-center">
							<Image
								alt={messageToString(
									selectedItemData.name,
									locale
								)}
								className="size-12 object-contain"
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

								{selectedItemData?.infoBlocks
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
										e.stopPropagation()
										onRemove()
									}}
									variant="danger"
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
			</button>

			<ItemPickerModal
				emptyTitle="modals.builds.consumables.header"
				favoriteType="boost"
				items={categoryItems}
				locale={locale}
				onConfirm={handleConfirm}
				previewId={previewId}
				setPreviewId={setPreviewId}
				setShowModal={(open) => {
					setShowModal(open)
					if (!open) setPreviewId(selectedBoostId)
				}}
				showModal={showModal}
				title={`${t('modals.builds.consumables.pick_boost')} ${t(
					`boost.${category.split('.').pop()!}`
				)}`}
			/>
		</>
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
