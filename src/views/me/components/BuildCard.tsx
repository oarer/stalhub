'use client'

import { Icon } from '@iconify/react'
import { useMutation } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Button } from '@/components/ui/Button'
import { Divider } from '@/components/ui/Divider'
import { toast } from '@/components/ui/Toast'
import HoverUserCard from '@/components/ui/user/HoverUserCard'
import { formatArtPrice } from '@/hooks/useBuildPrices'
import { cn } from '@/lib/cn'
import { getLocale } from '@/lib/getLocale'
import { getQueryClient } from '@/providers/QueryProvider'
import { buildApiService } from '@/services/build-api/build-api.service'
import { useAuthStore } from '@/stores/useAuth.store'
import type { BuildApi } from '@/types/build-api.type'
import type { Item } from '@/types/item.type'
import { InfoColor, infoColorMap } from '@/types/item.type'
import type { PublicUserBuild } from '@/types/user.type'
import { messageToString } from '@/utils/itemUtils'

interface BuildCardProps {
	build: BuildApi | PublicUserBuild
	artifacts?: Item[]
	armorItems?: Item[]
	containers?: Item[]
	onDelete?: (id: string) => void
}

function getIconUrl(item: Item) {
	return `https://cdn.stalhub.dev/db/icons/${item.category}/${item.id}.png`
}

