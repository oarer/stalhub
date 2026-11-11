'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { HoverCard } from '@/components/ui/HoverCard'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import { getLocale } from '@/lib/getLocale'
import { getItemIcon } from '@/lib/itemIcon'
import { useVisibleItems } from '@/lib/unoItems'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { type BoostSet, useBoostSetsStore } from '@/stores/useBoostSets.store'
import { useBuildStore } from '@/stores/useBuild.store'
import { BoostButtons, type BoostCategory } from '@/types/build.type'
import { InfoColor, type Item, infoColorMap } from '@/types/item.type'
import { collectListBlocks, messageToString } from '@/utils/itemUtils'
import { ListBlock } from '@/views/items/components/blocks'
import {
	buildPositiveNegativeOptions,
	filterItemsByEffects,
} from '../../utils/effectFilters'
import type { StatFilterGroup } from './ItemPickerModal'
import { ItemPickerModal } from './ItemPickerModal'

const CATEGORIES = Object.keys(BoostButtons) as BoostCategory[]

const boostSearchCache = new WeakMap<Item, string>()

function getBoostSearchString(item: Item): string {
	const cached = boostSearchCache.get(item)
	if (cached !== undefined) return cached

	const search = JSON.stringify(item.infoBlocks).toLowerCase()
	boostSearchCache.set(item, search)
	return search
}

function groupBoostsByCategory(items: Item[]): Map<BoostCategory, Item[]> {
	const grouped = new Map<BoostCategory, Item[]>(
		CATEGORIES.map((category) => [category, []])
	)
	const lowered = CATEGORIES.map(
		(category) => [category, category.toLowerCase()] as const
	)

	for (const item of items) {
		if (!item.infoBlocks) continue
		const search = getBoostSearchString(item)
		for (const [category, catLower] of lowered) {
			if (search.includes(catLower)) {
				grouped.get(category)?.push(item)
			}
		}
	}

	return grouped
}

function categoryLabelKey(category: BoostCategory) {
	return `boost.${category.split('.').pop()}`
}

function BoostSlot({
	category,
	items,
	selectedBoostId,
	onOpen,
	onRemove,
}: {
	category: BoostCategory
	items: Item[]
	selectedBoostId: string | null
	onOpen: () => void
	onRemove: () => void
}) {
	const locale = getLocale()
	const t = useTranslations()

	const selectedItemData = items.find((i) => i.id === selectedBoostId) ?? null

	return (
		<div className="relative size-14">
			<Button
				aria-label={`${t('modals.builds.consumables.pick_boost')} ${t(categoryLabelKey(category))}`}
				className="size-14 p-2"
				onClick={onOpen}
				variant={'secondary'}
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
								src={`https://cdn.stalhub.dev/db${getItemIcon(selectedItemData)}`}
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

								{collectListBlocks(selectedItemData.infoBlocks)
									.filter(
										(b) =>
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
											className="text-[13px]"
											key={idx}
											locale={locale}
											numericVariants={0}
											withCard={false}
										/>
									))}
							</div>
						</HoverCard.Content>
					</HoverCard.Root>
				) : (
					<Icon className="size-7" icon={BoostButtons[category]} />
				)}
			</Button>

			{selectedBoostId && selectedItemData && (
				<Button
					aria-label={t('build.labels.delete')}
					className="absolute -top-1 -right-1 z-10 flex size-7 items-center justify-center rounded-full p-0 ring-transparent"
					onClick={onRemove}
					title={t('build.labels.delete')}
					type="button"
					variant="danger"
				>
					<Icon className="text-lg" icon="lucide:trash" />
				</Button>
			)}
		</div>
	)
}

function BoostCategoryTabs({
	activeCategory,
	onSelect,
}: {
	activeCategory: BoostCategory
	onSelect: (category: BoostCategory) => void
}) {
	const t = useTranslations()

	return (
		<div className="flex flex-col gap-1">
			<p className="font-medium text-muted-foreground text-sm">
				{t('modals.builds.consumables.boost_list')}
			</p>
			<div className="grid grid-cols-6 gap-1">
				{CATEGORIES.map((category) => (
					<Button
						aria-label={t(categoryLabelKey(category))}
						className="h-9 px-0"
						key={category}
						onClick={() => onSelect(category)}
						title={t(categoryLabelKey(category))}
						variant={
							activeCategory === category ? 'bordered' : 'ghost'
						}
					>
						<Icon
							className="text-lg"
							icon={BoostButtons[category]}
						/>
					</Button>
				))}
			</div>
		</div>
	)
}

