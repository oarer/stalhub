'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { playerQueries } from '@/queries/player/player.queries'
import { useModulesStore } from '@/stores/useModules.store'
import { type InfoColor, infoColorMap } from '@/types/item.type'
import type {
	PlayerGearAttachment,
	PlayerGearAttribute,
	PlayerGearItem,
	PlayerGearItemDb,
	PlayerGearResponse,
} from '@/types/playerGear.type'
import { calcArtifactPercent, getQualityByPercent } from '@/utils/artUtils'
import {
	calcModuleAttrStats,
	calcModulePct,
	getModuleGroupByAttributeType,
	getRarityByQuality,
	RARITY_COLORS,
} from '@/views/calcs/modules/utils/moduleCalc'

const SLOT_TRANSLATION_KEYS: Record<string, string> = {
	armor: 'armor',
	skin: 'skin',
	primary_weapon: 'primary_weapon',
	secondary_weapon: 'secondary_weapon',
	backpack: 'backpack',
	melee: 'melee',
}

const SLOT_ORDER = [
	'armor',
	'skin',
	'primary_weapon',
	'secondary_weapon',
	'backpack',
	'melee',
]

const SKELETON_ITEMS = [
	'armor',
	'skin',
	'primary_weapon',
	'secondary_weapon',
	'backpack',
	'melee',
]

function humanize(value: string) {
	return value
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function itemColor(db: PlayerGearItemDb | null, percent?: number | null) {
	if (percent != null) {
		return infoColorMap[getQualityByPercent(percent)] ?? 'var(--foreground)'
	}
	if (!db?.color) return 'var(--foreground)'
	return infoColorMap[db.color as InfoColor] ?? 'var(--foreground)'
}

function itemIcon(db: PlayerGearItemDb | null) {
	if (!db?.category || !db.id) return null
	return `https://cdn.stalhub.dev/db/icons/${db.category}/${db.id}.png`
}

function itemHref(db: PlayerGearItemDb | null) {
	if (!db?.category || !db.id) return null
	return `/items/${db.category}/${db.id}`
}

function GearIcon({
	db,
	size = 56,
}: {
	db: PlayerGearItemDb | null
	size?: number
}) {
	const src = itemIcon(db)

	if (!src) {
		return (
			<div
				className="flex shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground"
				style={{ width: size, height: size }}
			>
				<Icon icon="lucide:package" style={{ fontSize: size / 2 }} />
			</div>
		)
	}

	return (
		<Image
			alt={db?.name ?? ''}
			className="shrink-0 object-contain"
			height={size}
			src={src}
			width={size}
		/>
	)
}

function hasModuleStats(
	attribute: PlayerGearAttribute
): attribute is PlayerGearAttribute & {
	definitionId: string
	statsRandom: number
} {
	return attribute.definitionId !== null && attribute.statsRandom !== null
}

function GearModuleAttributes({
	attributes,
}: {
	attributes: PlayerGearAttribute[]
}) {
	const t = useTranslations()
	const modulesData = useModulesStore((state) => state.data)

	const rows = useMemo(
		() =>
			attributes.filter(hasModuleStats).map((attribute) => {
				const module = modulesData.groups
					.flatMap((group) => group.modules)
					.find(
						(candidate) => candidate.key === attribute.definitionId
					)
				const pct = calcModulePct({
					definitionId: attribute.definitionId,
					quality: attribute.quality ?? undefined,
					statsRandom: attribute.statsRandom,
				})
				const rarity = getRarityByQuality(pct)
				const group = getModuleGroupByAttributeType(
					attribute.type ?? undefined
				)
				const groupLabel =
					group === 'add-on'
						? t('modules.groupAddOn')
						: group === 'deviation'
							? t('modules.groupDeviation')
							: t('modules.groupConcept')

				return {
					key: `${attribute.type ?? 'none'}-${attribute.definitionId}`,
					name: module?.lines.ru ?? attribute.definitionId,
					pct,
					color: RARITY_COLORS[rarity],
					groupLabel,
					stats: calcModuleAttrStats({
						definitionId: attribute.definitionId,
						quality: attribute.quality ?? undefined,
						statsRandom: attribute.statsRandom,
					}),
				}
			}),
		[attributes, modulesData, t]
	)

	if (rows.length === 0) return null

	return (
		<div className="mt-2 space-y-1.5">
			{rows.map((row) => (
				<div
					className="rounded-md bg-card/40 px-2 py-1.5"
					key={row.key}
				>
					<div className="flex items-center justify-between gap-2">
						<span
							className="truncate font-semibold text-[11px]"
							style={{ color: row.color }}
						>
							{row.name}
						</span>
						<span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px]">
							<span
								className="font-semibold"
								style={{ color: row.color }}
							>
								{row.pct.toFixed(2)}%
							</span>
							<span className="text-muted-foreground">
								{row.groupLabel}
							</span>
						</span>
					</div>
					{row.stats.map((stat) => (
						<div
							className="flex items-center justify-between gap-2 text-[10px]"
							key={stat.label}
						>
							<span className="truncate text-muted-foreground">
								{stat.label}
							</span>
							<span
								className={cn(
									'font-mono font-semibold',
									stat.sign === '+'
										? 'text-success'
										: 'text-destructive'
								)}
							>
								{stat.sign}
								{stat.value.toFixed(3)}%
							</span>
						</div>
					))}
				</div>
			))}
		</div>
	)
}