export function BuildCard({
	build,
	artifacts,
	armorItems,
	containers,
	onDelete,
}: BuildCardProps) {
	const locale = getLocale()
	const t = useTranslations()
	const user = useAuthStore((s) => s.user)
	const queryClient = getQueryClient()

	const starMutation = useMutation({
		mutationFn: () =>
			build.is_starred
				? buildApiService.unstar(build.id)
				: buildApiService.star(build.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['builds'] })
		},
		onError: () => {
			toast.error(t('me.buildCard.toastError'))
		},
	})

	const handleDelete = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		onDelete?.(build.id)
	}

	const author = 'author' in build ? build.author : null
	const stars = build.stars_count

	const isOwner =
		user && author !== null && String(user.id) === String(author.id)

	const handleCopyLink = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		const url = `${window.location.origin}/calcs/builds/lite?build=${build.id}`
		navigator.clipboard.writeText(url)
		toast.success(t('me.buildCard.toastLinkCopied'))
	}

	const handleStar = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (!user) {
			toast.error(t('me.buildCard.toastLoginToStar'))
			return
		}
		starMutation.mutate()
	}

	const armorItem = build.data.armor
		? (armorItems?.find((item) => item.id === build.data.armor?.id) ?? null)
		: null
	const containerItem = build.data.container
		? (containers?.find((item) => item.id === build.data.container?.id) ??
			null)
		: null

	const armorColor = armorItem?.color
		? (infoColorMap[armorItem.color as InfoColor] ??
			infoColorMap[InfoColor.DEFAULT])
		: infoColorMap[InfoColor.DEFAULT]

	const containerColor = containerItem?.color
		? (infoColorMap[containerItem.color as InfoColor] ??
			infoColorMap[InfoColor.DEFAULT])
		: infoColorMap[InfoColor.DEFAULT]

	const artsMap = artifacts ? new Map(artifacts.map((i) => [i.id, i])) : null

	const instanceToArt = new Map(
		build.data.arts.map((a) => [a.instance_id, a])
	)

	const artifactEntries = (build.data.container?.slots ?? [])
		.filter((s): s is string => s !== null)
		.map((instanceId) => {
			const art = instanceToArt.get(instanceId)
			if (!art) return null
			const item = artsMap?.get(art.item_id)
			if (!item) return null
			const color =
				art.quality_class !== undefined
					? (infoColorMap[art.quality_class as InfoColor] ??
						infoColorMap[InfoColor.DEFAULT])
					: infoColorMap[InfoColor.DEFAULT]
			return {
				name: messageToString(item.name, locale),
				color,
				percent: art.percent,
				potential: art.potential,
			}
		})
		.filter(
			(
				e
			): e is {
				name: string
				color: string
				percent: number
				potential: number
			} => e !== null
		)

	const hasPreview = armorItems && containers && artifacts

	return (
		<div
			className={`group relative flex flex-col gap-2 rounded-lg bg-card p-3 transition-colors hover:bg-muted ${
				isOwner && 'border-2 border-primary/40'
			}`}
		>
			<div className="flex items-center justify-between gap-2">
				<Link
					className="w-fit truncate rounded-lg px-2 py-1 font-semibold text-md text-primary transition-colors hover:bg-accent/20"
					href={`/calcs/builds/lite?build=${build.id}`}
				>
					{build.title}
				</Link>
				<div className="flex shrink-0 items-center gap-1">
					<Button
						className="p-2"
						onClick={handleCopyLink}
						variant={'ghost'}
					>
						<Icon
							className="size-3.5 text-text-accent"
							icon="lucide:link"
						/>
					</Button>
					{user && (
						<Button
							className="p-2"
							onClick={handleStar}
							variant={'ghost'}
						>
							<Icon
								className={cn(
									'text-xl',
									build.is_starred && 'text-warning'
								)}
								icon="lucide:star"
							/>
						</Button>
					)}
					{isOwner && onDelete && (
						<Button
							className="p-2 ring-0"
							onClick={handleDelete}
							variant={'danger'}
						>
							<Icon
								className="size-3.5 text-destructive"
								icon="lucide:trash-2"
							/>
						</Button>
					)}
				</div>
			</div>

			{hasPreview && (
				<div className="grid grid-cols-[1fr_auto_1fr] gap-4">
					<div className="flex flex-col items-center gap-4">
						<div className="flex items-center gap-2">
							{armorItem ? (
								<Image
									alt={messageToString(
										armorItem.name,
										locale
									)}
									className="shrink-0"
									height={120}
									src={getIconUrl(armorItem)}
									width={120}
								/>
							) : (
								<Icon
									className="text-lg text-text-accent"
									icon="lucide:shield"
								/>
							)}
						</div>

						<div className="flex items-center">
							{armorItem ? (
								<span
									className="max-w-42 truncate font-semibold"
									style={{ color: armorColor }}
								>
									{messageToString(armorItem.name, locale)}
								</span>
							) : (
								<span className="font-semibold text-text-accent/50">
									{t('me.buildCard.noArmor')}
								</span>
							)}
						</div>
					</div>
					<Divider orientation={'vertical'} />
					<div className="flex flex-col gap-1">
						<div className="flex items-center truncate">
							{containerItem ? (
								<span
									className="truncate font-bold text-[16px]"
									style={{ color: containerColor }}
								>
									{messageToString(
										containerItem.name,
										locale
									)}
								</span>
							) : (
								<span className="text-text-accent/50">
									{t('me.buildCard.noContainer')}
								</span>
							)}
						</div>
						{artifactEntries.length > 0 ? (
							artifactEntries.map((entry, i) => (
								<div
									className="flex items-center gap-1"
									key={entry.name + i}
								>
									<p
										className="min-w-0 flex-1 truncate font-semibold text-sm transition-colors"
										style={{ color: entry.color }}
									>
										{entry.name}
									</p>
									{entry.potential !== 0 && (
										<span
											className={`${montserrat.className} shrink-0 font-medium text-sm transition-colors`}
											style={{ color: entry.color }}
										>
											+{entry.potential}
										</span>
									)}
									<span
										className={`${montserrat.className} shrink-0 font-medium text-sm transition-colors`}
										style={{ color: entry.color }}
									>
										{entry.percent}%
									</span>
								</div>
							))
						) : (
							<span className="text-text-accent/50">
								{t('me.buildCard.noArtifacts')}
							</span>
						)}
					</div>
				</div>
			)}

			<div className="flex items-center gap-2 text-text-accent text-xs">
				{stars > 0 && (
					<div className="flex items-center gap-1">
						<Icon icon="lucide:star" />
						{stars}
					</div>
				)}
				{build.price && (
					<div className="flex items-center gap-1">
						<Icon className="text-lg" icon="lucide:coins" />
						<p className={`${montserrat.className} font-semibold`}>
							{formatArtPrice(build.price)}₽
						</p>
					</div>
				)}
				{author && (
					<HoverUserCard id={author.id}>
						<p
							className={`${montserrat.className} font-semibold text-primary`}
						>
							{author.username}
						</p>
					</HoverUserCard>
				)}
			</div>

			{build.tags.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{build.tags.slice(0, 3).map((tag) => (
						<span
							className="rounded bg-border-secondary px-1.5 py-0.5 font-semibold text-text-accent text-xs"
							key={tag}
						>
							{t(`builds.tags.${tag}`)}
						</span>
					))}
				</div>
			)}
		</div>
	)
}
