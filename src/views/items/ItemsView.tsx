'use client'

import {
	useQuery,
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from '@tanstack/react-query'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { unbounded } from '@/app/fonts'
import { Card } from '@/components/ui/Card'
import { getLocale } from '@/lib/getLocale'
import { auctionQueries } from '@/queries/auction/auction.queries'
import { itemQueries } from '@/queries/item/item.queries'
import { useModulesStore } from '@/stores/useModules.store'
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
import AttachmentsBuilder from './components/attachments/AttachmentsBuilder'
import {
	computeStatOverrides,
	type StatOverride,
} from './components/attachments/attachmentStats'
import { ListBlock, NumericVariantsCard, TextBlock } from './components/blocks'
import ItemTabs from './components/tabs/AuctionTabs'

type ItemsViewProps = { path: string[]; id: string; githubUrl: string }

export default function ItemsView({ path, id, githubUrl }: ItemsViewProps) {
	const [numericVariants, setNumericVariants] = useState<number>(0)
	const [selected, setSelected] = useState<Record<string, string>>({})
	const locale = getLocale()

	const modulesLoad = useModulesStore((s) => s.load)

	useEffect(() => {
		modulesLoad()
	}, [modulesLoad])

	const iconUrl = `https://raw.githubusercontent.com/oarer/sc-db/refs/heads/main/merged/icons/${path.join('/')}.png`

	const { data } = useSuspenseQuery(itemQueries.byGithubUrl(githubUrl))

	const {
		data: auctionHistoryInfinite,
		hasNextPage: historyHasNextPage,
		fetchNextPage: fetchHistoryNextPage,
	} = useSuspenseInfiniteQuery(auctionQueries.historyInfinite({ id, limit: 50 }))
	const {
		data: auctionCurrentInfinite,
		hasNextPage: currentHasNextPage,
		fetchNextPage: fetchCurrentNextPage,
	} = useSuspenseInfiniteQuery(auctionQueries.lotsInfinite({ id, limit: 50 }))

	const auctionCurrent = useMemo(
		() => auctionCurrentInfinite.pages.flatMap((page) => page.lots),
		[auctionCurrentInfinite.pages]
	)
	const auctionHistory = useMemo(
		() => auctionHistoryInfinite.pages.flatMap((page) => page.prices),
		[auctionHistoryInfinite.pages]
	)

	const { data: barter } = useSuspenseQuery(itemQueries.barter(id))

	const isWeapon = data.category.startsWith('weapon/')

	const { data: attachmentsData } = useQuery({
		...itemQueries.attachments(id),
		enabled: isWeapon,
	})

	const attachments = attachmentsData?.attachments ?? []

	const selectedAttachments = useMemo(
		() =>
			Object.values(selected)
				.map((selectedId) =>
					attachments.find((a) => a.id === selectedId)
				)
				.filter((a): a is NonNullable<typeof a> => a !== undefined),
		[selected, attachments]
	)

	const statOverrides = useMemo<Map<string, StatOverride>>(
		() => computeStatOverrides(data, selectedAttachments),
		[data, selectedAttachments]
	)

	const handleSelect = (category: string, attachmentId: string) => {
		setSelected((prev) => {
			if (prev[category] === attachmentId) {
				const { [category]: _, ...rest } = prev
				return rest
			}

			return { ...prev, [category]: attachmentId }
		})
	}

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
						auctionCurrent={auctionCurrent}
						auctionHistory={auctionHistory}
						barter={barter}
						currentHasMore={currentHasNextPage}
						historyHasMore={historyHasNextPage}
						onCurrentLoadMore={fetchCurrentNextPage}
						onHistoryLoadMore={fetchHistoryNextPage}
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
				{isWeapon && (
					<AttachmentsBuilder
						attachments={attachments}
						onSelect={handleSelect}
						selected={selected}
					/>
				)}

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
							statOverrides={statOverrides}
						/>
					))}
			</div>
		</section>
	)
}
