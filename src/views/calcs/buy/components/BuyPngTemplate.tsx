'use client'

import type { useTranslations } from 'next-intl'
import { forwardRef } from 'react'
import { mtsExtended } from '@/app/fonts'
import { GITHUB_RAW_BASE } from '@/constants/github.const'
import { getItemIcon } from '@/lib/itemIcon'
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
	`${GITHUB_RAW_BASE}${getItemIcon(item)}`

export const formatBuyPrice = (price: number | null): string =>
	new Intl.NumberFormat('ru-RU').format(price ?? 0)

export const BuyPngTemplate = forwardRef<HTMLDivElement, BuyPngTemplateProps>(
	function BuyPngTemplate(
		{ discord, imageSources, items, locale, t, title },
		ref
	) {
		return (
			<div className="dark bg-background w-7xl p-8 text-white" ref={ref}>
				<div className="mb-6 flex items-end justify-between gap-8">
					<h2
						className={`${mtsExtended.className} text-primary mb-6 max-w-190 text-3xl font-medium`}
					>
						{title || t('buy.title')}
					</h2>
					{discord ? (
						<div className="flex items-center gap-3">
							<p
								className={`text-foreground font-mono text-sm font-medium`}
							>
								{t('buy.discord')}
							</p>
							<p
								className={`bg-card text-primary rounded-lg px-4 py-1 font-mono text-sm font-semibold`}
							>
								{discord}
							</p>
						</div>
					) : null}
				</div>

				{items.length === 0 ? (
					<p
						className={`bg-card text-foreground rounded-lg p-8 text-center font-mono font-medium`}
					>
						{t('buy.emptyTable')}
					</p>
				) : (
					<div className="ring-primary/50 overflow-hidden rounded-lg ring-2">
						<div className="border-primary/50 bg-card grid grid-cols-[3rem_1fr_14rem] items-center border-b px-4 py-2">
							<p
								className={`text-foreground font-mono text-xs font-medium uppercase`}
							>
								№
							</p>
							<p
								className={`text-foreground font-mono text-xs font-medium uppercase`}
							>
								{t('buy.item')}
							</p>
							<p
								className={`text-foreground text-right font-mono text-xs font-medium uppercase`}
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
									className="border-primary/30 bg-card/40 grid grid-cols-[3rem_1fr_14rem] items-center border-b px-4 py-2 last:border-b-0"
									key={entry.key}
								>
									<p
										className={`text-foreground font-mono text-sm font-medium`}
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
											className="truncate text-sm font-medium"
											style={{ color }}
										>
											{name}
										</p>
									</div>
									<p
										className={`text-primary text-right font-mono text-lg font-bold`}
									>
										{formatBuyPrice(entry.price)}₽
									</p>
								</div>
							)
						})}
					</div>
				)}

				<p
					className={`text-foreground/60 mt-6 text-center font-mono text-xs font-semibold`}
				>
					stalhub.dev
				</p>
			</div>
		)
	}
)
