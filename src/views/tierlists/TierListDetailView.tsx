'use client'

import { Icon } from '@iconify/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LightBox } from '@/components/ui/LightBox'
import { CLink } from '@/components/ui/Link'
import { Modal } from '@/components/ui/Modal'
import { ShareButton } from '@/components/ui/ShareButton'
import { Skeleton } from '@/components/ui/Skeleton'
import { toast } from '@/components/ui/Toast'
import { Tooltip } from '@/components/ui/Tooltip'
import { GITHUB_RAW_BASE } from '@/constants/github.const'
import { getItemIcon } from '@/lib/itemIcon'
import { useVisibleItems } from '@/lib/unoItems'
import { tierListQueries } from '@/queries/tier-list/tier-list.queries'
import { tierListService } from '@/services/tier-list/tier-list.service'
import { useAuthStore } from '@/stores/useAuth.store'
import {
	type InfoColor,
	type Item,
	infoColorMap,
	type Locale,
} from '@/types/item.type'
import {
	ALL_TIER_RANKS,
	TIER_RANK_COLORS,
	TierItemKind,
	type TierListEntry,
	TierListKind,
	type TierRank,
} from '@/types/tier-list.type'
import { messageToString } from '@/utils/itemUtils'
import { ActionMenu, ActionMenuItem } from '@/views/feed/ActionMenu'
import {
	ContentDetailHeader,
	DetailShell,
	DetailStat,
} from '@/views/feed/ContentDetail'
import { FeedComments } from '@/views/feed/FeedComments'
import { HideFeedMenuItem } from '@/views/feed/HideFeed'
import { ItemHoverCard } from './components/ItemHoverCard'
import { TierListPngTemplate } from './components/TierListPngTemplate'
import { useTierListPng } from './components/useTierListPng'
import { useTierTtk } from './hooks/useTierTtk'

const emptyRanks = (): Record<TierRank, TierListEntry[]> => ({
	S: [],
	A: [],
	B: [],
	C: [],
	D: [],
	E: [],
})

