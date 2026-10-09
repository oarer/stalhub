'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { toast } from '@/components/ui/Toast'
import { getLocale } from '@/lib/getLocale'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { useBuildStore } from '@/stores/useBuild.store'
import type { ModalProps } from '@/types/build.type'
import { InfoColor, infoColorMap } from '@/types/item.type'
import {
	collectListBlocks,
	isNumericVariantsBlock,
	messageToString,
} from '@/utils/itemUtils'
import {
	buildEffectFilterMap,
	buildEffectOptions,
	filterItemsByEffects,
} from '@/views/calcs/builds/utils/effectFilters'
import { ListBlock, NumericVariantsCard } from '@/views/items/components/blocks'
import { ItemPickerPanel } from './ItemPickerPanel'

export default function ArmorModal({ onClose }: ModalProps) {
	const locale = getLocale()
	const t = useTranslations()

	const { data: items } = useSuspenseQuery(
		itemsQueries.get({ type: 'armor' })
	)

	const [filter, setFilter] = useState('')
	const [numericVariants, setNumericVariants] = useState<number>(0)
	const [selectedEffectStats, setSelectedEffectStats] = useState<string[]>([])
	const armor = useBuildStore((s) => s.build.armor)
	const setArmor = useBuildStore((s) => s.setArmor)

	const [previewId, setPreviewId] = useState<string | null>(armor?.id ?? null)

	const selectedItem = items.find((i) => i.id === previewId)

	const effectOptions = useMemo(
		() => buildEffectOptions(items, locale),
		[items, locale]
	)

	const effectFilteredItems = useMemo(() => {
		const { posSet } = buildEffectFilterMap(items, locale)
		const positiveKeys = selectedEffectStats.filter((k) => posSet.has(k))
		const negativeKeys = selectedEffectStats.filter((k) => !posSet.has(k))
		return filterItemsByEffects(items, locale, positiveKeys, negativeKeys)
	}, [items, locale, selectedEffectStats])

	const handleSet = () => {
		setArmor(previewId!, numericVariants)
		toast.success(t('modals.builds.armor.toaster_success'))
	}

	return (
		<div className="flex gap-4 text-nowrap">
			<ItemPickerPanel
				cardClassName="min-w-75"
				effectOptions={effectOptions}
				favoriteType="armor"
				filter={filter}
				items={effectFilteredItems}
				listClassName="max-h-127"
				locale={locale}
				onFilterChange={setFilter}
				onSelectedEffectsChange={setSelectedEffectStats}
				onSelectItem={(id) => setPreviewId(id)}
				preserveOrder={selectedEffectStats.length > 0}
				selectedEffects={selectedEffectStats}
			/>

			<Card.Root className="min-w-80">
				<Card.Header>
					<Card.Title
						style={{
							color:
								infoColorMap[
									selectedItem?.color as InfoColor
								] || InfoColor.DEFAULT,
						}}
					>
						<p
							className="max-w-67 truncate"
							style={{
								color:
									infoColorMap[
										selectedItem?.color as InfoColor
									] || InfoColor.DEFAULT,
							}}
						>
							{selectedItem
								? `| ${messageToString(selectedItem.name, locale)}`
								: `| ${t('modals.builds.armor.header')}`}
						</p>
					</Card.Title>
					<Button
						aria-label="Close modal"
						className="absolute top-2.5 right-4 flex cursor-pointer items-center justify-center rounded-full p-2.5"
						onClick={onClose}
						variant={'ghost'}
					>
						<Icon className="text-lg" icon="lucide:x" />
					</Button>
				</Card.Header>

				<Card.Content className="flex flex-col justify-between gap-2">
					<div className="flex max-h-120 flex-col gap-2 overflow-y-auto">
						{collectListBlocks(selectedItem?.infoBlocks)
							.filter(
								(b) =>
									Array.isArray(b.elements) &&
									b.elements.length > 0
							)
							.map((block, idx) =>
								block.elements.some(isNumericVariantsBlock) ? (
									<NumericVariantsCard
										key={idx}
										numericVariants={numericVariants}
										onChange={(value) => {
											setNumericVariants(value)
											if (previewId) {
												setArmor(previewId, value)
											}
										}}
										withCard={false}
									/>
								) : null
							)}
						{collectListBlocks(selectedItem?.infoBlocks)
							.filter(
								(b) =>
									Array.isArray(b.elements) &&
									b.elements.length > 0
							)
							.map((block, idx) => (
								<ListBlock
									block={block}
									key={idx}
									locale={locale}
									numericVariants={numericVariants}
									withCard={false}
								/>
							))}
					</div>

					<Button
						className="justify-center"
						disabled={!previewId}
						onClick={handleSet}
						variant={'outline'}
					>
						{t('modals.builds.pick')}
					</Button>
				</Card.Content>
			</Card.Root>
		</div>
	)
}
