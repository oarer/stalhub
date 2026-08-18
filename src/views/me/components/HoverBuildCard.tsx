'use client'

import Link from 'next/link'
import { montserrat } from '@/app/fonts'
import { HoverCard } from '@/components/ui/HoverCard'
import { CLink } from '@/components/ui/Link'
import { formatArtPrice } from '@/hooks/useBuildPrices'
import { getLocale } from '@/lib/getLocale'
import type { Item } from '@/types/item.type'
import { InfoColor, infoColorMap } from '@/types/item.type'
import type { PublicUserBuild } from '@/types/user.type'
import { messageToString } from '@/utils/itemUtils'

interface HoverBuildCardProps {
	build: PublicUserBuild
	armorItems?: Item[]
	artifacts?: Item[]
	containers?: Item[]
	side?: 'top' | 'bottom' | 'left' | 'right'
	children: React.ReactNode
}

function getIconUrl(item: Item) {
	return `https://cdn.stalhub.dev/db/icons/${item.category}/${item.id}.png`
}

export function HoverBuildCard({
	build,
	armorItems,
	artifacts,
	containers,
	side = 'right',
	children,
}: HoverBuildCardProps) {
	const locale = getLocale()

	const armorItem = build.data.armor
		? (armorItems?.find((item) => item.id === build.data.armor?.id) ?? null)
		: null
	const containerItem = build.data.container
		? (containers?.find((item) => item.id === build.data.container?.id) ??
			null)
		: null

	const armorColor = armorItem?.color
		? (infoColorMap[armorItem.color as InfoColor] ??
			infoColorMap[InfoColor.DEFAULT])
		: infoColorMap[InfoColor.DEFAULT]

	const containerColor = containerItem?.color
		? (infoColorMap[containerItem.color as InfoColor] ??
			infoColorMap[InfoColor.DEFAULT])
		: infoColorMap[InfoColor.DEFAULT]

	const artsMap = artifacts ? new Map(artifacts.map((i) => [i.id, i])) : null
	const instanceToArt = new Map(build.data.arts.map((a) => [a.instanceId, a]))

	const artifactEntries = (build.data.container?.slots ?? [])
		.filter((s): s is string => s !== null)
		.map((instanceId) => {
			const art = instanceToArt.get(instanceId)
			if (!art) return null
			const item = artsMap?.get(art.itemId)
			if (!item) return null
			const color =
				art.qualityClass !== undefined
					? (infoColorMap[art.qualityClass as InfoColor] ??
						infoColorMap[InfoColor.DEFAULT])
					: infoColorMap[InfoColor.DEFAULT]
			return {
				name: messageToString(item.name, locale),
				color,
				percent: art.percent,
				potential: art.potential,
			}
		})
		.filter(
			(
				e
			): e is {
				name: string
				color: string
				percent: number
				potential: number
			} => e !== null
		)

	const hasData = armorItems && containers && artifacts

	return (
		<HoverCard.Root>
			<HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
			<HoverCard.Content className="w-72" side={side}>
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<Link
							className="truncate font-semibold text-border transition-colors hover:text-text-accent"
							href={`/calcs/builds/lite?build=${build.id}`}
						>
							{build.title}
						</Link>
						{build.price != null && build.price > 0 && (
							<span
								className={`${montserrat.className} shrink-0 font-semibold text-text-accent text-xs`}
							>
								{formatArtPrice(build.price)}₽
							</span>
						)}
					</div>

					{hasData && (
						<div className="flex flex-col gap-1.5">
							{armorItem && (
								<div className="flex items-center gap-2">
									<img
										alt={messageToString(
											armorItem.name,
											locale
										)}
										className="size-8 shrink-0 rounded"
										src={getIconUrl(armorItem)}
									/>
									<span
										className="truncate font-semibold text-sm"
										style={{ color: armorColor }}
									>
										{messageToString(
											armorItem.name,
											locale
										)}
									</span>
								</div>
							)}
							{containerItem && (
								<div className="flex items-center gap-2">
									<img
										alt={messageToString(
											containerItem.name,
											locale
										)}
										className="size-8 shrink-0 rounded"
										src={getIconUrl(containerItem)}
									/>
									<span
										className="truncate font-bold text-sm"
										style={{ color: containerColor }}
									>
										{messageToString(
											containerItem.name,
											locale
										)}
									</span>
								</div>
							)}
							{artifactEntries.length > 0 && (
								<div className="flex flex-col gap-0.5">
									{artifactEntries.map((entry, i) => (
										<div
											className="flex items-center gap-1"
											key={entry.name + i}
										>
											<p
												className="min-w-0 flex-1 truncate font-semibold text-xs"
												style={{ color: entry.color }}
											>
												{entry.name}
											</p>
											{entry.potential !== 0 && (
												<span
													className={`${montserrat.className} shrink-0 font-medium text-xs`}
													style={{
														color: entry.color,
													}}
												>
													+{entry.potential}
												</span>
											)}
											<span
												className={`${montserrat.className} shrink-0 font-medium text-xs`}
												style={{ color: entry.color }}
											>
												{entry.percent}%
											</span>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{!hasData && <p className="text-text-accent text-xs">—</p>}

					<CLink
						external
						href={`/calcs/builds/lite?build=${build.id}`}
						variant={'secondary'}
					>
						Открыть
					</CLink>
				</div>
			</HoverCard.Content>
		</HoverCard.Root>
	)
}
