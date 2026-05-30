'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { toast } from '@/components/ui/Toast'
import { getLocale } from '@/lib/getLocale'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { useBuildStore } from '@/stores/useBuild.store'
import type { ModalProps } from '@/types/build.type'
import {
	type AddStatBlock,
	type ElementListBlock,
	InfoColor,
	infoColorMap,
} from '@/types/item.type'
import { isNumericVariantsBlock, messageToString } from '@/utils/itemUtils'
import { ItemsList } from '@/views/builds/model/components/artifacts'
import { ListBlock, NumericVariantsCard } from '@/views/items/components/blocks'

export default function ArmorModal({ onClose }: ModalProps) {
	const locale = getLocale()
	const t = useTranslations()

	const { data: items } = useSuspenseQuery(
		itemsQueries.get({ type: 'armor' })
	)

	const [filter, setFilter] = useState('')
	const [numericVariants, setNumericVariants] = useState<number>(0)
	const armor = useBuildStore((s) => s.build.armor)
	const setArmor = useBuildStore((s) => s.setArmor)

	const [previewId, setPreviewId] = useState<string | null>(armor?.id ?? null)

	const selectedItem = items.find((i) => i.id === previewId)

	const handleSet = () => {
		setArmor(previewId!, numericVariants)
		toast.success(t('modals.builds.armor.toaster_success'))
	}

	const visibleItems = items.filter((it) =>
		messageToString(it.name, locale)
			.toLowerCase()
			.includes(filter.toLowerCase())
	)

	return (
		<div className="flex gap-4 text-nowrap">
			<Card.Root className="min-w-75">
				<Card.Header>
					<Input
						className="px-2 text-[14px]"
						label="ui.input_label"
						onChange={(e) => setFilter(e.target.value)}
						value={filter}
					/>
				</Card.Header>

				<ItemsList
					className="max-h-127"
					favoriteType="armor"
					items={visibleItems}
					locale={locale}
					onSelectItem={(id) => setPreviewId(id)}
				/>
			</Card.Root>

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
						{selectedItem?.infoBlocks
							.filter(
								(b): b is ElementListBlock =>
									b.type === 'list' &&
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
						{selectedItem?.infoBlocks
							.filter(
								(b): b is AddStatBlock | ElementListBlock =>
									(b.type === 'list' ||
										b.type === 'addStat') &&
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
