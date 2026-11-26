'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { mtsExtended } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { getItemIcon } from '@/lib/itemIcon'
import {
	InfoColor,
	type Item,
	infoColorMap,
	type Locale,
} from '@/types/item.type'
import { getCategoryLabel, messageToString } from '@/utils/itemUtils'
import type { ListingPath } from '../itemComparisonUtils'

type ItemSlotProps = {
	label: string
	refValue: ListingPath | null
	item: Item | undefined
	isPending: boolean
	isError: boolean
	isFetching: boolean
	locale: Locale
	onPick: () => void
	onRemove: () => void
	onRetry: () => void
}

const iconUrl = (item: Pick<Item, 'category' | 'id'> & { icon?: string }) =>
	`https://cdn.stalhub.dev/db${getItemIcon(item)}`

const categoryFallback = (category: string) =>
	category
		.split('/')
		.map((part) =>
			part.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
		)
		.join(' › ')

export function ItemSlot({
	label,
	refValue,
	item,
	isPending,
	isError,
	isFetching,
	locale,
	onPick,
	onRemove,
	onRetry,
}: ItemSlotProps) {
	const t = useTranslations()
	const { resolvedTheme } = useTheme()

	if (!refValue) {
		return (
			<button
				className="group border-muted bg-card/30 hover:border-primary/50 hover:bg-card/60 flex min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-5 py-6 text-center transition-colors"
				onClick={onPick}
				type="button"
			>
				<span className="bg-muted/60 text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary flex h-12 w-12 items-center justify-center rounded-full transition-colors">
					<Icon className="text-2xl" icon="lucide:plus" />
				</span>
				<span className="text-sm font-semibold">{label}</span>
				<span className="text-muted-foreground text-xs">
					{t('items.comparison.addItem')}
				</span>
			</button>
		)
	}

	if (isPending) {
		return (
			<Card.Root className="min-h-40 justify-between gap-3">
				<div className="flex items-center gap-3">
					<Skeleton className="h-14 w-14 shrink-0" />
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

	if (isError || !item) {
		return (
			<Card.Root className="relative min-h-40 items-center justify-center gap-3 text-center">
				<Button
					aria-label={t('items.comparison.removeItem')}
					className="absolute top-2 right-2"
					onClick={onRemove}
					size="sm"
					title={t('items.comparison.removeItem')}
					variant="ghost"
				>
					<Icon icon="lucide:x" />
				</Button>
				<Icon
					className={`text-muted-foreground text-3xl ${isFetching ? 'animate-spin' : ''}`}
					icon="lucide:triangle-alert"
				/>
				<p className="text-sm font-medium">
					{t('items.comparison.itemError')}
				</p>
				<div className="flex flex-wrap justify-center gap-2">
					<Button onClick={onRetry} size="sm" variant="outline">
						<Icon className="mr-2" icon="lucide:refresh-cw" />
						{t('items.comparison.retry')}
					</Button>
					<Button onClick={onPick} size="sm" variant="ghost">
						{t('items.comparison.change')}
					</Button>
				</div>
			</Card.Root>
		)
	}

	const name = messageToString(item.name, locale) || item.id
	const color =
		item.color === InfoColor.DEFAULT
			? 'var(--foreground)'
			: (infoColorMap[item.color] ?? 'var(--foreground)')
	const nameColor =
		resolvedTheme === 'dark'
			? color
			: `color-mix(in srgb, ${color} 70%, var(--foreground))`
	const href = `/items/${item.category}/${item.id}`

	return (
		<Card.Root className="relative min-h-40 justify-between gap-3">
			<Button
				aria-label={t('items.comparison.removeItem')}
				className="absolute top-2 right-2 shrink-0"
				onClick={onRemove}
				size="sm"
				title={t('items.comparison.removeItem')}
				variant="ghost"
			>
				<Icon icon="lucide:x" />
			</Button>

			<div className="flex items-start gap-3 pr-8">
				<Image
					alt={name}
					className="h-14 w-14 shrink-0 object-contain"
					height={56}
					src={iconUrl(item)}
					width={56}
				/>
				<div className="min-w-0 flex-1 space-y-1">
					<p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
						{label}
					</p>
					<h2
						className={`${mtsExtended.className} line-clamp-3 text-base leading-tight font-semibold wrap-break-word`}
						style={{ color: nameColor }}
						title={name}
					>
						{name}
					</h2>
					<p className="text-muted-foreground truncate text-xs font-medium">
						{getCategoryLabel(item, locale) ||
							categoryFallback(refValue.category)}
					</p>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<Button onClick={onPick} size="sm" variant="outline">
					<Icon className="mr-2" icon="lucide:refresh-cw" />
					{t('items.comparison.change')}
				</Button>
				<Link
					className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
					href={href}
				>
					<Icon icon="lucide:external-link" />
					{t('items.comparison.openItem')}
				</Link>
			</div>
		</Card.Root>
	)
}
