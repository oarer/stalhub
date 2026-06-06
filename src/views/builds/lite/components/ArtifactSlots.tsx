'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import type { Art } from '@/types/build.type'
import {
	InfoColor,
	type Item,
	infoColorMap,
	type Locale,
} from '@/types/item.type'
import { messageToString } from '@/utils/itemUtils'
import { ArtifactSlotRow } from '@/views/builds/lite/components/ArtifactSlotRow'
import { ContainerPickerModal } from '@/views/builds/lite/components/ContainerPickerModal'
import { ItemPickerModal } from './ItemPickerModal'

type ArtifactSlotsProps = {
	slots: (string | null)[]
	arts: Art[]
	items: Item[]
	containers: Item[]
	currentContainerId: string | null
	locale: Locale
	selectedSlot: number
	onSelectSlot: (index: number) => void
	onCreateContainer: (itemId: string, slotsCount: number) => void
	onRemove?: (instanceId: string) => void
	setCopyMode: React.Dispatch<React.SetStateAction<boolean>>
	onCancelCopyMode?: () => void
	copyMode?: boolean
	onSelectItem?: (itemId: string) => void
}

export function ArtifactSlotsLite({
	slots,
	arts,
	items,
	containers,
	currentContainerId,
	locale,
	selectedSlot,
	onSelectSlot,
	onCreateContainer,
	onRemove,
	setCopyMode,
	copyMode,
	onSelectItem,
}: ArtifactSlotsProps) {
	const t = useTranslations()

	const [showModal, setShowModal] = useState(false)
	const [previewId, setPreviewId] = useState<string | null>(null)
	const [showContainerModal, setShowContainerModal] = useState(false)
	const [containerPreviewId, setContainerPreviewId] = useState<string | null>(
		currentContainerId
	)
	const selectedContainer = containerPreviewId
		? (containers.find((it) => it.id === containerPreviewId) ?? null)
		: null
	const currentContainer = currentContainerId
		? (containers.find((it) => it.id === currentContainerId) ?? null)
		: null

	return (
		<>
			<div className="flex flex-col gap-2">
				{slots.map((instanceId, i) => {
					const art = instanceId
						? (arts.find((a) => a.instanceId === instanceId) ??
							null)
						: null
					const item = art
						? (items.find((it) => it.id === art.itemId) ?? null)
						: null
					return (
						<ArtifactSlotRow
							art={art}
							copyMode={copyMode}
							index={i}
							instanceId={instanceId}
							isSelected={selectedSlot === i}
							item={item}
							key={i}
							locale={locale}
							onOpenModal={() => {
								if (copyMode) return
								setShowModal(true)
							}}
							onRemove={onRemove}
							onSelectSlot={onSelectSlot}
							setCopyMode={setCopyMode}
						/>
					)
				})}
				{currentContainer && <Divider />}
				<Button
					className="w-full items-center gap-4 py-1.5 hover:brightness-125"
					onClick={() => {
						setContainerPreviewId(currentContainerId)
						setShowContainerModal(true)
					}}
					style={{
						color:
							infoColorMap[
								currentContainer?.color as InfoColor
							] || InfoColor.DEFAULT,
						background: `${
							infoColorMap[
								currentContainer?.color as InfoColor
							] || InfoColor.DEFAULT
						}33`,
					}}
					variant={'secondary'}
				>
					{currentContainer && (
						<Image
							alt="Container icon"
							height={34}
							src={`https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/${currentContainer?.category}/${currentContainer?.id}.png`}
							width={34}
						/>
					)}
					<p className="font-semibold text-md">
						{currentContainer
							? messageToString(currentContainer.name, locale)
							: t('build.needed_cont')}
					</p>
				</Button>
			</div>
			<ItemPickerModal
				emptyTitle="build.labels.art"
				favoriteType="artefact"
				items={items}
				locale={locale}
				onConfirm={(itemId) => {
					onSelectItem?.(itemId)
					setShowModal(false)
					setPreviewId(null)
				}}
				previewId={previewId}
				setPreviewId={setPreviewId}
				setShowModal={setShowModal}
				showModal={showModal}
				title="build.labels.art_title"
			/>
			<ContainerPickerModal
				currentSlots={slots}
				items={containers}
				locale={locale}
				onSelectItem={onCreateContainer}
				previewId={containerPreviewId}
				selectedItem={selectedContainer}
				setPreviewId={setContainerPreviewId}
				setShowModal={setShowContainerModal}
				showModal={showContainerModal}
			/>
		</>
	)
}