export default function TierListDetailView() {
	const t = useTranslations()
	const params = useParams()
	const user = useAuthStore((s) => s.user)
	const queryClient = useQueryClient()
	const id = params.id as string
	const locale = useLocale() as Locale
	const starMutation = useMutation({
		mutationFn: () => {
			if (!tierList) return Promise.resolve()
			return tierList.is_starred
				? tierListService.unstar(id)
				: tierListService.star(id)
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ['tier-lists', id] }),
	})

	const { data: tierList, isLoading } = useQuery(tierListQueries.get(id))

	const { data: rawItems } = useQuery({
		queryKey: ['items', tierList?.item_kind],
		queryFn: async () => {
			const type =
				tierList?.item_kind === TierItemKind.WEAPON
					? 'weapons'
					: 'armor'
			const { data } = await axios.get<Record<string, Item>>(
				`${GITHUB_RAW_BASE}/listing/${type}.json`
			)
			return data
		},
		enabled: Boolean(tierList),
	})
	const visibleItems = useVisibleItems(
		rawItems ? Object.values(rawItems) : undefined
	)
	const items = useMemo(
		() =>
			visibleItems
				? Object.fromEntries(
						visibleItems.map((item) => [item.id, item])
					)
				: undefined,
		[visibleItems]
	)

	const { getTtk } = useTierTtk(tierList?.scenario)

	const deleteMutation = useMutation({
		mutationFn: () => {
			if (!tierList) throw new Error('No tier list')
			return tierListService.delete(tierList.id)
		},
		onSuccess: () => {
			toast.success(t('tierlists.deleted'))
			queryClient.invalidateQueries({ queryKey: ['tier-lists'] })
			window.location.href = '/tierlists'
		},
	})

	const rankedEntries = useMemo<Record<TierRank, TierListEntry[]>>(() => {
		if (!tierList?.entries) return emptyRanks()
		const map = emptyRanks()
		for (const entry of tierList.entries) {
			map[entry.rank]?.push(entry)
		}
		return map
	}, [tierList?.entries])

	const prevRanks = useMemo(() => {
		const map = new Map<string, TierRank>()
		for (const entry of tierList?.previous_version?.entries ?? []) {
			map.set(entry.item_id, entry.rank)
		}
		return map
	}, [tierList?.previous_version])

	const {
		pngTemplateRef,
		isSavingPng,
		showPngModal,
		setShowPngModal,
		pngPreviewUrl,
		handleSavePng,
		handleCopyPng,
		handleDownloadPng,
	} = useTierListPng()

	if (isLoading) {
		return (
			<DetailShell wide>
				<Skeleton className="mb-4 h-10 w-64" />
				<Skeleton className="mb-2 h-20 w-full" />
				<Skeleton className="mb-2 h-20 w-full" />
			</DetailShell>
		)
	}

	if (!tierList) {
		return (
			<div className="mx-auto max-w-5xl px-4 py-16 text-center">
				<p className="text-foreground">{t('tierlists.notFound')}</p>
			</div>
		)
	}

	return (
		<DetailShell wide>
			<ContentDetailHeader
				actions={
					<>
						<ShareButton
							title={tierList.title}
							url={`/tierlists/${id}`}
						/>
						<Button
							aria-label={t('tierlists.exportPng')}
							className="p-2.5"
							disabled={isSavingPng || !items}
							onClick={handleSavePng}
							variant="secondary"
						>
							<Icon className="size-5" icon="lucide:image" />
						</Button>
						{user && tierList.author?.id === user.id && (
							<ActionMenu label={t('post.actions')}>
								{(close) => (
									<>
										<CLink
											className="w-full justify-start gap-2 rounded-lg px-2.5 py-2 font-medium text-sm hover:bg-muted"
											href={`/me/tierlists/${id}/edit`}
											onClick={close}
										>
											<Icon
												className="size-4"
												icon="lucide:pencil"
											/>
											{t('tierlists.edit')}
										</CLink>
										<HideFeedMenuItem
											hidden={tierList.hidden_from_feed}
											id={id}
											onDone={close}
											type="tier_list"
										/>
										<ActionMenuItem
											close={close}
											danger
											icon="lucide:trash-2"
											onClick={() =>
												deleteMutation.mutate()
											}
										>
											{t('post.delete')}
										</ActionMenuItem>
									</>
								)}
							</ActionMenu>
						)}
					</>
				}
				author={
					tierList.author
						? {
								id: tierList.author.id,
								username: tierList.author.username,
								name: tierList.author.name,
								badges: tierList.author.badges,
							}
						: null
				}
				createdAt={tierList.created_at}
				description={tierList.description || null}
				prefix={
					tierList.kind === TierListKind.SYSTEM ? (
						<Badge className="gap-2 bg-primary/10 text-primary">
							<Icon className="size-3" icon="lucide:bot" />
							{t('tierlists.system')}
						</Badge>
					) : null
				}
				stats={
					<>
						{user ? (
							<DetailStat
								active={tierList.is_starred}
								disabled={starMutation.isPending}
								icon="lucide:star"
								onClick={() => starMutation.mutate()}
								value={tierList.stars_count ?? 0}
							/>
						) : (
							<DetailStat
								icon="lucide:star"
								value={tierList.stars_count ?? 0}
							/>
						)}
						<DetailStat icon="lucide:eye" value={tierList.views} />
						<DetailStat
							icon="lucide:message-square"
							value={tierList.comments_count ?? 0}
						/>
						<Badge variant="secondary">
							{tierList.item_kind === TierItemKind.WEAPON
								? t('tierlists.weapons')
								: t('tierlists.armor')}
						</Badge>
						{tierList.category && (
							<Badge variant="secondary">
								{t(`tierlists.categories.${tierList.category}`)}
							</Badge>
						)}
						{tierList.scenario && (
							<Badge variant="secondary">
								{tierList.scenario}
							</Badge>
						)}
					</>
				}
				title={tierList.title}
			/>

			{tierList.kind === TierListKind.SYSTEM && (
				<Alert.Root>
					<Alert.Title>{t('tierlists.info.title')}</Alert.Title>
					<Alert.Description>
						{t('tierlists.info.aggregate')}
					</Alert.Description>
				</Alert.Root>
			)}

			<div className="pointer-events-none absolute top-0 left-[-9999px]">
				<TierListPngTemplate
					entries={tierList.entries ?? []}
					itemKind={tierList.item_kind}
					items={items ?? {}}
					locale={locale}
					ref={pngTemplateRef}
					title={tierList.title}
				/>
			</div>

			<RankList
				getTtk={getTtk}
				groups={rankedEntries}
				items={items}
				prevRanks={prevRanks}
				t={t}
			/>

			<div className="border-primary border-t pt-6">
				<FeedComments id={id} target="tier_list" />
			</div>

			<Modal.Root onOpenChange={setShowPngModal} open={showPngModal}>
				<Modal.Content fullScreen={false}>
					<Modal.Header>
						<Modal.Title>{t('tierlists.pngPreview')}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						{pngPreviewUrl && (
							<LightBox.Root>
								<LightBox.Trigger asChild>
									<Image
										alt="Build preview"
										className="rounded-lg"
										height={600}
										priority
										src={pngPreviewUrl}
										width={900}
									/>
								</LightBox.Trigger>
								<LightBox.Content src={pngPreviewUrl} />
							</LightBox.Root>
						)}
					</Modal.Body>
					<Modal.Footer>
						<Button
							className="gap-2"
							onClick={handleCopyPng}
							variant="outline"
						>
							<Icon className="size-4" icon="lucide:copy" />
							{t('tierlists.copyPng')}
						</Button>
						<Button className="gap-2" onClick={handleDownloadPng}>
							<Icon className="size-4" icon="lucide:download" />
							{t('tierlists.downloadPng')}
						</Button>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</DetailShell>
	)
}

