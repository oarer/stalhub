'use client'

import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import type { Item, Locale } from '@/types/item.type'
import { findContSizeInBlocks } from '@/utils/itemUtils'
import { ItemPickerModal, type StatFilterGroup } from './ItemPickerModal'

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
	statFilters?: StatFilterGroup[]
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
	statFilters,
}: ContainerPickerModalProps) {
	const [showConfirm, setShowConfirm] = useState(false)
	const t = useTranslations()

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
				emptyTitle="build.labels.cont"
				favoriteType="container"
				items={items}
				locale={locale}
				onConfirm={handleSelect}
				previewId={previewId}
				setPreviewId={setPreviewId}
				setShowModal={(open) => {
					setShowModal(open)
					if (!open) setShowConfirm(false)
				}}
				showModal={showModal}
				statFilters={statFilters}
				title="build.labels.cont_title"
			/>
			<Modal.Root onOpenChange={setShowConfirm} open={showConfirm}>
				<Modal.Content className="max-w-md">
					<Modal.Header>
						<Modal.Title>
							{t('buildsLite.containerWarnTitle')}
						</Modal.Title>
						<Modal.Description className="font-semibold">
							{t('buildsLite.containerWarnDesc')}
						</Modal.Description>
					</Modal.Header>
					<Modal.Body>
						<p className="font-semibold">
							{t('buildsLite.lostSlots', { count: lostSlots })}
						</p>
					</Modal.Body>
					<Modal.Footer className="flex justify-end gap-2">
						<Modal.Action
							onClick={() => setShowConfirm(false)}
							variant="ghost"
						>
							{t('build.cancel')}
						</Modal.Action>
						<Modal.Action
							onClick={selectContainer}
							variant="danger"
						>
							{t('buildsLite.confirm')}
						</Modal.Action>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</>
	)
}
