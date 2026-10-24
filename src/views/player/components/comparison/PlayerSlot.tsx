'use client'

import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import type { PlayerResponse } from '@/types/player.type'
import { allianceColors } from '@/types/player.type'
import type { PlayerRef } from './playerComparisonUtils'

type PlayerSlotProps = {
	label: string
	refValue: PlayerRef | null
	player: PlayerResponse | undefined
	isPending: boolean
	isError: boolean
	isFetching: boolean
	onPick: () => void
	onRemove: () => void
	onRetry: () => void
}

export function PlayerSlot({
	label,
	refValue,
	player,
	isPending,
	isError,
	isFetching,
	onPick,
	onRemove,
	onRetry,
}: PlayerSlotProps) {
	const t = useTranslations()

	if (!refValue) {
		return (
			<button
				className="group flex min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-muted border-dashed bg-card/30 px-5 py-6 text-center transition-colors hover:border-primary/50 hover:bg-card/60"
				onClick={onPick}
				type="button"
			>
				<span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors group-hover:bg-primary/15 group-hover:text-primary">
					<Icon className="text-2xl" icon="lucide:plus" />
				</span>
				<span className="font-semibold text-sm">{label}</span>
				<span className="text-muted-foreground text-xs">
					{t('player.comparison.addPlayer')}
				</span>
			</button>
		)
	}

	if (isPending) {
		return (
			<Card.Root className="min-h-40 justify-between gap-3">
				<div className="flex items-center gap-3">
					<Skeleton className="h-14 w-14 shrink-0 rounded-full" />
					<div className="w-full space-y-2">
						<Skeleton className="h-3 w-16" />
						<Skeleton className="h-5 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</div>
				</div>
				<Skeleton className="h-8 w-32" />
			</Card.Root>
		)
	}

	if (isError || !player) {
		return (
			<Card.Root className="relative min-h-40 items-center justify-center gap-3 text-center">
				<Button
					aria-label={t('player.comparison.removePlayer')}
					className="absolute top-2 right-2"
					onClick={onRemove}
					size="sm"
					title={t('player.comparison.removePlayer')}
					variant="ghost"
				>
					<Icon icon="lucide:x" />
				</Button>
				<Icon
					className={`text-3xl text-muted-foreground ${isFetching ? 'animate-spin' : ''}`}
					icon="lucide:triangle-alert"
				/>
				<p className="font-medium text-sm">
					{t('player.comparison.playerError')}
				</p>
				<div className="flex flex-wrap justify-center gap-2">
					<Button onClick={onRetry} size="sm" variant="outline">
						<Icon className="mr-2" icon="lucide:refresh-cw" />
						{t('player.comparison.retry')}
					</Button>
					<Button onClick={onPick} size="sm" variant="ghost">
						{t('player.comparison.change')}
					</Button>
				</div>
			</Card.Root>
		)
	}

	const clanTag = player.clan?.info?.tag
	const href = `/player/${refValue.region}/${encodeURIComponent(player.username)}`

	return (
		<Card.Root className="relative min-h-40 justify-between gap-3">
			<Button
				aria-label={t('player.comparison.removePlayer')}
				className="absolute top-2 right-2 shrink-0"
				onClick={onRemove}
				size="sm"
				title={t('player.comparison.removePlayer')}
				variant="ghost"
			>
				<Icon icon="lucide:x" />
			</Button>

			<div className="flex items-start gap-3 pr-8">
				<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
					<Icon className="text-2xl" icon="lucide:user-round" />
				</div>
				<div className="min-w-0 flex-1 space-y-1">
					<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
						{label}
					</p>
					<h2
						className={cn(
							mtsExtended.className,
							'wrap-break-word line-clamp-3 font-semibold text-base leading-tight',
							allianceColors[player.alliance]
						)}
						title={player.username}
					>
						{player.username}
					</h2>
					<p className="truncate font-medium text-muted-foreground text-xs">
						{refValue.region}
						{clanTag ? ` · [${clanTag}]` : ''}
					</p>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<Button onClick={onPick} size="sm" variant="outline">
					<Icon className="mr-2" icon="lucide:refresh-cw" />
					{t('player.comparison.change')}
				</Button>
				<Link
					className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
					href={href}
				>
					<Icon icon="lucide:external-link" />
					{t('player.comparison.openPlayer')}
				</Link>
			</div>
		</Card.Root>
	)
}
