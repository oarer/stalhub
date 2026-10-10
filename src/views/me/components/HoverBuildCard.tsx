'use client'

import Link from 'next/link'
import { HoverCard } from '@/components/ui/HoverCard'
import { CLink } from '@/components/ui/Link'
import { formatArtPrice } from '@/hooks/useBuildPrices'
import { getLocale } from '@/lib/getLocale'
import type { Item } from '@/types/item.type'
import type { PublicUserBuild } from '@/types/user.type'
import { messageToString } from '@/utils/itemUtils'
import { getBuildItemIconUrl, useBuildCardItems } from './useBuildCardItems'

interface HoverBuildCardProps {
	build: PublicUserBuild
	armorItems?: Item[]
	artifacts?: Item[]
	containers?: Item[]
	side?: 'top' | 'bottom' | 'left' | 'right'
	children: React.ReactNode
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

	const {
		armorItem,
		containerItem,
		armorColor,
		containerColor,
		artifactEntries,
		hasPreview: hasData,
	} = useBuildCardItems({
		build,
		armorItems,
		containers,
		artifacts,
		locale,
	})

	return (
		<HoverCard.Root>
			<HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
			<HoverCard.Content className="w-72" side={side}>
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<Link
							className="truncate font-semibold text-primary transition-colors hover:text-foreground"
							href={`/calcs/builds/lite?build=${build.id}`}
						>
							{build.title}
						</Link>
						{build.price != null && build.price > 0 && (
							<span
								className={`shrink-0 font-mono font-semibold text-foreground text-xs`}
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
										src={getBuildItemIconUrl(armorItem)}
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
										src={getBuildItemIconUrl(containerItem)}
									/>
									<span
										className="truncate font-semibold text-sm"
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
													className={`shrink-0 font-medium font-mono text-xs`}
													style={{
														color: entry.color,
													}}
												>
													+{entry.potential}
												</span>
											)}
											<span
												className={`shrink-0 font-medium font-mono text-xs`}
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

					{!hasData && <p className="text-foreground text-xs">—</p>}

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