function BoostSetsPanel({
	items,
	boosts,
	onApply,
}: {
	items: Item[]
	boosts: Record<BoostCategory, string | null>
	onApply: (boostSet: BoostSet) => void
}) {
	const t = useTranslations()
	const locale = getLocale()

	const sets = useBoostSetsStore((s) => s.sets)
	const addSet = useBoostSetsStore((s) => s.addSet)
	const removeSet = useBoostSetsStore((s) => s.removeSet)

	const [isCreating, setIsCreating] = useState(false)
	const [name, setName] = useState('')

	const itemsById = useMemo(
		() => new Map(items.map((item) => [item.id, item])),
		[items]
	)

	const selectedCount = Object.values(boosts).filter(Boolean).length

	const handleSave = () => {
		if (selectedCount === 0) return

		const finalName =
			name.trim() ||
			t('modals.builds.consumables.sets.default_name', {
				index: sets.length + 1,
			})

		addSet(finalName, boosts)
		setName('')
		setIsCreating(false)
	}

	const handleCancel = () => {
		setName('')
		setIsCreating(false)
	}

	return (
		<div className="flex h-full max-h-[45dvh] min-h-0 flex-col gap-3">
			<div className="flex items-center justify-between gap-2">
				<h3 className="font-semibold text-sm">
					{t('modals.builds.consumables.sets.title')}
				</h3>
				<span className="text-muted-foreground text-xs">
					{sets.length}
				</span>
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto">
				{sets.length === 0 ? (
					<p className="px-2 py-6 text-center text-muted-foreground text-sm">
						{t('modals.builds.consumables.sets.empty')}
					</p>
				) : (
					<div className="flex flex-col gap-2">
						{sets.map((boostSet) => {
							const setItems = CATEGORIES.map((category) => {
								const boostId = boostSet.boosts[category]
								if (!boostId) return null

								const item = itemsById.get(boostId)
								if (!item) return null

								return { category, item }
							}).filter(
								(
									entry
								): entry is {
									category: BoostCategory
									item: Item
								} => entry !== null
							)

							return (
								<div
									className="flex flex-col gap-2 rounded-lg border-2 border-primary/20 bg-card p-2"
									key={boostSet.id}
								>
									<p
										className="truncate font-medium text-sm"
										title={boostSet.name}
									>
										{boostSet.name}
									</p>

									{setItems.length > 0 && (
										<div className="flex flex-wrap gap-1">
											{setItems.map(
												({ category, item }) => (
													<Image
														alt={messageToString(
															item.name,
															locale
														)}
														className="size-7 object-contain"
														height={28}
														key={category}
														src={`https://cdn.stalhub.dev/db${getItemIcon(item)}`}
														title={messageToString(
															item.name,
															locale
														)}
														width={28}
													/>
												)
											)}
										</div>
									)}

									<div className="flex items-center gap-1">
										<Button
											className="flex-1 justify-center py-1 text-sm"
											onClick={() => onApply(boostSet)}
											variant="bordered"
										>
											{t(
												'modals.builds.consumables.sets.apply'
											)}
										</Button>
										<Button
											aria-label={t(
												'modals.builds.consumables.sets.delete'
											)}
											className="size-8 p-0"
											onClick={() =>
												removeSet(boostSet.id)
											}
											title={t(
												'modals.builds.consumables.sets.delete'
											)}
											variant="ghost"
										>
											<Icon
												className="text-base"
												icon="lucide:trash"
											/>
										</Button>
									</div>
								</div>
							)
						})}
					</div>
				)}
			</div>

			<div className="border-primary/20 border-t pt-3">
				{isCreating ? (
					<div className="flex flex-col gap-2">
						<Input
							autoFocus
							onChange={(e) => setName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault()
									handleSave()
								}
							}}
							placeholder={t(
								'modals.builds.consumables.sets.name_placeholder'
							)}
							value={name}
						/>
						<div className="flex gap-1">
							<Button
								className="flex-1 justify-center py-1 text-sm"
								disabled={selectedCount === 0}
								onClick={handleSave}
								variant="bordered"
							>
								{t('modals.builds.consumables.sets.save')}
							</Button>
							<Button
								className="justify-center py-1 text-sm"
								onClick={handleCancel}
								variant="ghost"
							>
								{t('modals.builds.consumables.sets.cancel')}
							</Button>
						</div>
					</div>
				) : (
					<Button
						className={cn(
							'w-full justify-center gap-2',
							selectedCount === 0 && 'opacity-50'
						)}
						disabled={selectedCount === 0}
						onClick={() => setIsCreating(true)}
						variant="bordered"
					>
						<Icon className="text-lg" icon="lucide:plus" />
						{t('modals.builds.consumables.sets.save_current')}
					</Button>
				)}
				{selectedCount === 0 && (
					<p className="mt-2 text-center text-muted-foreground text-xs">
						{t('modals.builds.consumables.sets.nothing_to_save')}
					</p>
				)}
			</div>
		</div>
	)
}

