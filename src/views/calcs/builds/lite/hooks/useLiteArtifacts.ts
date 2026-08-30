'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from '@/components/ui/Toast'
import { useBuildStore } from '@/stores/useBuild.store'
import type { Art, Build } from '@/types/build.type'
import type { ArtQuality, Item, Locale } from '@/types/item.type'
import { computeArtifactStatsFromParsed } from '@/views/calcs/builds/utils/computeArtifactStats'
import { parseItemStats } from '@/views/calcs/builds/utils/parseArtifact'

type UseLiteArtifactsParams = {
	build: Build
	items: Item[]
	locale: Locale
}

export function useLiteArtifacts({
	build,
	items,
	locale,
}: UseLiteArtifactsParams) {
	const addArt = useBuildStore((s) => s.addArt)
	const defaults = useBuildStore((s) => s.defaults)
	const setContainer = useBuildStore((s) => s.setContainer)
	const updateArt = useBuildStore((s) => s.updateArt)
	const removeArt = useBuildStore((s) => s.removeArt)
	const copyArt = useBuildStore((s) => s.copyArt)

	const [selectedSlot, setSelectedSlot] = useState(0)
	const [copyMode, setCopyMode] = useState(false)
	const [percentState, setPercentState] = useState(100)
	const [potentialState, setPotentialState] = useState(0)
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
					(a) => a.instance_id === instanceId
				) ?? null
			const item = art
				? (items.find((it) => it.id === art.item_id) ?? null)
				: null
			const parsed = item ? parseItemStats(item, locale) : null

			return {
				art,
				item,
				parsed,
				itemName: item?.name,
				qualityClass: art?.quality_class ?? undefined,
			}
		},
		[build.container?.slots, build.arts, items, locale]
	)

	const selectedStatsData = useMemo(() => {
		const { art, parsed, itemName } = getArtAndItemBySlot(selectedSlot)
		if (!art || !parsed) return null

		const stats = computeArtifactStatsFromParsed(
			art,
			parsed,
			art.selected_stats
		)

		return {
			art,
			instanceId: art.instance_id,
			stats,
			parsed,
			itemName,
			color: art.quality_class,
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
	}, [selectedStatsData?.art])

	const handleAdd = (itemId: string) => {
		if (copyMode) return
		const item = items.find((it) => it.id === itemId)
		const parsed = item ? parseItemStats(item, locale) : null
		const addStatKeys = parsed
			? Object.keys(parsed.addStats ?? {})
			: []
		const data: Partial<Art> | undefined =
			(defaults.art.potential ?? 0) >= 15 &&
			addStatKeys.length > 0 &&
			addStatKeys.length <= 3
				? { selected_stats: addStatKeys }
				: undefined
		addArt(itemId, data, selectedSlot)
	}

	const handleCreateContainer = (itemId: string, slotsCount: number) => {
		setContainer(itemId, slotsCount)
		if (selectedSlot >= slotsCount) {
			setSelectedSlot(Math.max(0, slotsCount - 1))
		}
	}

	const handleSelectSlot = (slot: number) => {
		if (copyMode) {
			const sourceInstanceId = build.container?.slots[selectedSlot]
			if (sourceInstanceId && slot !== selectedSlot) {
				copyArt(sourceInstanceId, slot)
			}
			setCopyMode(false)
			toast.dismiss('copy-mode')
			return
		}

		setSelectedSlot(slot)
	}

	const sendUpdate = useCallback(
		(payload: {
			instanceId?: string
			type: 'percent' | 'potential'
			value: number
		}) => {
			const { instanceId, type, value } = payload
			if (!instanceId) return

			if (type === 'percent') {
				updateArt(instanceId, { percent: value })
			} else {
				updateArt(instanceId, { potential: value })
			}
		},
		[updateArt]
	)

	const handlePercentChange = useCallback(
		(value: number) => {
			setPercentState(value)
			if (selectedStatsData?.art?.percent === value) return
			sendUpdate({
				instanceId: selectedStatsData?.instanceId,
				type: 'percent',
				value,
			})
		},
		[
			selectedStatsData?.instanceId,
			selectedStatsData?.art?.percent,
			sendUpdate,
		]
	)

	const handlePotentialChange = useCallback(
		(value: number) => {
			const instanceId = selectedStatsData?.instanceId
			const art = selectedStatsData?.art

			const oldPotential = art?.potential ?? 0

			setPotentialState(value)

			if (oldPotential === value) return

			const oldStatsCount = Math.floor(oldPotential / 5)
			const newStatsCount = Math.floor(value / 5)

			if (instanceId && newStatsCount < oldStatsCount) {
				updateArt(instanceId, {
					selected_stats: art?.selected_stats.slice(
						0,
						newStatsCount
					),
				})
			}

			if (value >= 15) {
				const addStatKeys = Object.keys(
					selectedStatsData?.parsed?.addStats ?? {}
				)
				if (addStatKeys.length <= 3 && instanceId) {
					updateArt(instanceId, { selected_stats: addStatKeys })
				}
			}

			sendUpdate({
				instanceId,
				type: 'potential',
				value,
			})
		},
		[selectedStatsData, updateArt, sendUpdate]
	)

	const handleQualitySelect = useCallback(
		(instanceId: string | undefined, choice: ArtQuality) => {
			if (!instanceId) return

			setQualityOverrides((prev) => ({
				...prev,
				[instanceId]: choice,
			}))
			updateArt(instanceId, { quality_class: choice })
		},
		[updateArt]
	)

	const handleSelectedStatsChange = useCallback(
		(next: string[]) => {
			if (selectedStatsData?.instanceId) {
				updateArt(selectedStatsData.instanceId, {
					selected_stats: next,
				})
			}
		},
		[selectedStatsData?.instanceId, updateArt]
	)

	return {
		addOptions,
		copyMode,
		handleAdd,
		handleCreateContainer,
		handlePercentChange,
		handlePotentialChange,
		handleQualitySelect,
		handleSelectSlot,
		handleSelectedStatsChange,
		percentState,
		potentialState,
		qualityOverrides,
		removeArt,
		selectedSlot,
		selectedStatsData,
		setCopyMode,
	}
}