function TierListEntryCard({
	entry,
	item,
	ttk,
	ammoName,
	rankChange,
}: {
	entry: TierListEntry
	item: Item | undefined
	ttk?: number
	ammoName?: string | null
	rankChange?: { prev: TierRank; curr: TierRank } | null
}) {
	const locale = useLocale() as Locale
	const name = item ? messageToString(item.name, locale) : entry.item_id

	const changed = rankChange != null && rankChange.prev !== rankChange.curr

	const content = (
		<div
			className={`flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-sm transition-colors hover:border-primary/30 ${
				changed
					? 'border-primary/40 ring-1 ring-primary/30'
					: 'border-muted'
			}`}
		>
			{item && (
				<Image
					alt={name}
					className="size-8 shrink-0 object-contain"
					height={28}
					src={`https://cdn.stalhub.dev/db${getItemIcon(item)}`}
					width={28}
				/>
			)}
			<span
				className={`truncate font-mono font-semibold`}
				style={{ color: infoColorMap[item?.color as InfoColor] }}
			>
				{name}
			</span>
		</div>
	)

	if (!item) {
		return (
			<Tooltip.Root>
				<Tooltip.Trigger>{content}</Tooltip.Trigger>
				<Tooltip.Content>
					<p className="text-xs">{entry.item_id}</p>
				</Tooltip.Content>
			</Tooltip.Root>
		)
	}

	return (
		<ItemHoverCard
			ammoName={ammoName}
			item={item}
			rankChange={rankChange}
			side="right"
			ttk={ttk}
		>
			{content}
		</ItemHoverCard>
	)
}

function RankList({
	getTtk,
	groups,
	items,
	prevRanks,
	t,
}: {
	getTtk: (item: Item) => { ttk: number; ammoName: string | null }
	groups: Record<TierRank, TierListEntry[]>
	items: Record<string, Item> | undefined
	prevRanks?: Map<string, TierRank>
	t: ReturnType<typeof useTranslations>
}) {
	return (
		<div className="space-y-2">
			{ALL_TIER_RANKS.map((rank) => {
				const colors = TIER_RANK_COLORS[rank]
				const entries = (groups[rank] ?? []).slice().sort((a, b) => {
					const ta = a.ttk ?? Number.POSITIVE_INFINITY
					const tb = b.ttk ?? Number.POSITIVE_INFINITY
					return ta - tb || a.position - b.position
				})
				return (
					<div className="flex gap-2" key={rank}>
						<div
							className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg font-semibold text-xl ring-2 ${colors.bg} ${colors.text} ${colors.ring}`}
						>
							{rank}
						</div>
						<div className="flex min-h-14 flex-1 flex-wrap gap-2 rounded-lg border border-muted bg-card/50 p-2">
							{entries.length === 0 && (
								<span className="flex items-center px-2 font-semibold text-foreground text-sm">
									{t('tierlists.empty')}
								</span>
							)}
							{entries.map((entry) => {
								const item = items?.[entry.item_id]
								const ttk =
									entry.ttk != null
										? { ttk: entry.ttk, ammoName: null }
										: item
											? getTtk(item)
											: null
								const prevRank = prevRanks?.get(entry.item_id)
								const rankChange =
									prevRank != null && prevRank !== entry.rank
										? { prev: prevRank, curr: entry.rank }
										: null
								return (
									<TierListEntryCard
										ammoName={ttk?.ammoName ?? null}
										entry={entry}
										item={item}
										key={entry.id}
										rankChange={rankChange}
										ttk={ttk?.ttk}
									/>
								)
							})}
						</div>
					</div>
				)
			})}
		</div>
	)
}
