'use client'

import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import type { Item, Locale } from '@/types/item.type'
import { findContSizeInBlocks } from '@/utils/itemUtils'
import { ItemPickerModal } from './ItemPickerModal'

type ContainerPickerModalProps = {
	showModal: boolean
	setShowModal: (open: boolean) => void
	previewId: string | null
	items: Item[]
	setPreviewId: (id: string | null) => void
	selectedItem: Item | null
	locale: Locale
	currentSlots: (string | null)[]
	onSelectItem?: (itemId: string, slotsCount: number) => void
}

export function ContainerPickerModal({
	showModal,
	setShowModal,
	previewId,
	items,
	setPreviewId,
	selectedItem,
	locale,
	currentSlots,
	onSelectItem,
}: ContainerPickerModalProps) {
	const [showConfirm, setShowConfirm] = useState(false)

	const selectedSlotsCount = findContSizeInBlocks(selectedItem?.infoBlocks)
	const lostSlots = useMemo(
		() => currentSlots.slice(selectedSlotsCount).filter(Boolean).length,
		[currentSlots, selectedSlotsCount]
	)

	const close = () => {
		setShowModal(false)
		setShowConfirm(false)
		setPreviewId(null)
	}

	const selectContainer = () => {
		if (!previewId) return
		onSelectItem?.(previewId, selectedSlotsCount)
		close()
	}

	const handleSelect = () => {
		if (!previewId) return
		if (selectedSlotsCount < currentSlots.length && lostSlots > 0) {
			setShowConfirm(true)
			return
		}
		selectContainer()
	}

	return (
		<>
			<ItemPickerModal
				emptyTitle="Выберите контейнер"
				favoriteType="container"
				items={items}
				locale={locale}
				onConfirm={handleSelect}
				previewId={previewId}
				selectedItem={selectedItem}
				setPreviewId={setPreviewId}
				setShowModal={(open) => {
					setShowModal(open)
					if (!open) setShowConfirm(false)
				}}
				showModal={showModal}
				title="Выбор контейнера"
			/>
			<Modal.Root onOpenChange={setShowConfirm} open={showConfirm}>
				<Modal.Content className="max-w-md">
					<Modal.Header>
						<Modal.Title>Контейнер меньше текущего</Modal.Title>
						<Modal.Description className="font-semibold">
							Артефакты в удаляемых слотах будут отвязаны от
							контейнера.
						</Modal.Description>
					</Modal.Header>
					<Modal.Body>
						<p className="font-semibold">
							Будет потеряно занятых слотов: {lostSlots}
						</p>
					</Modal.Body>
					<Modal.Footer className="flex justify-end gap-2">
						<Modal.Action
							onClick={() => setShowConfirm(false)}
							variant="ghost"
						>
							Отмена
						</Modal.Action>
						<Modal.Action
							onClick={selectContainer}
							variant="danger"
						>
							Подтвердить
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</>
	)
}
