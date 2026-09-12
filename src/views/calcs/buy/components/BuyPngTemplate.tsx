'use client'

import type { useTranslations } from 'next-intl'
import { forwardRef } from 'react'
import { montserrat, unbounded } from '@/app/fonts'
import { GITHUB_RAW_BASE } from '@/constants/github.const'
import type { BuyListItem } from '@/stores/useBuy.store'
import type { ItemListing } from '@/types/api.type'
import { infoColorMap, type Locale } from '@/types/item.type'

type BuyPngTemplateProps = {
	discord: string
	imageSources: Record<string, string>
	items: BuyListItem[]
	locale: Locale
	t: ReturnType<typeof useTranslations>
	title: string
}

export const getBuyIconUrl = (item: ItemListing): string =>
	`${GITHUB_RAW_BASE}${item.icon}`

export const formatBuyPrice = (price: number | null): string =>
	new Intl.NumberFormat('ru-RU').format(price ?? 0)

export const BuyPngTemplate = forwardRef<HTMLDivElement, BuyPngTemplateProps>(
	function BuyPngTemplate(
		{ discord, imageSources, items, locale, t, title },
		ref
	) {
		return (
			<div className="dark w-7xl bg-background p-8 text-white" ref={ref}>
				<div className="mb-6 flex items-end justify-between gap-8">
					<h2
						className={`${unbounded.className} mb-6 max-w-190 text-3xl text-primary`}
					>
						{title || t('buy.title')}
					</h2>
					{discord ? (
						<div className="flex items-center gap-3">
							<p
								className={`${montserrat.className} font-semibold text-sm text-text-accent`}
							>
								{t('buy.discord')}
							</p>
							<p
								className={`${montserrat.className} rounded-lg bg-card px-4 py-1 font-bold text-primary text-sm`}
							>
								{discord}
							</p>
						</div>
					) : null}
				</div>

				{items.length === 0 ? (
					<p
						className={`${montserrat.className} rounded-lg bg-card p-8 text-center font-semibold text-text-accent`}
					>
						{t('buy.emptyTable')}
					</p>
				) : (
					<div className="overflow-hidden rounded-lg ring-2 ring-primary/50">
						<div className="grid grid-cols-[3rem_1fr_14rem] items-center border-primary/50 border-b bg-card px-4 py-2">
							<p
								className={`${montserrat.className} font-bold text-text-accent text-xs uppercase`}
							>
								№
							</p>
							<p
								className={`${montserrat.className} font-bold text-text-accent text-xs uppercase`}
							>
								{t('buy.item')}
							</p>
							<p
								className={`${montserrat.className} text-right font-bold text-text-accent text-xs uppercase`}
							>
								{t('buy.price')}
							</p>
						</div>

						{items.map((entry, index) => {
							const name =
								entry.item.name?.[locale] ??
								entry.item.data ??
								'—'
							const color = infoColorMap[entry.item.color]

							return (
								<div
									className="grid grid-cols-[3rem_1fr_14rem] items-center border-primary/30 border-b bg-card/40 px-4 py-2 last:border-b-0"
									key={entry.key}
								>
									<p
										className={`${montserrat.className} font-semibold text-sm text-text-accent`}
									>
										{index + 1}
									</p>
									<div className="flex min-w-0 items-center gap-4">
										<img
											alt={name}
											className="size-10 object-contain"
											decoding="sync"
											loading="eager"
											src={imageSources[entry.key]}
										/>
										<p
											className="truncate font-semibold text-sm"
											style={{ color }}
										>
											{name}
										</p>
									</div>
									<p
										className={`${montserrat.className} text-right font-bold text-lg text-primary`}
									>
										{formatBuyPrice(entry.price)}₽
									</p>
								</div>
							)
						})}
					</div>
				)}

				<p
					className={`${montserrat.className} mt-6 text-center font-semibold text-text-accent/60 text-xs`}
				>
					stalhub.dev
				</p>
			</div>
		)
	}
)
