'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { getLocale } from '@/lib/getLocale'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { useBuildStore } from '@/stores/useBuild.store'
import type { Art } from '@/types/build.type'
import type { Item } from '@/types/item.type'
import StatsTabs from '@/views/builds/components/StatsTabs'
import { ArtifactStatsPanel } from '../model/components/artifacts'
import { ArmorLiteSection } from './components/ArmorLiteSection'
import { ArtifactSlotsLite } from './components/ArtifactSlots'
import { BuildLiteHeader } from './components/BuildLiteHeader'
import ConsumablesModalLite from './components/ConsumablesModal'
import { ItemPickerModal } from './components/ItemPickerModal'
import { useLiteArtifacts } from './hooks/useLiteArtifacts'

export default function BuildsLiteView() {
	const {
		savedBuilds,
		currentBuildId,
		resetBuild,
		updateBuild,
		exportBuild,
		importBuild,
		build,
	} = useBuildStore()

	const t = useTranslations()
	const locale = getLocale()
	const [imported, setImported] = useState(false)
	const [showArmorModal, setShowArmorModal] = useState(false)
	const [armorPreviewId, setArmorPreviewId] = useState<string | null>(null)

	const currentBuild = savedBuilds.find((b) => b.id === currentBuildId)

	const { data: artifactsData } = useSuspenseQuery(
		itemsQueries.get({ type: 'artefact' })
	)
	const { data: armor } = useSuspenseQuery(
		itemsQueries.get({ type: 'armor' })
	)
	const { data: containers } = useSuspenseQuery(
		itemsQueries.get({ type: 'containers' })
	)
	const items = (artifactsData as Item[] | undefined) ?? []

	const setArmor = useBuildStore((s) => s.setArmor)
	const removeArmor = useBuildStore((s) => s.removeArmor)

	const selectedArmorItem = armorPreviewId
		? (armor.find((item) => item.id === armorPreviewId) ?? null)
		: null

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
					window.history.replaceState({}, '', '/calcs/builds')
				}
			})
		}, 100)
	}, [importBuild, imported])

	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[70%_30%]">
				<div className="flex flex-col gap-4">
					<BuildLiteHeader
						currentBuild={currentBuild}
						currentBuildId={currentBuildId}
						onExport={exportBuild}
						onRename={(id, name) => updateBuild(id, { name })}
						onReset={resetBuild}
						t={t}
					/>
					<div className="flex w-full flex-col gap-4 lg:flex-row">
						<Card.Root className="w-full">
							<ArtifactSlotsLite
								arts={build.arts as Art[]}
								containers={containers}
								copyMode={copyMode}
								currentContainerId={build.container?.id ?? null}
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
								onPotentialInputChange={handlePotentialChange}
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
					<StatsTabs />
				</div>
			</div>
			<ItemPickerModal
				emptyTitle="Выберите броню"
				favoriteType="armor"
				items={armor}
				locale={locale}
				onConfirm={(itemId) => {
					setArmor(itemId)
					setShowArmorModal(false)
					setArmorPreviewId(null)
				}}
				previewId={armorPreviewId}
				selectedItem={selectedArmorItem}
				setPreviewId={setArmorPreviewId}
				setShowModal={setShowArmorModal}
				showModal={showArmorModal}
				title="Выбор брони"
			/>
		</section>
	)
}
