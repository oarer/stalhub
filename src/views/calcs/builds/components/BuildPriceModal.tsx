'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { Modal } from '@/components/ui/Modal'
import { Tooltip } from '@/components/ui/Tooltip'
import {
	artPriceKey,
	formatArtPrice,
	useBuildPrices,
} from '@/hooks/useBuildPrices'
import { formatDate } from '@/lib/date'
import { getLocale } from '@/lib/getLocale'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { useBuildStore } from '@/stores/useBuild.store'
import type { Item } from '@/types/item.type'
import { InfoColor, infoColorMap } from '@/types/item.type'
import { artQualityToQualityIndex } from '@/utils/artUtils'
import { messageToString } from '@/utils/itemUtils'

export default function BuildPriceModal() {
	const t = useTranslations()
	const locale = getLocale()
	const arts = useBuildStore((s) => s.build.arts)
	const { priceMap, isLoading, isError, updatedAt } = useBuildPrices()

	const { data: itemsData } = useQuery(itemsQueries.get({ type: 'artefact' }))
	const items = (itemsData as Item[] | undefined) ?? []

	const itemsMap = useMemo(
		() => new Map(items.map((i) => [i.id, i])),
		[items]
	)

	const rows = arts
		.map((art) => {
			const item = itemsMap.get(art.itemId)
			if (!item) return null

			const key = artPriceKey(
				art.itemId,
				artQualityToQualityIndex[art.qualityClass] ?? 0,
				art.potential ?? 0
			)
			const price = priceMap[key]

			return { art, item, price }
		})
		.filter((r): r is NonNullable<typeof r> => r !== null)

	const total = rows.reduce(
		(sum, r) => (r.price?.price != null ? sum + r.price.price : sum),
		0
	)

	return (
		<Modal.Root>
			<Modal.Trigger asChild className="flex gap-2 rounded-lg p-2.5">
				<Button variant="secondary">
					<Icon className="text-xl" icon="lucide:coins" />
				</Button>
			</Modal.Trigger>
			<Modal.Content className="max-w-md" fullScreen={false}>
				<Modal.Header>
					<Modal.Title className="flex items-center gap-2">
						<Icon className="text-lg" icon="lucide:coins" />
						{t('build.price_total')}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{isLoading ? (
						<p className="py-8 text-center text-neutral-400">…</p>
					) : isError ? (
						<p className="py-8 text-center text-neutral-400">
							{t('build.price_unavailable')}
						</p>
					) : rows.length === 0 ? (
						<p className="py-8 text-center text-text-accent">
							{t('build.price_empty')}
						</p>
					) : (
						<div className="flex flex-col gap-2">
							{rows.map(({ art, item, price }) => {
								const colorHex =
									infoColorMap[art.qualityClass] ??
									InfoColor.DEFAULT

								return (
									<div
										className="flex items-center justify-between gap-3 rounded-lg bg-accent/60 px-3 py-2"
										key={art.instanceId}
										style={{
											backgroundColor:
												`${colorHex}22` || undefined,
										}}
									>
										<div className="flex min-w-0 items-center gap-2">
											<Image
												alt={messageToString(
													item.name,
													locale
												)}
												height={28}
												src={`https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/${item.category}/${item.id}.png`}
												width={28}
											/>
											<div className="flex min-w-0 flex-col">
												<p
													className="truncate font-semibold text-sm"
													style={{ color: colorHex }}
												>
													{messageToString(
														item.name,
														locale
													)}
												</p>
												<p
													className={`${montserrat.className} font-semibold text-neutral-400 text-xs`}
												>
													{art.percent}%
													{art.potential > 0
														? ` · +${art.potential}`
														: ''}
												</p>
											</div>
										</div>
										<div className="flex shrink-0 items-center gap-1">
											{price?.price != null && (
												<>
													{price.source ===
														'estimate' && (
														<Tooltip.Root>
															<Tooltip.Trigger>
																≈
															</Tooltip.Trigger>
															<Tooltip.Content>
																{t(
																	'build.price_estimate_hint'
																)}
															</Tooltip.Content>
														</Tooltip.Root>
													)}
													<span
														className={`${montserrat.className} font-bold text-border text-sm`}
													>
														{formatArtPrice(
															price.price
														)}
													</span>
												</>
											)}
											{price?.price == null && (
												<span className="text-sm text-text-accent">
													—
												</span>
											)}
										</div>
									</div>
								)
							})}
						</div>
					)}
				</Modal.Body>
				{!isLoading && !isError && rows.length > 0 && (
					<>
						<Divider />
						<div className="flex flex-col gap-2 px-1 py-3">
							<div className="flex items-center justify-between">
								<p className="font-semibold">
									{t('build.price_total')}
								</p>
								<p
									className={`${montserrat.className} font-bold text-border text-xl`}
								>
									{formatArtPrice(total)}
								</p>
							</div>
							{updatedAt && (
								<p
									className={`${montserrat.className} font-semibold text-text-accent text-xs`}
								>
									{t('build.price_updated')}{' '}
									{formatDate(updatedAt, 'datetime')}
								</p>
							)}
						</div>
					</>
				)}
			</Modal.Content>
		</Modal.Root>
	)
}
