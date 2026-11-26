'use client'

import type { useTranslations } from 'next-intl'
import { forwardRef, useMemo } from 'react'
import { unbounded } from '@/app/fonts'
import {
	artPriceKey,
	formatArtPrice,
	useBuildPrices,
} from '@/hooks/useBuildPrices'
import type { SavedBuild } from '@/stores/useBuild.store'
import {
	BoostButtons,
	type BoostCategory,
	type Build,
} from '@/types/build.type'
import {
	InfoColor,
	type Item,
	infoColorMap,
	type Locale,
} from '@/types/item.type'
import { artQualityToQualityIndex } from '@/utils/artUtils'
import { messageToString } from '@/utils/itemUtils'
import { useBuildStats } from '@/views/calcs/builds/model/components/hooks/useBuildStats'
import { StatRow } from '../../model/components/stats'
import { groupStatsByCategory } from '../../model/components/stats/statsCategories'

type BuildLitePngTemplateProps = {
	armorItems: Item[]
	build: Build
	consumables: Item[]
	containers: Item[]
	currentBuild: SavedBuild | undefined
	imageSources: Record<string, string>
	items: Item[]
	locale: Locale
	t: ReturnType<typeof useTranslations>
}

const BOOST_CATEGORIES = Object.keys(BoostButtons) as BoostCategory[]

export const BuildLitePngTemplate = forwardRef<
	HTMLDivElement,
	BuildLitePngTemplateProps