function attachmentPercent(attachment: PlayerGearAttachment) {
	if (attachment.ndmg == null || attachment.quality == null) return null
	return calcArtifactPercent({
		ndmg: attachment.ndmg,
		qlt: attachment.quality,
	})
}

function AttachmentRow({ attachment }: { attachment: PlayerGearAttachment }) {
	const t = useTranslations()
	const name = attachment.name ?? attachment.db?.name ?? attachment.itemId
	if (!name) return null

	const percent = attachmentPercent(attachment)
	const color = itemColor(attachment.db, percent)
	const href = itemHref(attachment.db)

	return (
		<div className="rounded-lg bg-muted/25 px-2 py-1.5">
			<div className="flex items-center gap-2">
				<GearIcon db={attachment.db} size={28} />
				<div className="min-w-0 flex-1">
					{href ? (
						<Link
							className="block truncate font-semibold text-sm transition-opacity hover:opacity-80"
							href={href}
							style={{ color }}
						>
							{name}
						</Link>
					) : (
						<p
							className="truncate font-semibold text-xs"
							style={{ color }}
						>
							{name}
						</p>
					)}
				</div>

				<div className="flex shrink-0 items-center gap-1.5 font-mono text-[12px] text-muted-foreground">
					{percent != null && (
						<span
							className="font-semibold"
							style={{ color }}
							title={t('player.gear.percent')}
						>
							{percent.toFixed(2)}%
						</span>
					)}
					{attachment.potential != null && (
						<span
							className="font-semibold"
							title={t('player.gear.potential')}
						>
							+{attachment.potential}
						</span>
					)}
				</div>
			</div>

			<GearModuleAttributes attributes={attachment.attributes} />
		</div>
	)
}

function GearItemCard({ item }: { item: PlayerGearItem }) {
	const t = useTranslations()
	const name = item.name ?? item.db?.name ?? item.itemId ?? '—'
	const color = itemColor(item.db)
	const href = itemHref(item.db)
	const slotKey = SLOT_TRANSLATION_KEYS[item.slotType]
	const slotLabel = slotKey
		? t(`player.gear.slots.${slotKey}`)
		: humanize(item.slotType)
	const attachments = item.attachments.filter(
		(attachment) =>
			attachment.name ?? attachment.db?.name ?? attachment.itemId
	)
	const upgradeTitle =
		item.upgrade.failedAttempts != null && item.upgrade.failedAttempts > 0
			? t('player.gear.failed_attempts', {
					count: item.upgrade.failedAttempts,
				})
			: undefined

	return (
		<article
			className="flex min-w-0 flex-col rounded-xl border-2 p-3"
			style={{
				backgroundColor: `color-mix(in srgb, ${color} 6%, transparent)`,
				borderColor: `color-mix(in srgb, ${color} 32%, transparent)`,
			}}
		>
			<div className="flex min-w-0 items-start gap-3">
				<GearIcon db={item.db} />
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wide">
						{slotLabel}
					</p>
					<div className="mt-0.5 flex min-w-0 items-center gap-1.5">
						{href ? (
							<Link
								className="truncate font-semibold text-sm transition-opacity hover:opacity-80"
								href={href}
								style={{ color }}
								title={name}
							>
								{name}
								{item.upgrade.level != null && (
									<>
										{' +'}
										{item.upgrade.level + 1}
									</>
								)}
							</Link>
						) : (
							<p
								className="truncate font-semibold text-sm"
								style={{ color }}
								title={name}
							>
								{name}
								{item.upgrade.level != null && (
									<>
										{' +'}
										{item.upgrade.level + 1}
									</>
								)}
							</p>
						)}
					</div>

					<div className="mt-1.5 flex flex-wrap items-center gap-1.5">
						{item.potential != null && (
							<Badge
								className="w-fit font-mono text-[10px]"
								title={t('player.gear.potential')}
								variant="secondary"
							>
								+{item.potential}
							</Badge>
						)}
						{item.upgradeBonus != null && (
							<Badge
								className="w-fit font-mono text-[10px]"
								title={t('player.gear.bonus')}
								variant="secondary"
							>
								+{item.upgradeBonus}
							</Badge>
						)}
						{item.quality != null && (
							<Badge
								className="w-fit font-mono text-[10px]"
								title={t('player.gear.quality')}
								variant="secondary"
							>
								<Icon icon="lucide:gem" />
								{item.quality}
							</Badge>
						)}
					</div>
				</div>
			</div>

			{attachments.length > 0 && (
				<div className="mt-3 space-y-1 border-primary/20 border-t pt-2">
					<p className="mb-1 font-semibold text-[10px] text-muted-foreground uppercase tracking-wide">
						{t('player.gear.attachments')}
					</p>
					{attachments.map((attachment) => (
						<AttachmentRow
							attachment={attachment}
							key={attachment.slot}
						/>
					))}
				</div>
			)}
		</article>
	)
}

