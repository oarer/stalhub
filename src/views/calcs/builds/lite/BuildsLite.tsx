'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { toPng } from 'html-to-image'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { PngPreviewModal } from '@/components/ui/PngPreviewModal'
import { toast } from '@/components/ui/Toast'
import { getFontEmbedCss } from '@/lib/font-embed'
import { getLocale } from '@/lib/getLocale'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { buildApiService } from '@/services/build-api/build-api.service'
import { useBuildStore } from '@/stores/useBuild.store'
import type { Art } from '@/types/build.type'
import type { Item } from '@/types/item.type'
import StatsTabs from '@/views/calcs/builds/components/StatsTabs'
import { ArtifactStatsPanel } from '../components/ArtifactStatsPanel'
import {
	buildPositiveNegativeOptions,
	filterItemsByEffects,
} from '../utils/effectFilters'
import { ArmorLiteSection } from './components/ArmorLiteSection'
import { ArtifactSlotsLite } from './components/ArtifactSlots'
import { BuildLiteHeader } from './components/BuildLiteHeader'
import { BuildLitePngTemplate } from './components/BuildLitePngTemplate'
import { CompareSlots } from './components/CompareSlots'
import ConsumablesModalLite from './components/ConsumablesModal'
import {
	ItemPickerModal,
	type StatFilterGroup,
} from './components/ItemPickerModal'
import { StatsCompare } from './components/StatsCompare'
import { useLiteArtifacts } from './hooks/useLiteArtifacts'

const imagePlaceholder =
	'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E'

function isImageEntry(
	entry: readonly [string, string] | null
): entry is readonly [string, string] {
	return entry !== null
}

function getIconUrl(item: Item) {
	return `https://cdn.stalhub.dev/db/icons/${item.category}/${item.id}.png`
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
	return new Promise((resolve, reject) => {
		const timeoutId = window.setTimeout(() => {
			reject(new Error('PNG export timeout'))
		}, timeoutMs)

		promise.then(
			(value) => {
				window.clearTimeout(timeoutId)
				resolve(value)
			},
			(error) => {
				window.clearTimeout(timeoutId)
				reject(error)
			}
		)
	})
}

async function imageToDataUrl(url: string, timeoutMs = 4000) {
	const controller = new AbortController()
	const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

	try {
		const response = await fetch(url, { signal: controller.signal })
		if (!response.ok) return null

		const blob = await response.blob()

		return await new Promise<string>((resolve, reject) => {
			const reader = new FileReader()
			reader.onerror = () => reject(reader.error)
			reader.onloadend = () => resolve(String(reader.result))
			reader.readAsDataURL(blob)
		})
	} catch {
		return null
	} finally {
		window.clearTimeout(timeoutId)
	}
}

type BuildsLiteViewProps = {
	variant?: 'page' | 'widget'
}