>(function BuildLitePngTemplate(
	{
		armorItems,
		build,
		consumables,
		containers,
		currentBuild,
		imageSources,
		items,
		locale,
		t,
	},
	ref
) {
	const { displayNamesMap, hps, prime, sortedStats, stopping } =
		useBuildStats()
	const { priceMap } = useBuildPrices()

	const statGroups = useMemo(
		() => groupStatsByCategory(sortedStats),
		[sortedStats]
	)

	const artsMap = useMemo(
		() => new Map(build.arts.map((a) => [a.instance_id, a])),
		[build.arts]
	)
	const itemsMap = useMemo(
		() => new Map(items.map((i) => [i.id, i])),
		[items]
	)

	const armorItem = build.armor
		? (armorItems.find((item) => item.id === build.armor?.id) ?? null)
		: null
	const containerItem = build.container
		? (containers.find((item) => item.id === build.container?.id) ?? null)
		: null
	const buildName = currentBuild?.name || t('build.new_build')
	const armorName = armorItem ? messageToString(armorItem.name, locale) : ''
	const armorColor =
		armorItem?.color !== undefined
			? infoColorMap[armorItem.color as InfoColor]
			: InfoColor.DEFAULT
	const containerName = containerItem
		? messageToString(containerItem.name, locale)
		: ''
	const containerColor =
		containerItem?.color !== undefined
			? infoColorMap[containerItem.color as InfoColor]
			: InfoColor.DEFAULT

	const boosts = BOOST_CATEGORIES.flatMap((category) => {
		const boostId = build.boost[category]
		if (!boostId) return []

		const boostItem = consumables.find((item) => item.id === boostId)
		if (!boostItem) return []

		return [{ category, boostItem }]
	})

	const totalPrice = useMemo(
		() =>
			build.arts.reduce((sum, art) => {
				const price =
					priceMap[
						artPriceKey(
							art.item_id,
							artQualityToQualityIndex[art.quality_class] ?? 0,
							art.potential ?? 0
						)
					]
				return price?.price != null ? sum + price.price : sum
			}, 0),
		[build.arts, priceMap]
	)

	return (
		<div className="dark bg-background w-7xl p-8 text-white" ref={ref}>
			<h1
				className={`${unbounded.className} text-primary text-2xl font-bold tracking-[3] uppercase`}
			>
				stalhub.dev
			</h1>
			<header className="mb-4 flex items-center justify-between gap-8">
				<h2
					className={`${unbounded.className} max-w-190 text-3xl text-red-500`}
				>
					{buildName}
				</h2>
				<div className={`flex gap-3 text-right font-mono`}>
					<div className="bg-card rounded-lg px-4 py-1">
						<p className="text-foreground text-xs font-semibold">
							{t('build.stats.prime')}
						</p>
						<p className="text-primary text-lg font-bold">
							{prime}
						</p>
					</div>
					<div className="bg-card rounded-lg px-4 py-1">
						<p className="text-foreground text-xs font-semibold">
							{t('build.stats.regen')}
						</p>
						<p className="text-primary text-lg font-bold">{hps}%</p>
					</div>
					<div className="bg-card rounded-lg px-4 py-1">
						<p className="text-foreground text-xs font-semibold">
							{t('build.stats.stopping')}
						</p>
						<p className="text-primary text-lg font-bold">
							{stopping}%
						</p>
					</div>
				</div>
			</header>

			<div className="grid grid-cols-[40%_1fr] gap-8">
				<div className="space-y-5">
					<section className="bg-card ring-primary/50 flex flex-col gap-4 rounded-lg p-5 ring-2">
						<h1
							className={`${unbounded.className} text-md font-bold tracking-widest uppercase`}
						>
							{t('build.artifacts')}
						</h1>
						<div className="space-y-2">
							{(build.container?.slots ?? []).map(
								(instanceId, index) => {
									const art = instanceId
										? (artsMap.get(instanceId) ?? null)
										: null
									const item = art
										? (itemsMap.get(art.item_id) ?? null)
										: null
									const color =
										art?.quality_class !== undefined
											? infoColorMap[art.quality_class]
											: InfoColor.DEFAULT
									const itemName = item
										? messageToString(item.name, locale)
										: ''
									const price = art
										? priceMap[
												artPriceKey(
													art.item_id,
													artQualityToQualityIndex[
														art.quality_class
													] ?? 0,
													art.potential ?? 0
												)
											]
										: undefined

									return (
										<div
											className="border-primary/50 bg-card/40 flex items-center gap-3 rounded-lg border px-2 py-1.5"
											key={`${index}-${instanceId ?? 'empty'}`}
										>
											{item ? (
												<>
													<img
														alt={messageToString(
															item.name,
															locale
														)}
														className="size-8"
														decoding="sync"
														loading="eager"
														src={
															imageSources[
																item.id
															]
														}
													/>
													<p
														className="truncate text-sm font-semibold"
														style={{
															color,
														}}
													>
														{itemName}
													</p>
													<p
														className={`font-mono text-sm font-semibold`}
														style={{ color }}
													>
														{art?.potential
															? `+${art.potential} `
															: ''}
														{art?.percent}%
													</p>
													<p
														className={`text-primary ml-auto font-mono text-sm font-bold`}
													>
														{price?.source ===
														'estimate'
															? '≈ '
															: ''}
														{formatArtPrice(
															price?.price ?? null
														)}
													</p>
												</>
											) : (
												<p className="text-foreground/70 py-1.5 text-sm font-bold">
													{t('build.empty_slot')}
												</p>
											)}
										</div>
									)
								}
							)}
						</div>
						{containerItem ? (
							<div
								className="flex w-full items-center justify-center gap-4 rounded-lg px-4 py-1"
								style={{
									color:
										infoColorMap[
											containerItem?.color as InfoColor
										] || InfoColor.DEFAULT,
									background: `${
										infoColorMap[
											containerItem?.color as InfoColor
										] || InfoColor.DEFAULT
									}33`,
								}}
							>
								<img
									alt={messageToString(
										containerItem.name,
										locale
									)}
									className="size-10"
									decoding="sync"
									loading="eager"
									src={imageSources[containerItem.id]}
								/>
								<p
									className="text-sm font-semibold"
									style={{ color: containerColor }}
								>
									{containerName}
								</p>
							</div>
						) : (
							<p className="text-muted-foreground text-sm">
								{t('build.stats.no_container')}
							</p>
						)}
						{totalPrice > 0 && (
							<div className="bg-card flex items-center justify-between rounded-lg px-4 py-1">
								<p className="text-foreground text-xs font-semibold">
									{t('build.price_total')}
								</p>
								<p
									className={`text-primary font-mono text-lg font-bold`}
								>
									{formatArtPrice(totalPrice)}
								</p>
							</div>
						)}
					</section>

					<section className="bg-card ring-primary/50 flex flex-col gap-4 rounded-lg p-5 ring-2">
						<h1
							className={`${unbounded.className} text-md font-bold tracking-widest uppercase`}
						>
							{t('build.armor')}
						</h1>
						<div className="flex items-center gap-4">
							{armorItem && build.armor ? (
								<>
									<img
										alt={messageToString(
											armorItem.name,
											locale
										)}
										className="size-26"
										decoding="sync"
										loading="eager"
										src={imageSources[armorItem.id]}
									/>
									<div>
										<p
											className="max-w-75 truncate text-lg font-bold"
											style={{ color: armorColor }}
										>
											{armorName}
										</p>
										<p className="text-foreground text-sm font-semibold">
											{t('build.sharpening')}: +
											{build.armor.level}
										</p>
									</div>
								</>
							) : (
								<p className="text-muted-foreground text-sm font-semibold">
									{t('build.no_armor')}
								</p>
							)}
						</div>
					</section>
					{boosts.length > 0 && (
						<section className="bg-card ring-primary/50 flex flex-col gap-4 rounded-lg p-5 ring-2">
							<h1
								className={`${unbounded.className} text-md font-bold tracking-widest uppercase`}
							>
								{t('build.consumables')}
							</h1>

							<div className="grid grid-cols-6 gap-2">
								{boosts.map(({ category, boostItem }) => (
									<div
										className="bg-card flex size-14 items-center justify-center rounded-lg"
										key={category}
									>
										<img
											alt={messageToString(
												boostItem.name,
												locale
											)}
											className="size-10 object-contain"
											decoding="sync"
											loading="eager"
											src={imageSources[boostItem.id]}
										/>
									</div>
								))}
							</div>
						</section>
					)}
				</div>

				<section className="bg-card ring-primary/50 flex flex-col gap-4 rounded-lg p-5 ring-2">
					<h1
						className={`${unbounded.className} text-md font-bold tracking-widest uppercase`}
					>
						{t('build.stats.title')}
					</h1>
					<div className="text-foreground flex flex-col gap-1 text-sm font-semibold">
						{sortedStats.length === 0 ? (
							<p className="text-muted-foreground">
								{t('build.stats.no_stats')}
							</p>
						) : (
							statGroups.map((group) => (
								<div
									className="flex flex-col gap-1"
									key={group.key}
								>
									<p className="border-primary text-muted-foreground border-b pb-1 text-xs font-semibold tracking-wider uppercase">
										{t(
											`build.stats.categories.${group.key}`
										)}
									</p>
									{group.rows.map(([key, val]) => (
										<StatRow
											key={key}
											keyName={key}
											name={displayNamesMap[key] ?? key}
											value={val}
										/>
									))}
								</div>
							))
						)}
					</div>
				</section>
			</div>
		</div>
	)
})
