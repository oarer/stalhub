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
import { isDebuffColor } from '@/views/calcs/builds/utils/artCalculations'
import { parseItemStats } from '@/views/calcs/builds/utils/parseArtifact'
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
		() => new Map(arts.map((a) => [a.instanceId, a])),
		[arts]
	)
	const itemsMap = useMemo(
		() => new Map(items.map((i) => [i.id, i])),
		[items]
	)

	const parsedItemsMap = useMemo(() => {
		const map = new Map<string, ReturnType<typeof parseItemStats>>()
		for (const item of items) {
			map.set(item.id, parseItemStats(item, locale))
		}
		return map
	}, [items, locale])

	const { positiveOptions, negativeOptions } = useMemo(() => {
		const posMap = new Map<string, string>()
		const negMap = new Map<string, string>()

		for (const parsed of parsedItemsMap.values()) {
			const allStats = { ...parsed.statRanges, ...parsed.addStats }
			for (const [key, val] of Object.entries(allStats)) {
				const display = parsed.displayNames[key] ?? key
				if (isDebuffColor(val.color)) {
					negMap.set(key, display)
				} else {
					posMap.set(key, display)
				}
			}
		}

		return {
			positiveOptions: Array.from(posMap.entries()).map(
				([value, label]) => ({ value, label })
			),
			negativeOptions: Array.from(negMap.entries()).map(
				([value, label]) => ({ value, label })
			),
		}
	}, [parsedItemsMap])

	const [selectedPositiveStats, setSelectedPositiveStats] = useState<
		string[]
	>([])
	const [selectedNegativeStats, setSelectedNegativeStats] = useState<
		string[]
	>([])

	const statFilteredItems = useMemo(() => {
		if (
			selectedPositiveStats.length === 0 &&
			selectedNegativeStats.length === 0
		)
			return items

		return items.filter((item) => {
			const parsed = parsedItemsMap.get(item.id)
			if (!parsed) return true

			const allStats = { ...parsed.statRanges, ...parsed.addStats }

			if (selectedPositiveStats.length > 0) {
				const hasPositive = selectedPositiveStats.every(
					(key) =>
						key in allStats && !isDebuffColor(allStats[key].color)
				)
				if (!hasPositive) return false
			}

			if (selectedNegativeStats.length > 0) {
				const hasNegative = selectedNegativeStats.every(
					(key) =>
						key in allStats && isDebuffColor(allStats[key].color)
				)
				if (!hasNegative) return false
			}

			return true
		})
	}, [items, parsedItemsMap, selectedPositiveStats, selectedNegativeStats])

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

	return (
		<>
			<div className="flex flex-col gap-2">
				{slots.map((instanceId, i) => {
					const art = instanceId
						? (artsMap.get(instanceId) ?? null)
						: null
					const item = art ? (itemsMap.get(art.itemId) ?? null) : null
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
