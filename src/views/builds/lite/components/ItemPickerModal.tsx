'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import type { FavoriteType } from '@/stores/useFavorites.store'
import type {
	AddStatBlock,
	ElementListBlock,
	Item,
	Locale,
} from '@/types/item.type'
import { InfoColor, infoColorMap } from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import { ItemsList } from '@/views/builds/model/components/artifacts/ItemsList'
import { ListBlock } from '@/views/items/components/blocks'

type ItemPickerModalProps = {
	showModal: boolean
	setShowModal: (open: boolean) => void
	previewId: string | null
	items: Item[]
	setPreviewId: (id: string | null) => void
	selectedItem: Item | null
	locale: Locale
	title: string
	emptyTitle: string
	favoriteType: FavoriteType
	searchLabel?: string
	actionLabel?: string
	onConfirm?: (itemId: string) => void
	children?: ReactNode
}

export function ItemPickerModal({
	showModal,
	setShowModal,
	previewId,
	items,
	setPreviewId,
	selectedItem,
	locale,
	title,
	emptyTitle,
	favoriteType,
	searchLabel = 'Поиск по названию',
	actionLabel = 'Выбрать',
	onConfirm,
	children,
}: ItemPickerModalProps) {
	const [filter, setFilter] = useState('')

	const visibleItems = useMemo(() => {
		const query = filter.trim().toLowerCase()
		if (!query) return items

		return items.filter((it) =>
			messageToString(it.name, locale).toLowerCase().includes(query)
		)
	}, [filter, items, locale])

	const reset = () => {
		setPreviewId(null)
		setFilter('')
	}

	useEffect(() => {
		if (!showModal) setFilter('')
	}, [showModal])

	return (
		<Modal.Root
			onOpenChange={(open) => {
				setShowModal(open)
				if (!open) reset()
			}}
			open={showModal}
		>
			<Modal.Content className="flex min-h-125 max-w-3xl flex-col">
				<Modal.Header>
					<Modal.Title>{title}</Modal.Title>
				</Modal.Header>

				<Modal.Body className="flex min-h-0 flex-col gap-4 py-0">
					<Input
						className="w-full"
						label={searchLabel}
						onChange={(e) => setFilter(e.target.value)}
						type="text"
						value={filter}
					/>
					<div className="relative grid min-h-0 grid-cols-1 gap-4 md:grid-cols-[50%_50%]">
						<div className="flex w-full flex-col gap-2">
							<ItemsList
								className="max-h-screen sm:max-h-91"
								favoriteType={favoriteType}
								items={visibleItems}
								locale={locale}
								onSelectItem={(itemId) => setPreviewId(itemId)}
								selectedItemId={previewId}
							/>
						</div>
						<div
							className={cn(
								'flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden bg-background px-3 py-3',
								selectedItem
									? 'absolute inset-0 z-20 md:static md:inset-auto md:z-auto'
									: 'hidden md:flex'
							)}
						>
							<div className="flex items-center justify-between gap-2">
								<div
									className={`flex items-center gap-2 ${
										!selectedItem && 'w-full justify-center'
									}`}
								>
									{selectedItem ? (
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
													selectedItem.name,
													locale
												)}
												height={48}
												src={`https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/${selectedItem.category}/${selectedItem.id}.png`}
												width={48}
											/>
											<h2
												className="font-semibold text-lg"
												style={{
													color:
														infoColorMap[
															selectedItem.color as InfoColor
														] || InfoColor.DEFAULT,
												}}
											>
												{messageToString(
													selectedItem.name,
													locale
												)}
											</h2>
										</>
									) : (
										<h2 className="font-semibold text-text-accent">
											{emptyTitle}
										</h2>
									)}
								</div>
							</div>
							<div className="flex-1 overflow-y-auto">
								<div className="flex max-h-56 flex-col gap-3">
									{children ??
										selectedItem?.infoBlocks
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
							<Button
								className="justify-center"
								disabled={!previewId}
								onClick={() => {
									if (!previewId) return
									onConfirm?.(previewId)
								}}
								variant="bordered"
							>
								{actionLabel}
							</Button>
						</div>
					</div>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}
