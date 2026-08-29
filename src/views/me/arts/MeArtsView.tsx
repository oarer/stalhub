'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CLink } from '@/components/ui/Link'
import { toast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/date'
import { resolveImageUrl } from '@/lib/imageUrl'
import { getQueryClient } from '@/providers/QueryProvider'
import { artQueries } from '@/queries/art/art.queries'
import { artService } from '@/services/art/art.service'
import { ArtType } from '@/types/art.type'

export default function MeArtsView() {
	const queryClient = getQueryClient()
	const t = useTranslations()
	const [filter, setFilter] = useState<ArtType | 'ALL'>('ALL')

	const { data: arts } = useSuspenseQuery(artQueries.mine({ take: 50 }))

	const filteredArts =
		filter === 'ALL'
			? arts?.data
			: arts?.data.filter((a) => a.type === filter)

	const deleteMutation = useMutation({
		mutationFn: (id: string) => artService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['arts'] })
			toast.success(t('me.arts.toastDeleted'))
		},
		onError: () => {
			toast.error(t('me.arts.toastDeleteError'))
		},
	})

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h1 className="font-semibold text-xl">
						{t('me.arts.title')}
					</h1>
					{arts?.total_count != null && (
						<span className="text-sm text-text-accent">
							{arts.total_count}
						</span>
					)}
				</div>
				<Link
					className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow-md transition-all hover:brightness-120"
					href="/me/arts/new"
				>
					<Icon className="size-4" icon="lucide:plus" />
					<p className="font-semibold">{t('me.arts.create')}</p>
				</Link>
			</div>

			<div className="flex flex-wrap gap-1.5">
				<Button
					className={cn(
						filter === 'ALL' && 'bg-accent text-text',
						'font-semibold'
					)}
					onClick={() => setFilter('ALL')}
					size={'sm'}
					variant={'ghost'}
				>
					{t('me.arts.all')}
				</Button>
				{[ArtType.DEFAULT, ArtType.NSFW].map((type) => (
					<Button
						className={cn(
							filter === type && 'bg-accent text-text',
							'font-semibold'
						)}
						key={type}
						onClick={() => setFilter(type)}
						size={'sm'}
						variant={'ghost'}
					>
						{type}
					</Button>
				))}
			</div>

			{!filteredArts || filteredArts.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-16">
					<Icon
						className="size-10 text-text-accent"
						icon="lucide:palette"
					/>
					<p className="font-semibold text-sm text-text-accent">
						{t('me.arts.noArts')}
					</p>
					<CLink
						className="gap-2"
						href="/me/arts/new"
						variant={'primary'}
					>
						<Icon className="size-4" icon="lucide:plus" />
						<p className="font-semibold">
							{t('me.arts.createFirst')}
						</p>
					</CLink>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-2">
					{filteredArts.map((art) => (
						<div
							className="flex items-center gap-3 rounded-lg bg-card px-3 py-2 ring-2 ring-primary/30"
							key={art.id}
						>
							{art.image_url ? (
								<Image
									alt={art.title}
									className={cn(
										'h-14 w-14 rounded-md object-cover',
										art.type === ArtType.NSFW && 'blur-lg'
									)}
									height={56}
									src={resolveImageUrl(art.image_url) ?? ''}
									unoptimized
									width={56}
								/>
							) : (
								<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-border-secondary">
									<Icon
										className="size-5 text-text-accent"
										icon="lucide:image-off"
									/>
								</div>
							)}

							<div className="flex min-w-0 flex-1 flex-col gap-0.5">
								<div className="flex items-center gap-2">
									<span className="truncate font-semibold">
										{art.title}
									</span>
									{art.type === ArtType.NSFW && (
										<Badge variant={'nsfw'}>NSFW</Badge>
									)}
								</div>
								<span
									className={`${montserrat.className} font-semibold text-text-accent text-xs`}
								>
									{formatDate(art.created_at, 'date')}
								</span>
								{art.tags.length > 0 && (
									<div className="flex flex-wrap gap-1">
										{art.tags.map((tag) => (
											<span
												className="rounded bg-border-secondary px-1.5 py-0.5 font-semibold text-text-accent text-xs"
												key={tag}
											>
												{tag}
											</span>
										))}
									</div>
								)}
							</div>

							<div className="flex shrink-0 items-center gap-1">
								<Link href={`/arts/${art.id}`}>
									<Button size="sm" variant="ghost">
										<Icon
											className="size-4"
											icon="lucide:external-link"
										/>
									</Button>
								</Link>
								<Link href={`/me/arts/${art.id}/edit`}>
									<Button size="sm" variant="ghost">
										<Icon
											className="size-4"
											icon="lucide:pencil"
										/>
									</Button>
								</Link>
								<Button
									onClick={() =>
										deleteMutation.mutate(art.id)
									}
									size="sm"
									variant="danger"
								>
									<Icon
										className="size-4"
										icon="lucide:trash-2"
									/>
								</Button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
