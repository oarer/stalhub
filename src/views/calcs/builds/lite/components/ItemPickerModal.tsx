'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox'
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
import { ItemsList } from '@/views/calcs/builds/model/components/artifacts/ItemsList'
import { ListBlock } from '@/views/items/components/blocks'

export type StatFilterGroup = {
	label: string
	options: ComboboxOption[]
	values: string[]
	onValuesChange: (values: string[]) => void
}

type ItemPickerModalProps = {
	showModal: boolean
	setShowModal: (open: boolean) => void
	previewId: string | null
	items: Item[]
	setPreviewId: (id: string | null) => void
	locale: Locale
	title: string
	emptyTitle: string
	favoriteType: FavoriteType
	searchLabel?: string
	actionLabel?: string
	onConfirm?: (itemId: string) => void
	children?: ReactNode
	statFilters?: StatFilterGroup[]
}

export function ItemPickerModal({
	showModal,
	setShowModal,
	previewId,
	items,
	setPreviewId,
	locale,
	title,
	emptyTitle,
	favoriteType,
	searchLabel = 'build.labels.default',
	actionLabel = 'Выбрать',
	onConfirm,
	children,
	statFilters,
}: ItemPickerModalProps) {
	const t = useTranslations()

	const [filter, setFilter] = useState('')

	const selectedItem = useMemo(() => {
		return items.find((i) => i.id === previewId) ?? null
	}, [items, previewId])

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
					<Modal.Title>{t(title)}</Modal.Title>
				</Modal.Header>

				<Modal.Body className="flex min-h-0 flex-col gap-4 py-0">
					<Input
						className="w-full"
						label={searchLabel}
						onChange={(e) => setFilter(e.target.value)}
						type="text"
						value={filter}
					/>

					{statFilters && statFilters.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{statFilters.map((group, i) => (
								<div className="min-w-40 flex-1" key={i}>
									<Combobox
										multiple
										onValuesChange={group.onValuesChange}
										options={group.options}
										placeholder={group.label}
										values={group.values}
										zIndex={99999999}
									/>
								</div>
							))}
						</div>
					)}

					<div className="relative grid min-h-0 grid-cols-1 gap-4 md:grid-cols-[50%_50%]">
						<div className="flex w-full flex-col gap-2">
							{visibleItems.length > 0 ? (
								<ItemsList
									className="max-h-screen sm:h-91"
									favoriteType={favoriteType}
									items={visibleItems}
									locale={locale}
									onSelectItem={(itemId) =>
										setPreviewId(itemId)
									}
									selectedItemId={previewId}
								/>
							) : (
								<p className="flex h-full items-center justify-center font-semibold text-text-accent">
									{t('build.labels.not_found')}
								</p>
							)}
						</div>

						<div
							className={cn(
								'flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden bg-background px-3 py-3',
								selectedItem
									? 'fixed inset-0 z-50 md:static md:flex'
									: 'hidden md:flex'
							)}
						>
							<div className="flex items-center justify-between gap-2">
								<div
									className={cn(
										'flex items-center gap-2',
										!selectedItem && 'w-full justify-center'
									)}
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
											{t(emptyTitle)}
										</h2>
									)}
								</div>
							</div>

							<div className="max-h-full flex-1 overflow-y-auto md:max-h-56">
								<div className="flex flex-col gap-3">
									{children ??
										selectedItem?.infoBlocks
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

							{selectedItem && (
								<Button
									className="justify-center"
									disabled={!previewId}
									onClick={() =>
										previewId && onConfirm?.(previewId)
									}
									variant="bordered"
								>
									{actionLabel}
								</Button>
							)}
						</div>
					</div>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	)
}
