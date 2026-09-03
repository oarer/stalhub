'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
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
import { ArtifactSlotRow } from '@/views/calcs/builds/lite/components/ArtifactSlotRow'
import { ContainerPickerModal } from '@/views/calcs/builds/lite/components/ContainerPickerModal'
import {
	buildPositiveNegativeOptions,
	filterItemsByEffects,
} from '@/views/calcs/builds/utils/effectFilters'
import type { StatFilterGroup } from './ItemPickerModal'
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
	title?: string
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
	title,
}: ArtifactSlotsProps) {
	const t = useTranslations()

	const [showModal, setShowModal] = useState(false)
	const [previewId, setPreviewId] = useState<string | null>(null)
	const [showContainerModal, setShowContainerModal] = useState(false)
	const [containerPreviewId, setContainerPreviewId] = useState<string | null>(
		currentContainerId
	)
	const containersMap = useMemo(
		() => new Map(containers.map((it) => [it.id, it])),
		[containers]
	)
	const selectedContainer = containerPreviewId
		? (containersMap.get(containerPreviewId) ?? null)
		: null
	const currentContainer = currentContainerId
		? (containersMap.get(currentContainerId) ?? null)
		: null

	const artsMap = useMemo(
		() => new Map(arts.map((a) => [a.instance_id, a])),
		[arts]
	)
	const itemsMap = useMemo(
		() => new Map(items.map((i) => [i.id, i])),
		[items]
	)

	const { positiveOptions, negativeOptions } = useMemo(() => {
		return buildPositiveNegativeOptions(items, locale)
	}, [items, locale])

	const [selectedPositiveStats, setSelectedPositiveStats] = useState<
		string[]
	>([])
	const [selectedNegativeStats, setSelectedNegativeStats] = useState<
		string[]
	>([])

	const statFilteredItems = useMemo(() => {
		return filterItemsByEffects(
			items,
			locale,
			selectedPositiveStats,
			selectedNegativeStats
		)
	}, [items, locale, selectedPositiveStats, selectedNegativeStats])

	const statFilters: StatFilterGroup[] = [
		...(positiveOptions.length > 0
			? [
					{
						label: 'build.labels.positive_stats',
						options: positiveOptions,
						values: selectedPositiveStats,
						onValuesChange: setSelectedPositiveStats,
					},
				]
			: []),
		...(negativeOptions.length > 0
			? [
					{
						label: 'build.labels.negative_stats',
						options: negativeOptions,
						values: selectedNegativeStats,
						onValuesChange: setSelectedNegativeStats,
					},
				]
			: []),
	]

	const resetFilters = () => {
		setSelectedPositiveStats([])
		setSelectedNegativeStats([])
	}

	const handleModalOpenChange = (open: boolean) => {
		setShowModal(open)
		if (!open) resetFilters()
	}

	const containerEffectOptions = useMemo(
		() => buildPositiveNegativeOptions(containers, locale),
		[containers, locale]
	)

	const [selectedContainerPositiveStats, setSelectedContainerPositiveStats] =
		useState<string[]>([])
	const [selectedContainerNegativeStats, setSelectedContainerNegativeStats] =
		useState<string[]>([])

	const containerStatFilteredItems = useMemo(
		() =>
			filterItemsByEffects(
				containers,
				locale,
				selectedContainerPositiveStats,
				selectedContainerNegativeStats
			),
		[
			containers,
			locale,
			selectedContainerPositiveStats,
			selectedContainerNegativeStats,
		]
	)

	const containerStatFilters = useMemo(() => {
		const groups: StatFilterGroup[] = []
		if (containerEffectOptions.positiveOptions.length > 0) {
			groups.push({
				label: 'build.labels.positive_stats',
				options: containerEffectOptions.positiveOptions,
				values: selectedContainerPositiveStats,
				onValuesChange: setSelectedContainerPositiveStats,
			})
		}
		if (containerEffectOptions.negativeOptions.length > 0) {
			groups.push({
				label: 'build.labels.negative_stats',
				options: containerEffectOptions.negativeOptions,
				values: selectedContainerNegativeStats,
				onValuesChange: setSelectedContainerNegativeStats,
			})
		}
		return groups
	}, [containerEffectOptions, selectedContainerPositiveStats, selectedContainerNegativeStats])

	const handleContainerModalOpenChange = (open: boolean) => {
		setShowContainerModal(open)
		if (!open) {
			setSelectedContainerPositiveStats([])
			setSelectedContainerNegativeStats([])
		}
	}

	return (
		<>
			<div className="flex flex-col gap-2">
				{title && (
					<p className="truncate border-primary border-b pb-2 text-center font-bold">
						{title}
					</p>
				)}
				{slots.map((instanceId, i) => {
					const art = instanceId
						? (artsMap.get(instanceId) ?? null)
						: null
					const item = art ? (itemsMap.get(art.item_id) ?? null) : null
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
							src={`https://cdn.stalhub.dev/db/icons/${currentContainer?.category}/${currentContainer?.id}.png`}
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
				items={statFilteredItems}
				locale={locale}
				onConfirm={(itemId) => {
					onSelectItem?.(itemId)
					setShowModal(false)
					setPreviewId(null)
				}}
				previewId={previewId}
				setPreviewId={setPreviewId}
				setShowModal={handleModalOpenChange}
				showModal={showModal}
				statFilters={statFilters}
				title="build.labels.art_title"
			/>
			<ContainerPickerModal
				currentSlots={slots}
				items={containerStatFilteredItems}
				locale={locale}
				onSelectItem={onCreateContainer}
				previewId={containerPreviewId}
				selectedItem={selectedContainer}
				setPreviewId={setContainerPreviewId}
				setShowModal={handleContainerModalOpenChange}
				showModal={showContainerModal}
				statFilters={containerStatFilters}
			/>
		</>
	)
}