export default function ConsumablesModalLite() {
	const { data: queryItems } = useSuspenseQuery(
		itemsQueries.get({ type: 'consumables' })
	)
	const items = useVisibleItems(queryItems) ?? []
	const locale = getLocale()
	const t = useTranslations()

	const boost = useBuildStore((s) => s.build.boost)
	const setBoost = useBuildStore((s) => s.setBoost)
	const setBoosts = useBuildStore((s) => s.setBoosts)
	const removeBoost = useBuildStore((s) => s.removeBoost)

	const [showModal, setShowModal] = useState(false)
	const [activeCategory, setActiveCategory] = useState<BoostCategory>(
		CATEGORIES[0]
	)
	const [previewId, setPreviewId] = useState<string | null>(null)
	const [selectedPositiveStats, setSelectedPositiveStats] = useState<
		string[]
	>([])
	const [selectedNegativeStats, setSelectedNegativeStats] = useState<
		string[]
	>([])

	const itemsByCategory = useMemo(() => groupBoostsByCategory(items), [items])

	const categoryItems = itemsByCategory.get(activeCategory) ?? []

	const effectOptions = useMemo(
		() => buildPositiveNegativeOptions(categoryItems, locale),
		[categoryItems, locale]
	)

	const statFilteredItems = useMemo(
		() =>
			filterItemsByEffects(
				categoryItems,
				locale,
				selectedPositiveStats,
				selectedNegativeStats
			),
		[categoryItems, locale, selectedPositiveStats, selectedNegativeStats]
	)

	const statFilters = useMemo<StatFilterGroup[]>(
		() => [
			...(effectOptions.positiveOptions.length > 0
				? [
						{
							label: 'build.labels.positive_stats',
							options: effectOptions.positiveOptions,
							values: selectedPositiveStats,
							onValuesChange: setSelectedPositiveStats,
						},
					]
				: []),
			...(effectOptions.negativeOptions.length > 0
				? [
						{
							label: 'build.labels.negative_stats',
							options: effectOptions.negativeOptions,
							values: selectedNegativeStats,
							onValuesChange: setSelectedNegativeStats,
						},
					]
				: []),
		],
		[effectOptions, selectedPositiveStats, selectedNegativeStats]
	)

	const openPicker = (category: BoostCategory) => {
		setActiveCategory(category)
		setPreviewId(boost[category] ?? null)
		setSelectedPositiveStats([])
		setSelectedNegativeStats([])
		setShowModal(true)
	}

	const handleCategorySelect = (category: BoostCategory) => {
		setActiveCategory(category)
		setPreviewId(boost[category] ?? null)
		setSelectedPositiveStats([])
		setSelectedNegativeStats([])
	}

	const handleConfirm = (boostId: string) => {
		setBoost(activeCategory, boostId)
		setShowModal(false)
	}

	const handleModalOpenChange = (open: boolean) => {
		setShowModal(open)
		if (!open) setPreviewId(null)
	}

	const handleApplySet = (boostSet: BoostSet) => {
		setBoosts(boostSet.boosts)
		setShowModal(false)
	}

	return (
		<>
			<div className="grid w-full grid-cols-3 justify-items-center gap-4">
				{CATEGORIES.map((category) => (
					<BoostSlot
						category={category}
						items={items}
						key={category}
						onOpen={() => openPicker(category)}
						onRemove={() => removeBoost(category)}
						selectedBoostId={boost[category]}
					/>
				))}
			</div>

			<ItemPickerModal
				aside={
					<BoostSetsPanel
						boosts={boost}
						items={items}
						onApply={handleApplySet}
					/>
				}
				contentClassName="max-w-6xl"
				emptyTitle="modals.builds.consumables.header"
				favoriteType="boost"
				infoHeader={
					<p className="font-medium text-muted-foreground text-sm">
						{t('modals.builds.consumables.boost_info')}
					</p>
				}
				items={statFilteredItems}
				listHeader={
					<BoostCategoryTabs
						activeCategory={activeCategory}
						onSelect={handleCategorySelect}
					/>
				}
				locale={locale}
				onConfirm={handleConfirm}
				previewId={previewId}
				setPreviewId={setPreviewId}
				setShowModal={handleModalOpenChange}
				showModal={showModal}
				statFilters={statFilters}
				title={`${t('modals.builds.consumables.pick_boost')} ${t(
					categoryLabelKey(activeCategory)
				)}`}
			/>
		</>
	)
}
