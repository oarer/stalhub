'use client'

import {
	useQuery,
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from '@tanstack/react-query'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { mtsExtended } from '@/app/fonts'
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
import { clampAutoRefreshInterval } from './components/tabs/AuctionAutoRefresh'
import ItemTabs from './components/tabs/AuctionTabs'

const AUTO_REFRESH_ENABLED_KEY = 'auction:autoRefresh:enabled'
const AUTO_REFRESH_INTERVAL_KEY = 'auction:autoRefresh:interval'

type ItemsViewProps = { path: string[]; id: string; githubUrl: string }

export default function ItemsView({ path, id, githubUrl }: ItemsViewProps) {
	const [numericVariants, setNumericVariants] = useState<number>(0)
	const [selected, setSelected] = useState<Record<string, string>>({})
	const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)
	const [autoRefreshIntervalSec, setAutoRefreshIntervalSec] = useState(30)
	const locale = getLocale()

	const modulesLoad = useModulesStore((s) => s.load)

	useEffect(() => {
		modulesLoad()
	}, [modulesLoad])

	useEffect(() => {
		try {
			const storedEnabled = localStorage.getItem(AUTO_REFRESH_ENABLED_KEY)
			if (storedEnabled !== null) {
				setAutoRefreshEnabled(storedEnabled === '1')
			}
			const storedInterval = localStorage.getItem(
				AUTO_REFRESH_INTERVAL_KEY
			)
			if (storedInterval !== null) {
				setAutoRefreshIntervalSec(
					clampAutoRefreshInterval(Number(storedInterval))
				)
			}
		} catch {
			// ignore storage errors
		}
	}, [])

	const handleAutoRefreshEnabledChange = (enabled: boolean) => {
		setAutoRefreshEnabled(enabled)
		try {
			localStorage.setItem(AUTO_REFRESH_ENABLED_KEY, enabled ? '1' : '0')
		} catch {
			// ignore storage errors
		}
	}

	const handleAutoRefreshIntervalChange = (sec: number) => {
		const clamped = clampAutoRefreshInterval(sec)
		setAutoRefreshIntervalSec(clamped)
		try {
			localStorage.setItem(AUTO_REFRESH_INTERVAL_KEY, String(clamped))
		} catch {
			// ignore storage errors
		}
	}

	const iconUrl = `https://cdn.stalhub.dev/db/icons/${path.join('/')}.png`

	const { data } = useSuspenseQuery(itemQueries.byGithubUrl(githubUrl))

	const {
		data: auctionHistoryInfinite,
		hasNextPage: historyHasNextPage,
		fetchNextPage: fetchHistoryNextPage,
		refetch: refetchHistory,
		isFetching: isFetchingHistory,
		dataUpdatedAt: historyUpdatedAt,
	} = useSuspenseInfiniteQuery({
		...auctionQueries.historyInfinite({ id, limit: 50 }),
		refetchInterval: autoRefreshEnabled
			? clampAutoRefreshInterval(autoRefreshIntervalSec) * 1000
			: undefined,
		refetchIntervalInBackground: false,
	})
	const {
		data: auctionCurrentInfinite,
		hasNextPage: currentHasNextPage,
		fetchNextPage: fetchCurrentNextPage,
		refetch: refetchCurrent,
		isFetching: isFetchingCurrent,
		dataUpdatedAt: currentUpdatedAt,
	} = useSuspenseInfiniteQuery({
		...auctionQueries.lotsInfinite({ id, limit: 50 }),
		refetchInterval: autoRefreshEnabled
			? clampAutoRefreshInterval(autoRefreshIntervalSec) * 1000
			: undefined,
		refetchIntervalInBackground: false,
	})

	const isRefreshing = isFetchingHistory || isFetchingCurrent
	const lastUpdatedAt = Math.max(historyUpdatedAt, currentUpdatedAt)

	const handleManualRefresh = () => {
		void Promise.all([refetchHistory(), refetchCurrent()])
	}

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
								className={`${mtsExtended.className} font-semibold text-xl`}
								style={{
									color:
										infoColorMap[data.color as InfoColor] ||
										InfoColor.DEFAULT,
								}}
							>
								{messageToString(data.name, locale) || data.id}
							</h1>
							<p className="font-medium text-foreground text-sm">
								{categoryLabel}
							</p>
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
						autoRefreshEnabled={autoRefreshEnabled}
						autoRefreshIntervalSec={autoRefreshIntervalSec}
						barter={barter}
						currentHasMore={currentHasNextPage}
						historyHasMore={historyHasNextPage}
						isRefreshing={isRefreshing}
						lastUpdatedAt={lastUpdatedAt}
						onAutoRefreshEnabledChange={
							handleAutoRefreshEnabledChange
						}
						onAutoRefreshIntervalChange={
							handleAutoRefreshIntervalChange
						}
						onCurrentLoadMore={fetchCurrentNextPage}
						onHistoryLoadMore={fetchHistoryNextPage}
						onManualRefresh={handleManualRefresh}
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
							className='text-sm'
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