function GearSkeleton() {
	return (
		<Card.Root>
			<Card.Header className="gap-1">
				<div className="flex items-center gap-2">
					<Skeleton className="size-5" />
					<Skeleton className="h-6 w-36" />
				</div>
				<Skeleton className="h-4 w-64" />
			</Card.Header>
			<Card.Content>
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
					{SKELETON_ITEMS.map((slot) => (
						<Skeleton className="h-28 w-full" key={slot} />
					))}
				</div>
			</Card.Content>
		</Card.Root>
	)
}

export default function PlayerGearView({
	character,
	initialData,
}: {
	character: string
	initialData?: PlayerGearResponse | null
}) {
	const t = useTranslations()
	const loadModules = useModulesStore((state) => state.load)
	const {
		data: queryData,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		...playerQueries.getGear({ character }),
		enabled: !initialData,
	})
	const data = initialData ?? queryData

	useEffect(() => {
		void loadModules()
	}, [loadModules])

	if (isLoading) return <GearSkeleton />

	const items = [...(data?.items ?? [])]
		.filter((item) => item.name ?? item.itemId)
		.sort((left, right) => {
			const leftIndex = SLOT_ORDER.indexOf(left.slotType)
			const rightIndex = SLOT_ORDER.indexOf(right.slotType)
			return (
				(leftIndex < 0 ? SLOT_ORDER.length : leftIndex) -
				(rightIndex < 0 ? SLOT_ORDER.length : rightIndex)
			)
		})

	return (
		<Card.Root>
			<Card.Header className="gap-1">
				<div className="flex flex-wrap items-center gap-2">
					<Icon className="text-xl" icon="lucide:shirt" />
					<h2 className="font-semibold text-xl">
						{t('player.gear.title')}
					</h2>
				</div>
				<p className="font-semibold text-muted-foreground text-sm">
					{t('player.gear.description')}
				</p>
			</Card.Header>

			<Card.Content>
				{isError ? (
					<div className="flex flex-col items-center gap-3 py-8 text-center">
						<Icon
							className="text-4xl text-muted-foreground"
							icon="lucide:triangle-alert"
						/>
						<div>
							<p className="font-semibold">
								{t('player.gear.error')}
							</p>
							<p className="text-muted-foreground text-sm">
								{t('player.gear.error_hint')}
							</p>
						</div>
						<Button
							onClick={() => refetch()}
							size="sm"
							variant="outline"
						>
							<Icon className="mr-2" icon="lucide:refresh-cw" />
							{t('player.gear.retry')}
						</Button>
					</div>
				) : items.length === 0 ? (
					<div className="flex flex-col items-center gap-3 py-8 text-center">
						<Icon
							className="text-4xl text-muted-foreground"
							icon="lucide:package-open"
						/>
						<div>
							<p className="font-semibold">
								{t('player.gear.empty')}
							</p>
							<p className="text-muted-foreground text-sm">
								{t('player.gear.empty_hint')}
							</p>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
						{items.map((item) => (
							<GearItemCard item={item} key={item.slot} />
						))}
					</div>
				)}
			</Card.Content>
		</Card.Root>
	)
}
