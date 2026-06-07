'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useState } from 'react'
import { unbounded } from '@/app/fonts'
import { Card } from '@/components/ui/Card'
import { getLocale } from '@/lib/getLocale'
import { auctionQueries } from '@/queries/auction/auction.queries'
import { itemQueries } from '@/queries/item/item.queries'
import {
	type AddStatBlock,
	type DamageDistanceInfoBlock,
	type ElementListBlock,
	type InfoBlock,
	InfoColor,
	infoColorMap,
	type TextInfoBlock,
} from '@/types/item.type'
import {
	getCategoryLabel,
	isNumericVariantsBlock,
	messageToString,
} from '@/utils/itemUtils'
import { DamageChart } from '../calcs/ttk/components/DamageChart'
import { ListBlock, NumericVariantsCard, TextBlock } from './components/blocks'
import ItemTabs from './components/tabs/AuctionTabs'

type ItemsViewProps = { path: string[]; id: string; githubUrl: string }

export default function ItemsView({ path, id, githubUrl }: ItemsViewProps) {
	const [numericVariants, setNumericVariants] = useState<number>(0)
	const locale = getLocale()

	const iconUrl = `https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/${path.join('/')}.png`

	const { data } = useSuspenseQuery(itemQueries.byGithubUrl(githubUrl))

	const { data: auctionHistory } = useSuspenseQuery(
		auctionQueries.history({ id, limit: 20 })
	)
	const { data: auctionCurrent } = useSuspenseQuery(
		auctionQueries.lots({ id, limit: 50 })
	)

	const { data: barter } = useSuspenseQuery(itemQueries.barter(id))

	const categoryLabel = getCategoryLabel(data, locale)

	return (
		<section className="mx-auto grid max-w-360 grid-cols-1 flex-col gap-8 px-4 pt-32 pb-12 md:px-8 lg:grid-cols-[60%_40%] lg:pt-36">
			<div className="space-y-4">
				<Card.Root>
					<Card.Header className="space-y-4">
						<Card.Title className="mx-auto">
							<Image
								alt={
									messageToString(data.name, locale) || 'item'
								}
								height={128}
								src={iconUrl}
								width={128}
							/>
						</Card.Title>

						<div className="space-y-2 text-center">
							<h1
								className={`${unbounded.className} font-semibold text-xl`}
								style={{
									color:
										infoColorMap[data.color as InfoColor] ||
										InfoColor.DEFAULT,
								}}
							>
								{messageToString(data.name, locale) || data.id}
							</h1>
							<p className="font-semibold">{categoryLabel}</p>
						</div>
					</Card.Header>

					<Card.Description className="py-3">
						{data.infoBlocks
							.filter(
								(b: InfoBlock): b is TextInfoBlock =>
									b.type === 'text' &&
									(!!messageToString(b.title, locale) ||
										!!messageToString(b.text, locale))
							)
							.map((block, i) => (
								<TextBlock
									block={block}
									key={i}
									locale={locale}
								/>
							))}
					</Card.Description>
				</Card.Root>

				<div className="flex flex-col gap-4">
					<ItemTabs
						auctionCurrent={auctionCurrent.lots}
						auctionHistory={auctionHistory.prices}
						barter={barter}
					/>

					{data.infoBlocks
						.filter(
							(block): block is DamageDistanceInfoBlock =>
								block.type === 'damage'
						)
						.map((block, idx) => (
							<DamageChart block={block} key={idx} />
						))}
				</div>
			</div>

			<div className="space-y-4">
				{data.infoBlocks
					.filter(
						(b): b is ElementListBlock =>
							b.type === 'list' &&
							Array.isArray(b.elements) &&
							b.elements.length > 0
					)
					.map((block, idx) =>
						block.elements.some(isNumericVariantsBlock) ? (
							<NumericVariantsCard
								key={idx}
								numericVariants={numericVariants}
								onChange={setNumericVariants}
							/>
						) : null
					)}

				{data.infoBlocks
					.filter(
						(b): b is AddStatBlock | ElementListBlock =>
							(b.type === 'list' || b.type === 'addStat') &&
							Array.isArray(b.elements) &&
							b.elements.length > 0
					)
					.map((block, idx) => (
						<ListBlock
							block={block}
							key={idx}
							locale={locale}
							numericVariants={numericVariants}
						/>
					))}
			</div>
		</section>
	)
}
