'use client'

import { Icon } from '@iconify/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { toPng } from 'html-to-image'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { LightBox } from '@/components/ui/LightBox'
import { Modal } from '@/components/ui/Modal'
import { toast } from '@/components/ui/Toast'
import { getLocale } from '@/lib/getLocale'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { buildApiService } from '@/services/build-api/build-api.service'
import { useBuildStore } from '@/stores/useBuild.store'
import type { Art } from '@/types/build.type'
import type { Item } from '@/types/item.type'
import StatsTabs from '@/views/calcs/builds/components/StatsTabs'
import { ArtifactStatsPanel } from '../components/ArtifactStatsPanel'
import { ArmorLiteSection } from './components/ArmorLiteSection'
import { ArtifactSlotsLite } from './components/ArtifactSlots'
import { BuildLiteHeader } from './components/BuildLiteHeader'
import { BuildLitePngTemplate } from './components/BuildLitePngTemplate'
import { CompareSlots } from './components/CompareSlots'
import ConsumablesModalLite from './components/ConsumablesModal'
import { ItemPickerModal } from './components/ItemPickerModal'
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
	const [imported, setImported] = useState(false)
	const [loadedFromApi, setLoadedFromApi] = useState(false)
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
	const items = (artifactsData as Item[] | undefined) ?? []

	const setArmor = useBuildStore((s) => s.setArmor)
	const removeArmor = useBuildStore((s) => s.removeArmor)

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
		if (imported) return

		const params = new URLSearchParams(window.location.search)
		const shareCode = params.get('share')
		if (!shareCode) return

		setTimeout(() => {
			importBuild(shareCode).then((success) => {
				if (success) {
					setImported(true)
					window.history.replaceState({}, '', '/calcs/builds/lite')
				}
			})
		}, 100)
	}, [importBuild, imported])

	useEffect(() => {
		if (loadedFromApi) return

		const params = new URLSearchParams(window.location.search)
		const buildId = params.get('build')
		if (!buildId) return

		setLoadedFromApi(true)
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
	}, [loadFromApi, loadedFromApi, t])

	const handleSavePng = useCallback(async () => {
		if (!pngTemplateRef.current || isSavingPng) return

		setIsSavingPng(true)

		try {
			await document.fonts.ready

			const iconItems = new Map<string, Item>()

			for (const slot of build.container?.slots ?? []) {
				const art = slot
					? build.arts.find((item) => item.instance_id === slot)
					: null
				const item = art
					? items.find((candidate) => candidate.id === art.item_id)
					: null
				if (item) iconItems.set(item.id, item)
			}

			const containerItem = build.container
				? containers.find((item) => item.id === build.container?.id)
				: null
			if (containerItem) iconItems.set(containerItem.id, containerItem)

			const armorItem = build.armor
				? armor.find((item) => item.id === build.armor?.id)
				: null
			if (armorItem) iconItems.set(armorItem.id, armorItem)

			for (const boostId of Object.values(build.boost)) {
				if (!boostId) continue

				const boostItem = consumables.find(
					(item) => item.id === boostId
				)
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

			const dataUrl = await withTimeout(
				toPng(node, {
					backgroundColor: '#111318',
					cacheBust: false,
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
				items={armor}
				locale={locale}
				onConfirm={(itemId) => {
					setArmor(itemId)
					setShowArmorModal(false)
					setArmorPreviewId(null)
				}}
				previewId={armorPreviewId}
				setPreviewId={setArmorPreviewId}
				setShowModal={setShowArmorModal}
				showModal={showArmorModal}
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
			<Modal.Root onOpenChange={setShowPngModal} open={showPngModal}>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title className="flex items-center gap-2">
							<Icon icon="lucide:image" />
							{t('buildsLite.pngPreview')}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{pngPreviewUrl && (
							<LightBox.Root>
								<LightBox.Trigger asChild>
									<Image
										alt="Build preview"
										className="rounded-lg"
										height={600}
										priority
										src={pngPreviewUrl}
										width={900}
									/>
								</LightBox.Trigger>
								<LightBox.Content src={pngPreviewUrl} />
							</LightBox.Root>
						)}
					</Modal.Body>
					<Modal.Footer>
						<Modal.Close>{t('buildsLite.close')}</Modal.Close>
						<Button
							className="flex items-center gap-2"
							onClick={handleCopyPng}
							variant="secondary"
						>
							<Icon icon="lucide:copy" />
							{t('build.copy')}
						</Button>
						<Button
							className="flex items-center gap-2"
							onClick={handleDownloadPng}
							variant="primary"
						>
							<Icon icon="lucide:download" />
							{t('buildsLite.download')}
						</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</section>
	)
}
