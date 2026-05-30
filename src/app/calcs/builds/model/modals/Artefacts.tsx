'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { getLocale } from '@/lib/getLocale'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { useBuildStore } from '@/stores/useBuild.store'
import type { Art, ModalProps } from '@/types/build.type'
import type { ArtQuality, Item } from '@/types/item.type'
import { computeArtifactStatsFromParsed } from '@/utils/computeArtifactStats'
import { messageToString } from '@/utils/itemUtils'
import { parseItemStats } from '@/utils/parseArtifact'
import {
	ArtifactSlots,
	ArtifactStatsPanel,
	ItemsList,
} from '@/views/builds/model/components/artifacts'

export default function ArtModal({ onClose }: ModalProps) {
	const locale = getLocale()

	const query = useSuspenseQuery(itemsQueries.get({ type: 'artefact' }))
	const items = (query.data as Item[] | undefined) ?? []

	const addArt = useBuildStore((s) => s.addArt)
	const setContainer = useBuildStore((s) => s.setContainer)
	const build = useBuildStore((s) => s.build)
	const updateArt = useBuildStore((s) => s.updateArt)
	const removeArt = useBuildStore((s) => s.removeArt)
	const copyArt = useBuildStore((s) => s.copyArt)

	const [selectedSlot, setSelectedSlot] = useState<number>(0)
	const [copyMode, setCopyMode] = useState(false)
	const [filter, setFilter] = useState('')
	const [percentState, setPercentState] = useState<number>(100)
	const [potentialState, setPotentialState] = useState<number>(0)
	const [qualityOverrides, setQualityOverrides] = useState<
		Record<string, ArtQuality | undefined>
	>({})

	const getArtAndItemBySlot = useCallback(
		(slotIndex: number) => {
			const instanceId = build.container?.slots[slotIndex] ?? null
			if (!instanceId) {
				return {
					art: null,
					item: null,
					parsed: null,
					itemName: undefined,
					qualityClass: undefined,
				}
			}

			const art =
				(build.arts as Art[]).find(
					(a) => a.instanceId === instanceId
				) ?? null

			const item = art
				? (items.find((it) => it.id === art.itemId) ?? null)
				: null

			const parsed = item ? parseItemStats(item, locale) : null

			const qualityClass = art?.qualityClass ?? undefined

			return { art, item, parsed, itemName: item?.name, qualityClass }
		},
		[build.container?.slots, build.arts, items, locale]
	)

	const handleAdd = (itemId: string) => {
		if (copyMode) return
		addArt(itemId, undefined, selectedSlot)
	}

	const handleCreateContainer = () => {
		setContainer('g35n', 6)
	}

	const handleSelectSlot = (slot: number) => {
		if (copyMode) {
			const sourceInstanceId = build.container?.slots[selectedSlot]
			if (sourceInstanceId && slot !== selectedSlot) {
				copyArt(sourceInstanceId, slot)
			}
			setCopyMode(false)
		} else {
			setSelectedSlot(slot)
		}
	}

	const selectedStatsData = useMemo(() => {
		const { art, parsed, itemName } = getArtAndItemBySlot(selectedSlot)
		if (!art || !parsed) return null

		const stats = computeArtifactStatsFromParsed(
			art,
			parsed,
			art.selectedStats
		)

		return {
			art,
			instanceId: art.instanceId,
			stats,
			parsed,
			itemName,
			color: art.qualityClass,
		}
	}, [selectedSlot, getArtAndItemBySlot])

	const addOptions = useMemo(() => {
		if (!selectedStatsData?.parsed) return []

		return Object.keys(selectedStatsData.parsed.addStats ?? {}).map(
			(k) => ({
				value: k,
				label: selectedStatsData.parsed.displayNames?.[k] ?? k,
			})
		)
	}, [selectedStatsData?.parsed])

	useEffect(() => {
		if (!selectedStatsData?.art) {
			setPercentState(100)
			setPotentialState(0)
			return
		}
		setPercentState(selectedStatsData.art.percent ?? 100)
		setPotentialState(selectedStatsData.art.potential ?? 0)
	}, [
		selectedStatsData?.art?.instanceId,
		selectedStatsData?.art,
		selectedStatsData?.art?.percent,
		selectedStatsData?.art?.potential,
	])

	const sendUpdate = useCallback(
		(payload: {
			instanceId?: string
			type: 'percent' | 'potential'
			value: number
		}) => {
			const { instanceId, type, value } = payload
			if (!instanceId) {
				return
			}

			if (typeof updateArt === 'function') {
				if (type === 'percent') {
					updateArt(instanceId, { percent: value })
				} else {
					updateArt(instanceId, { potential: value })
				}
			} else {
				console.warn('updateArt not available in store', payload)
			}
		},
		[updateArt]
	)

	const handlePercentClick = useCallback(
		(value: number) => {
			setPercentState(value)
			const instanceId = selectedStatsData?.instanceId
			sendUpdate({ instanceId, type: 'percent', value })
		},
		[selectedStatsData?.instanceId, sendUpdate]
	)

	const handlePercentInputChange = useCallback(
		(value: number) => {
			setPercentState(value)
			const instanceId = selectedStatsData?.instanceId
			sendUpdate({ instanceId, type: 'percent', value })
		},
		[selectedStatsData?.instanceId, sendUpdate]
	)

	const handlePotentialClick = useCallback(
		(value: number) => {
			setPotentialState(value)
			const instanceId = selectedStatsData?.instanceId
			sendUpdate({ instanceId, type: 'potential', value })
		},
		[selectedStatsData?.instanceId, sendUpdate]
	)

	const handlePotentialInputChange = useCallback(
		(value: number) => {
			setPotentialState(value)
			const instanceId = selectedStatsData?.instanceId
			sendUpdate({ instanceId, type: 'potential', value })
		},
		[selectedStatsData?.instanceId, sendUpdate]
	)

	const handleQualitySelect = useCallback(
		(instanceId: string | undefined, choice: ArtQuality) => {
			if (!instanceId) return

			setQualityOverrides((prev) => ({
				...prev,
				[instanceId]: choice,
			}))

			if (typeof updateArt === 'function') {
				updateArt(instanceId, { qualityClass: choice })
			}
		},
		[updateArt]
	)

	const handleSelectedStatsChange = useCallback(
		(next: string[]) => {
			if (selectedStatsData?.instanceId) {
				updateArt(selectedStatsData.instanceId, { selectedStats: next })
			}
		},
		[selectedStatsData?.instanceId, updateArt]
	)

	const visibleItems = items.filter((it) =>
		messageToString(it.name, locale)
			.toLowerCase()
			.includes(filter.toLowerCase())
	)

	return (
		<div className="flex flex-col gap-4 text-nowrap">
			<div className="z-999 flex gap-4">
				<Card.Root className="min-w-70">
					<Card.Header>
						<Input
							className="px-2 text-[14px]"
							label="ui.input_label"
							onChange={(e) => setFilter(e.target.value)}
							value={filter}
						/>
					</Card.Header>

					<ItemsList
						className="max-h-90 overflow-y-auto"
						favoriteType="artefact"
						items={visibleItems}
						locale={locale}
						onSelectItem={handleAdd}
					/>
				</Card.Root>

				<Card.Root className="min-w-90">
					<Button
						aria-label="Close modal"
						className="absolute top-2.5 right-4 flex cursor-pointer items-center justify-center rounded-full p-2.5"
						onClick={onClose}
						variant={'ghost'}
					>
						<Icon className="text-lg" icon="lucide:x" />
					</Button>
					<Card.Content className="flex flex-col gap-4">
						<ArtifactStatsPanel
							addOptions={addOptions}
							art={selectedStatsData?.art ?? null}
							color={selectedStatsData?.color}
							container={build?.container?.id ?? null}
							itemName={selectedStatsData?.itemName}
							locale={locale}
							onPercentChange={handlePercentClick}
							onPercentInputChange={handlePercentInputChange}
							onPotentialChange={handlePotentialClick}
							onPotentialInputChange={handlePotentialInputChange}
							onQualitySelect={handleQualitySelect}
							onSelectedStatsChange={handleSelectedStatsChange}
							parsed={selectedStatsData?.parsed ?? null}
							percentState={percentState}
							potentialState={potentialState}
							qualityOverrides={qualityOverrides}
							stats={selectedStatsData?.stats ?? null}
						/>
					</Card.Content>
				</Card.Root>
			</div>

			<ArtifactSlots
				arts={build.arts as Art[]}
				copyMode={copyMode}
				items={items}
				locale={locale}
				onCancelCopyMode={() => setCopyMode(false)}
				onCreateContainer={handleCreateContainer}
				onRemove={removeArt}
				onSelectSlot={handleSelectSlot}
				selectedSlot={selectedSlot}
				setCopyMode={setCopyMode}
				slots={build.container?.slots ?? []}
			/>
		</div>
	)
}
