'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { getLocale } from '@/lib/getLocale'
import { getItemIcon } from '@/lib/itemIcon'
import { itemsQueries } from '@/queries/calcs/items.queries'
import {
	InfoColor,
	type Item,
	infoColorMap,
	type Message,
} from '@/types/item.type'
import { TierItemKind } from '@/types/tier-list.type'
import { messageToString } from '@/utils/itemUtils'

const CDN = 'https://cdn.stalhub.dev/db'

const RANK_COLORS: Record<string, { bg: string; text: string }> = {
	S: { bg: 'bg-red-500/15', text: 'text-red-400' },
	A: { bg: 'bg-orange-500/15', text: 'text-orange-400' },
	B: { bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
	C: { bg: 'bg-green-500/15', text: 'text-green-400' },
	D: { bg: 'bg-sky-500/15', text: 'text-sky-400' },
	E: { bg: 'bg-slate-500/15', text: 'text-slate-400' },
}

function iconUrl(item: Item | null | undefined) {
	if (!item) return ''
	const path = getItemIcon(item)
	return path ? `${CDN}${path}` : ''
}

function itemName(
	item: Item | undefined,
	locale: ReturnType<typeof getLocale>
) {
	if (!item) return ''
	return messageToString(item.name as Message, locale)
}

function itemColor(item: Item | undefined) {
	return item
		? (infoColorMap[item.color as InfoColor] ??
				infoColorMap[InfoColor.DEFAULT])
		: infoColorMap[InfoColor.DEFAULT]
}

export function BuildPreview({
	build,
	compact = false,
}: {
	build: {
		data: {
			armor: { id: string } | null
			container?: { id: string; slots: (string | null)[] } | null
			arts: Array<{
				instance_id: string
				item_id: string
				percent: number
				quality_class?: string | number
			}>
		}
	}
	compact?: boolean
}) {
	const t = useTranslations()
	const locale = getLocale()
	const { data: artifacts } = useQuery({
		...itemsQueries.get({ type: 'artefact' }),
		enabled: true,
	})
	const { data: armorItems } = useQuery({
		...itemsQueries.get({ type: 'armor' }),
		enabled: true,
	})
	const { data: containers } = useQuery({
		...itemsQueries.get({ type: 'containers' }),
		enabled: true,
	})

	const armor = useMemo(
		() =>
			armorItems?.find((item) => item.id === build.data.armor?.id) ??
			null,
		[armorItems, build.data.armor?.id]
	)
	const container = useMemo(
		() =>
			containers?.find((item) => item.id === build.data.container?.id) ??
			null,
		[containers, build.data.container?.id]
	)
	const arts = useMemo(() => {
		if (!artifacts) return []
		const byId = new Map(artifacts.map((item) => [item.id, item]))
		const instances = new Map(
			build.data.arts.map((art) => [art.instance_id, art])
		)
		const slots =
			build.data.container?.slots ??
			build.data.arts.map((art) => art.instance_id)
		return slots
			.filter((slot): slot is string => Boolean(slot))
			.map((instanceId) => {
				const art = instances.get(instanceId)
				if (!art) return null
				const item = byId.get(art.item_id)
				if (!item) return null
				return { item, percent: art.percent }
			})
			.filter((entry): entry is { item: Item; percent: number } =>
				Boolean(entry)
			)
	}, [artifacts, build.data.arts, build.data.container?.slots])

	const size = compact ? 'size-11' : 'size-16'
	const slotCount = compact ? 5 : 5

	return (
		<div className="flex flex-wrap items-center gap-4">
			<div className="flex flex-col items-center gap-1">
				<div
					className={`${size} flex items-center justify-center rounded-xl border border-primary/20 bg-muted/40 p-1.5`}
				>
					{armor ? (
						<Image
							alt={itemName(armor, locale)}
							className="object-contain"
							height={64}
							src={iconUrl(armor)}
							unoptimized
							width={64}
						/>
					) : (
						<Icon
							className="text-foreground/50"
							icon="lucide:shield"
						/>
					)}
				</div>
				<span
					className="max-w-24 truncate text-center text-[11px]"
					style={{ color: itemColor(armor ?? undefined) }}
					title={itemName(armor ?? undefined, locale)}
				>
					{armor
						? itemName(armor, locale)
						: t('me.buildCard.noArmor')}
				</span>
			</div>

			<div className="flex flex-col items-center gap-1">
				<div
					className={`${size} flex items-center justify-center rounded-xl border border-primary/20 bg-muted/40 p-1.5`}
				>
					{container ? (
						<Image
							alt={itemName(container, locale)}
							className="object-contain"
							height={64}
							src={iconUrl(container)}
							unoptimized
							width={64}
						/>
					) : (
						<Icon
							className="text-foreground/50"
							icon="lucide:box"
						/>
					)}
				</div>
				<span
					className="max-w-24 truncate text-center text-[11px]"
					style={{ color: itemColor(container ?? undefined) }}
					title={itemName(container ?? undefined, locale)}
				>
					{container
						? itemName(container, locale)
						: t('me.buildCard.noContainer')}
				</span>
			</div>

			<div className="flex flex-1 flex-col gap-1">
				<div className="flex flex-wrap gap-1">
					{arts.length > 0 ? (
						arts.slice(0, slotCount).map((entry, index) => (
							<div
								className="relative rounded-lg border bg-muted/40"
								key={`${entry.item.id}-${index}`}
								style={{ borderColor: itemColor(entry.item) }}
								title={itemName(entry.item, locale)}
							>
								<Image
									alt={itemName(entry.item, locale)}
									className="object-contain"
									height={compact ? 40 : 48}
									src={iconUrl(entry.item)}
									unoptimized
									width={compact ? 40 : 48}
								/>
								<span
									className="absolute -right-1 -bottom-1 rounded bg-card/95 px-0.5 font-mono text-[9px] shadow-sm"
									style={{ color: itemColor(entry.item) }}
								>
									{entry.percent}%
								</span>
							</div>
						))
					) : (
						<span className="text-foreground/70 text-xs">
							{t('me.buildCard.noArtifacts')}
						</span>
					)}
				</div>
			</div>
		</div>
	)
}

export function TierListPreview({
	entries,
	itemKind,
	compact = false,
}: {
	entries?: Array<{ item_id: string; rank: string }>
	itemKind?: string
	compact?: boolean
}) {
	const locale = getLocale()
	const isArmor = itemKind === TierItemKind.ARMOR
	const { data: listItems } = useQuery({
		...itemsQueries.get({ type: isArmor ? 'armor' : 'weapons' }),
		enabled: Boolean(entries && entries.length > 0),
	})
	const itemMap = useMemo(
		() => new Map((listItems ?? []).map((item) => [item.id, item])),
		[listItems]
	)

	const groups = useMemo(() => {
		const result: Record<
			string,
			Array<{ item?: Item; item_id: string }>
		> = {}
		for (const entry of entries ?? []) {
			const item = itemMap.get(entry.item_id)
			if (item?.uno) continue
			;(result[entry.rank] ??= []).push({ item, item_id: entry.item_id })
		}
		return result
	}, [entries, itemMap])

	const ranks = Object.keys(RANK_COLORS).filter(
		(rank) => (groups[rank]?.length ?? 0) > 0
	)
	const shownRanks = compact ? ranks.slice(0, 4) : ranks
	if (shownRanks.length === 0) {
		return (
			<div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-muted/30 px-3 py-2 text-foreground/70 text-xs">
				<Icon icon="lucide:layout-list" />—
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-1">
			{shownRanks.map((rank) => {
				const colors = RANK_COLORS[rank]
				const items = groups[rank] ?? []
				return (
					<div className="flex items-center gap-1.5" key={rank}>
						<div
							className={`flex size-7 shrink-0 items-center justify-center rounded-md font-bold text-xs ${colors.bg} ${colors.text}`}
						>
							{rank}
						</div>
						<div className="flex min-w-0 flex-wrap items-center gap-1">
							{items.slice(0, compact ? 8 : 12).map((entry) => (
								<div
									className="flex items-center rounded-md border border-primary/15 bg-muted/40 p-0.5"
									key={entry.item_id}
									title={
										entry.item
											? itemName(entry.item, locale)
											: entry.item_id
									}
								>
									{entry.item ? (
										<Image
											alt={itemName(entry.item, locale)}
											className="object-contain"
											height={compact ? 22 : 26}
											src={iconUrl(entry.item)}
											unoptimized
											width={compact ? 22 : 26}
										/>
									) : (
										<span className="px-1 font-mono text-[10px]">
											{entry.item_id}
										</span>
									)}
								</div>
							))}
							{items.length > (compact ? 8 : 12) && (
								<span className="text-[11px] text-foreground/70">
									+{items.length - (compact ? 8 : 12)}
								</span>
							)}
						</div>
					</div>
				)
			})}
		</div>
	)
}
