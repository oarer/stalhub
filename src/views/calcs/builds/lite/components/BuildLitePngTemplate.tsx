'use client'

import type { useTranslations } from 'next-intl'
import { forwardRef } from 'react'
import { montserrat, unbounded } from '@/app/fonts'
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
import { messageToString } from '@/utils/itemUtils'
import { useBuildStats } from '@/views/calcs/builds/model/components/hooks/useBuildStats'
import { StatRow } from '../../model/components/stats'

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
	const { displayNamesMap, hps, prime, sortedStats } = useBuildStats()

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

	return (
		<div className="w-7xl bg-background p-8 text-white" ref={ref}>
			<h1
				className={`${unbounded.className} font-bold text-border text-sm uppercase tracking-[3]`}
			>
				stalhub.tech
			</h1>
			<header className="mb-4 flex items-center justify-between gap-8">
				<h2
					className={`${unbounded.className} max-w-190 text-3xl text-red-500`}
				>
					{buildName}
				</h2>
				<div
					className={`${montserrat.className} grid grid-cols-2 gap-3 text-right`}
				>
					<div className="rounded-lg bg-black/25 px-4 py-1">
						<p className="font-semibold text-text-accent text-xs">
							{t('build.stats.prime')}
						</p>
						<p className="font-bold text-lg text-yellow-300">
							{prime}
						</p>
					</div>
					<div className="rounded-lg bg-black/25 px-4 py-1">
						<p className="font-semibold text-text-accent text-xs">
							{t('build.stats.regen')}
						</p>
						<p className="font-bold text-lg text-yellow-300">
							{hps}%
						</p>
					</div>
				</div>
			</header>

			<div className="grid grid-cols-[40%_1fr] gap-8">
				<div className="space-y-5">
					<section className="flex flex-col gap-4 rounded-lg bg-white/4 p-5 ring-2 ring-border/50">
						<h1
							className={`${unbounded.className} font-bold text-md uppercase tracking-widest`}
						>
							{t('build.artifacts')}
						</h1>
						<div className="space-y-2">
							{(build.container?.slots ?? []).map(
								(instanceId, index) => {
									const art = instanceId
										? (build.arts.find(
												(a) =>
													a.instanceId === instanceId
											) ?? null)
										: null
									const item = art
										? (items.find(
												(i) => i.id === art.itemId
											) ?? null)
										: null
									const color =
										art?.qualityClass !== undefined
											? infoColorMap[art.qualityClass]
											: InfoColor.DEFAULT
									const itemName = item
										? messageToString(item.name, locale)
										: ''

									return (
										<div
											className="flex items-center gap-3 rounded-lg border border-border-secondary bg-background/40 px-2 py-1.5"
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
														className="truncate font-semibold text-sm"
														style={{
															color,
														}}
													>
														{itemName}
													</p>
													<p
														className={`${montserrat.className} font-semibold text-sm`}
														style={{ color }}
													>
														{art?.potential
															? `+${art.potential} `
															: ''}
														{art?.percent}%
													</p>
												</>
											) : (
												<p className="py-1.5 font-bold text-sm text-text-accent/70">
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
									className="font-semibold text-sm"
									style={{ color: containerColor }}
								>
									{containerName}
								</p>
							</div>
						) : (
							<p className="text-neutral-400 text-sm">
								{t('build.stats.no_container')}
							</p>
						)}
					</section>

					<section className="flex flex-col gap-4 rounded-lg bg-white/4 p-5 ring-2 ring-border/50">
						<h1
							className={`${unbounded.className} font-bold text-md uppercase tracking-widest`}
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
											className="max-w-75 truncate font-bold text-lg"
											style={{ color: armorColor }}
										>
											{armorName}
										</p>
										<p className="font-semibold text-sm text-text-accent">
											Заточка: +{build.armor.level}
										</p>
									</div>
								</>
							) : (
								<p className="text-neutral-400 text-sm">
									{t('build.no_armor')}
								</p>
							)}
						</div>
					</section>
					{boosts.length > 0 && (
						<section className="flex flex-col gap-4 rounded-lg bg-white/4 p-5 ring-2 ring-border/50">
							<h1
								className={`${unbounded.className} font-bold text-md uppercase tracking-widest`}
							>
								{t('build.consumables')}
							</h1>

							<div className="grid grid-cols-6 gap-2">
								{boosts.map(({ category, boostItem }) => (
									<div
										className="flex size-14 items-center justify-center rounded-lg bg-black/25"
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

				<section className="flex flex-col gap-4 rounded-lg bg-white/4 p-5 ring-2 ring-border/50">
					<h1
						className={`${unbounded.className} font-bold text-md uppercase tracking-widest`}
					>
						{t('build.stats.title')}
					</h1>
					<div className="flex flex-col gap-1 font-semibold text-neutral-800 text-sm dark:text-neutral-100">
						{sortedStats.length === 0 ? (
							<p className="text-neutral-500">
								{t('build.stats.no_stats')}
							</p>
						) : (
							sortedStats.map(([key, val]) => (
								<StatRow
									key={key}
									keyName={key}
									name={displayNamesMap[key] ?? key}
									value={val}
								/>
							))
						)}
					</div>
				</section>
			</div>
		</div>
	)
})