export default function BuildsLiteView({
	variant = 'page',
}: BuildsLiteViewProps) {
	const {
		savedBuilds,
		currentBuildId,
		resetBuild,
		updateBuild,
		exportBuild,
		importBuild,
		loadFromApi,
		build,
	} = useBuildStore()

	const t = useTranslations()
	const locale = getLocale()
	const importedRef = useRef(false)
	const loadedFromApiRef = useRef(false)
	const [isSavingPng, setIsSavingPng] = useState(false)
	const [pngImageSources, setPngImageSources] = useState<
		Record<string, string>
	>({})
	const [showArmorModal, setShowArmorModal] = useState(false)
	const [armorPreviewId, setArmorPreviewId] = useState<string | null>(null)
	const [pngPreviewUrl, setPngPreviewUrl] = useState<string | null>(null)
	const [showPngModal, setShowPngModal] = useState(false)
	const [compareBuildId, setCompareBuildId] = useState<string | null>(null)
	const pngTemplateRef = useRef<HTMLDivElement | null>(null)

	const currentBuild = savedBuilds.find((b) => b.id === currentBuildId)

	const compareBuild = compareBuildId
		? (savedBuilds.find((b) => b.id === compareBuildId) ?? null)
		: null

	const { data: artifactsData } = useSuspenseQuery(
		itemsQueries.get({ type: 'artefact' })
	)
	const { data: armor } = useSuspenseQuery(
		itemsQueries.get({ type: 'armor' })
	)
	const { data: containers } = useSuspenseQuery(
		itemsQueries.get({ type: 'containers' })
	)
	const { data: consumables } = useSuspenseQuery(
		itemsQueries.get({ type: 'consumables' })
	)
	const items = useMemo(
		() => (artifactsData as Item[] | undefined) ?? [],
		[artifactsData]
	)

	const setArmor = useBuildStore((s) => s.setArmor)
	const removeArmor = useBuildStore((s) => s.removeArmor)

	const [selectedArmorPositiveStats, setSelectedArmorPositiveStats] =
		useState<string[]>([])
	const [selectedArmorNegativeStats, setSelectedArmorNegativeStats] =
		useState<string[]>([])

	const armorEffectOptions = useMemo(
		() => buildPositiveNegativeOptions(armor, locale),
		[armor, locale]
	)

	const armorStatFilteredItems = useMemo(
		() =>
			filterItemsByEffects(
				armor,
				locale,
				selectedArmorPositiveStats,
				selectedArmorNegativeStats
			),
		[armor, locale, selectedArmorPositiveStats, selectedArmorNegativeStats]
	)

	const armorStatFilters = useMemo(() => {
		const groups: StatFilterGroup[] = []
		if (armorEffectOptions.positiveOptions.length > 0) {
			groups.push({
				label: 'build.labels.positive_stats',
				favoriteType: 'positive-effect',
				options: armorEffectOptions.positiveOptions,
				values: selectedArmorPositiveStats,
				onValuesChange: setSelectedArmorPositiveStats,
			})
		}
		if (armorEffectOptions.negativeOptions.length > 0) {
			groups.push({
				label: 'build.labels.negative_stats',
				favoriteType: 'negative-effect',
				options: armorEffectOptions.negativeOptions,
				values: selectedArmorNegativeStats,
				onValuesChange: setSelectedArmorNegativeStats,
			})
		}
		return groups
	}, [
		armorEffectOptions,
		selectedArmorPositiveStats,
		selectedArmorNegativeStats,
	])

	const {
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
	} = useLiteArtifacts({ build, items, locale })

	useEffect(() => {
		if (importedRef.current) return

		let cancelled = false
		const params = new URLSearchParams(window.location.search)
		const shareCode = params.get('share')
		if (!shareCode) return

		const timeoutId = setTimeout(() => {
			importBuild(shareCode).then((success) => {
				if (cancelled || !success) return
				importedRef.current = true
				window.history.replaceState({}, '', '/calcs/builds/lite')
			})
		}, 100)

		return () => {
			cancelled = true
			clearTimeout(timeoutId)
		}
	}, [importBuild])

	useEffect(() => {
		if (loadedFromApiRef.current) return

		const params = new URLSearchParams(window.location.search)
		const buildId = params.get('build')
		if (!buildId) return

		loadedFromApiRef.current = true
		buildApiService
			.get(buildId)
			.then((apiBuild) => {
				loadFromApi(
					apiBuild.id,
					apiBuild.title,
					apiBuild.data,
					apiBuild.tags
				)
				window.history.replaceState({}, '', '/calcs/builds/lite')
			})
			.catch(() => {
				toast.error(t('buildsLite.notFound'))
				window.history.replaceState({}, '', '/calcs/builds/lite')
			})
	}, [loadFromApi, t])

	const handleSavePng = useCallback(async () => {
		if (!pngTemplateRef.current || isSavingPng) return

		setIsSavingPng(true)

		try {
			await document.fonts.ready

			const iconItems = new Map<string, Item>()
			const artsByInstanceId = new Map(
				build.arts.map((art) => [art.instance_id, art])
			)
			const itemsById = new Map(items.map((item) => [item.id, item]))
			const containersById = new Map(
				containers.map((item) => [item.id, item])
			)
			const armorById = new Map(armor.map((item) => [item.id, item]))
			const consumablesById = new Map(
				consumables.map((item) => [item.id, item])
			)

			for (const slot of build.container?.slots ?? []) {
				const art = slot ? artsByInstanceId.get(slot) : null
				const item = art ? itemsById.get(art.item_id) : null
				if (item) iconItems.set(item.id, item)
			}

			const containerItem = build.container
				? containersById.get(build.container.id)
				: null
			if (containerItem) iconItems.set(containerItem.id, containerItem)

			const armorItem = build.armor ? armorById.get(build.armor.id) : null
			if (armorItem) iconItems.set(armorItem.id, armorItem)

			for (const boostId of Object.values(build.boost)) {
				if (!boostId) continue

				const boostItem = consumablesById.get(boostId)
				if (boostItem) iconItems.set(boostItem.id, boostItem)
			}

			const imageEntries = await Promise.all(
				Array.from(iconItems.values()).map(async (item) => {
					const dataUrl = await imageToDataUrl(getIconUrl(item))
					return dataUrl ? ([item.id, dataUrl] as const) : null
				})
			)

			setPngImageSources(
				Object.fromEntries(imageEntries.filter(isImageEntry))
			)
			await new Promise((resolve) => requestAnimationFrame(resolve))

			const node = pngTemplateRef.current
			const { width, height } = node.getBoundingClientRect()
			const fontEmbedCSS = await getFontEmbedCss(node)

			const dataUrl = await withTimeout(
				toPng(node, {
					backgroundColor: '#111318',
					cacheBust: false,
					fontEmbedCSS,
					height,
					imagePlaceholder,
					onImageErrorHandler: () => undefined,
					pixelRatio: 2,
					width,
				}),
				15000
			)

			setPngPreviewUrl(dataUrl)
			setShowPngModal(true)
		} finally {
			setIsSavingPng(false)
		}
	}, [armor, build, containers, consumables, isSavingPng, items])

	const handleDownloadPng = useCallback(() => {
		if (!pngPreviewUrl) return
		const link = document.createElement('a')
		const name = currentBuild?.name || t('build.new_build')
		const safeName = name
			.trim()
			.replace(/[\\/:*?"<>|]+/g, '-')
			.replace(/\s+/g, '-')
			.toLowerCase()
		link.download = `${safeName || 'build'}.png`
		link.href = pngPreviewUrl
		link.click()
		setShowPngModal(false)
	}, [currentBuild?.name, pngPreviewUrl, t])

	const handleCopyPng = useCallback(async () => {
		if (!pngPreviewUrl) return
		try {
			const res = await fetch(pngPreviewUrl)
			if (!res.ok) throw new Error('Failed to load PNG')
			const blob = await res.blob()
			await navigator.clipboard.write([
				new ClipboardItem({ 'image/png': blob }),
			])
			toast.success(t('buildsLite.pngCopied'))
			setShowPngModal(false)
		} catch {
			toast.error(t('buildsLite.copyError'))
		}
	}, [pngPreviewUrl, t])

	return (
		<section
			className={
				variant === 'widget'
					? 'flex max-w-280 flex-col gap-4'
					: 'mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6'
			}
		>
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[70%_30%]">
				<div className="flex flex-col gap-4">
					<BuildLiteHeader
						compareBuildId={compareBuildId}
						currentBuild={currentBuild}
						currentBuildId={currentBuildId}
						onCompareSelect={setCompareBuildId}
						onExport={exportBuild}
						onRename={(id, name) => updateBuild(id, { name })}
						onReset={resetBuild}
						onSavePng={handleSavePng}
						onUpdateBuild={(id, data) => updateBuild(id, data)}
						savedBuilds={savedBuilds}
						savingPng={isSavingPng}
						t={t}
					/>
					{compareBuild ? (
						<div className="flex w-full flex-col gap-4 lg:flex-row">
							<Card.Root className="w-full">
								<div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
									<ArtifactSlotsLite
										arts={build.arts as Art[]}
										containers={containers}
										copyMode={copyMode}
										currentContainerId={
											build.container?.id ?? null
										}
										items={items}
										locale={locale}
										onCancelCopyMode={() =>
											setCopyMode(false)
										}
										onCreateContainer={
											handleCreateContainer
										}
										onRemove={removeArt}
										onSelectItem={handleAdd}
										onSelectSlot={handleSelectSlot}
										selectedSlot={selectedSlot}
										setCopyMode={setCopyMode}
										slots={build.container?.slots ?? []}
										title={
											currentBuild?.name ??
											t('build.new_build')
										}
									/>
									<CompareSlots
										build={compareBuild.build}
										containers={containers}
										items={items}
										locale={locale}
										name={compareBuild.name}
									/>
								</div>
							</Card.Root>
							<Card.Root className="w-full">
								<ArtifactStatsPanel
									addOptions={addOptions}
									art={selectedStatsData?.art ?? null}
									color={selectedStatsData?.color}
									container={build?.container?.id ?? null}
									itemName={selectedStatsData?.itemName}
									locale={locale}
									onPercentChange={handlePercentChange}
									onPercentInputChange={handlePercentChange}
									onPotentialChange={handlePotentialChange}
									onPotentialInputChange={
										handlePotentialChange
									}
									onQualitySelect={handleQualitySelect}
									onSelectedStatsChange={
										handleSelectedStatsChange
									}
									parsed={selectedStatsData?.parsed ?? null}
									percentState={percentState}
									potentialState={potentialState}
									qualityOverrides={qualityOverrides}
									stats={selectedStatsData?.stats ?? null}
								/>
							</Card.Root>
						</div>
					) : (
						<div className="flex w-full flex-col gap-4 lg:flex-row">
							<Card.Root className="w-full">
								<ArtifactSlotsLite
									arts={build.arts as Art[]}
									containers={containers}
									copyMode={copyMode}
									currentContainerId={
										build.container?.id ?? null
									}
									items={items}
									locale={locale}
									onCancelCopyMode={() => setCopyMode(false)}
									onCreateContainer={handleCreateContainer}
									onRemove={removeArt}
									onSelectItem={handleAdd}
									onSelectSlot={handleSelectSlot}
									selectedSlot={selectedSlot}
									setCopyMode={setCopyMode}
									slots={build.container?.slots ?? []}
								/>
							</Card.Root>
							<Card.Root className="w-full">
								<ArtifactStatsPanel
									addOptions={addOptions}
									art={selectedStatsData?.art ?? null}
									color={selectedStatsData?.color}
									container={build?.container?.id ?? null}
									itemName={selectedStatsData?.itemName}
									locale={locale}
									onPercentChange={handlePercentChange}
									onPercentInputChange={handlePercentChange}
									onPotentialChange={handlePotentialChange}
									onPotentialInputChange={
										handlePotentialChange
									}
									onQualitySelect={handleQualitySelect}
									onSelectedStatsChange={
										handleSelectedStatsChange
									}
									parsed={selectedStatsData?.parsed ?? null}
									percentState={percentState}
									potentialState={potentialState}
									qualityOverrides={qualityOverrides}
									stats={selectedStatsData?.stats ?? null}
								/>
							</Card.Root>
						</div>
					)}
					<Card.Root className="w-full">
						<Card.Content className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
							<ArmorLiteSection
								armor={build.armor}
								armorItems={armor}
								locale={locale}
								onOpenPicker={(previewId) => {
									setArmorPreviewId(previewId)
									setShowArmorModal(true)
								}}
								onRemoveArmor={removeArmor}
								onSetArmor={setArmor}
							/>
							<Divider
								className="hidden h-full lg:block"
								orientation="vertical"
							/>
							<ConsumablesModalLite />
						</Card.Content>
					</Card.Root>
				</div>
				<div className="pt-0 lg:pt-7.75">
					{compareBuild ? (
						<StatsCompare
							buildA={build}
							buildB={compareBuild.build}
							nameA={currentBuild?.name ?? t('build.new_build')}
							nameB={compareBuild.name}
						/>
					) : (
						<StatsTabs />
					)}
				</div>
			</div>
			<ItemPickerModal
				emptyTitle="build.labels.armor"
				favoriteType="armor"
				items={armorStatFilteredItems}
				locale={locale}
				onConfirm={(itemId) => {
					setArmor(itemId)
					setShowArmorModal(false)
					setArmorPreviewId(null)
				}}
				previewId={armorPreviewId}
				setPreviewId={setArmorPreviewId}
				setShowModal={(open) => {
					setShowArmorModal(open)
					if (!open) {
						setSelectedArmorPositiveStats([])
						setSelectedArmorNegativeStats([])
					}
				}}
				showModal={showArmorModal}
				statFilters={armorStatFilters}
				title="build.labels.armor_title"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none fixed top-0 left-2500"
			>
				<BuildLitePngTemplate
					armorItems={armor}
					build={build}
					consumables={consumables}
					containers={containers}
					currentBuild={currentBuild}
					imageSources={pngImageSources}
					items={items}
					locale={locale}
					ref={pngTemplateRef}
					t={t}
				/>
			</div>
			<PngPreviewModal
				alt="Build preview"
				closeLabel={t('buildsLite.close')}
				copyLabel={t('build.copy')}
				downloadLabel={t('buildsLite.download')}
				imageClassName="rounded-lg"
				onCopy={handleCopyPng}
				onDownload={handleDownloadPng}
				onOpenChange={setShowPngModal}
				open={showPngModal}
				previewUrl={pngPreviewUrl}
				title={t('buildsLite.pngPreview')}
			/>
		</section>
	)
}
