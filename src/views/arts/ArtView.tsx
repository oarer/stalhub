'use client'

import { Icon } from '@iconify/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { mtsExtended } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'
import { Divider } from '@/components/ui/Divider'
import HoverUserCard from '@/components/ui/user/HoverUserCard'
import { Gallery } from '@/components/wiki/gallery'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/date'
import { resolveImageUrl } from '@/lib/imageUrl'
import { getQueryClient } from '@/providers/QueryProvider'
import { artQueries } from '@/queries/art/art.queries'
import { artService } from '@/services/art/art.service'
import { useAuthStore } from '@/stores/useAuth.store'
import { ArtType, getArtImages } from '@/types/art.type'
import ArtComments from './ArtComments'

const SOCIAL_ICONS: Record<string, string> = {
	telegram: 'lucide:send',
	discord: 'lucide:message-circle',
	twitter: 'lucide:twitter',
	x: 'prime:twitter',
	youtube: 'lucide:youtube',
	twitch: 'lucide:twitch',
	boosty: 'simple-icons:boosty',
	tiktok: 'simple-icons:tiktok',
}

function socialIcon(network: string) {
	return SOCIAL_ICONS[network.toLowerCase()] ?? 'lucide:link'
}

interface ArtViewProps {
	artId: string
}

export default function ArtView({ artId }: ArtViewProps) {
	const t = useTranslations()
	const { data: art } = useSuspenseQuery(artQueries.get(artId))
	const queryClient = getQueryClient()
	const user = useAuthStore((s) => s.user)
	const [revealed, setRevealed] = useState(false)
	const [downloading, setDownloading] = useState(false)
	const [activeIndex, setActiveIndex] = useState(0)

	const artImages = getArtImages(art)

	const downloadArt = async () => {
		const url = resolveImageUrl(artImages[activeIndex] ?? art.image_url)
		if (!url || downloading) return

		setDownloading(true)
		try {
			const res = await fetch(url)
			const blob = await res.blob()
			const extension =
				blob.type.split('/')[1]?.replace('+xml', '') ?? 'png'
			const objectUrl = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = objectUrl
			link.download = `${art.title}.${extension}`
			document.body.appendChild(link)
			link.click()
			link.remove()
			URL.revokeObjectURL(objectUrl)
		} finally {
			setDownloading(false)
		}
	}

	const starMutation = useMutation({
		mutationFn: () => artService.star(artId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['art', artId] })
		},
	})

	const unstarMutation = useMutation({
		mutationFn: () => artService.unstar(artId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['art', artId] })
		},
	})

	return (
		<section className="mx-auto flex max-w-380 flex-col gap-8 px-4 pt-32 pb-12 md:px-8 xl:pt-36">
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
				<div className="min-w-0 overflow-hidden rounded-xl bg-card ring-2 ring-primary/40">
					{artImages.length > 0 ? (
						<Gallery
							alt={art.title || 'art'}
							blur={art.type === ArtType.NSFW && !revealed}
							className="my-0 border-0"
							images={artImages.map((src) => ({
								src,
								alt: art.title || '',
							}))}
							onIndexChange={setActiveIndex}
							onUnblur={() => setRevealed(true)}
							resolveUrl={(src) => resolveImageUrl(src)}
						/>
					) : (
						<div className="flex aspect-square items-center justify-center">
							<Icon
								className="size-12 text-foreground"
								icon="lucide:image-off"
							/>
						</div>
					)}
				</div>

				<aside className="flex min-w-0 flex-col gap-4">
					<div className="flex items-center justify-between gap-2">
						<div className="flex flex-col gap-0">
							{art.title && (
								<h1
									className={`${mtsExtended.className} min-w-0 font-semibold text-2xl text-primary`}
								>
									{art.title}
								</h1>
							)}
							{art.description && (
								<h2
									className={`min-w-0 font-medium font-mono text-sm`}
								>
									{art.description}
								</h2>
							)}
						</div>
						{art.type === ArtType.NSFW && (
							<Badge variant={'nsfw'}>NSFW</Badge>
						)}
					</div>

					<div className="flex gap-2">
						<CopyButton
							className="p-5"
							text={window.location.href}
							variant={'secondary'}
						/>
						<Button
							className="flex gap-2 rounded-lg p-2.5"
							onClick={downloadArt}
							variant="secondary"
						>
							<Icon
								className="text-xl"
								icon={
									downloading
										? 'lucide:loader-2'
										: 'lucide:image-down'
								}
							/>
						</Button>
						{user && (
							<Button
								className="flex gap-2 rounded-lg p-2.5"
								onClick={() =>
									art.is_starred
										? unstarMutation.mutate()
										: starMutation.mutate()
								}
								variant="secondary"
							>
								<Icon
									className={cn(
										'text-xl',
										art.is_starred && 'text-yellow-400'
									)}
									icon="lucide:star"
								/>
							</Button>
						)}
					</div>

					<div className="flex flex-col gap-2 rounded-xl bg-card p-4 ring-2 ring-primary/40">
						<div className="flex items-center justify-between">
							<span className="font-medium text-foreground text-sm">
								{t('arts.author')}
							</span>
							{art.author.id !== null ? (
								<HoverUserCard id={art.author.id}>
									<span
										className={`cursor-pointer font-medium font-mono text-sm`}
									>
										{art.author.username}
									</span>
								</HoverUserCard>
							) : (
								<span
									className={`font-medium font-mono text-sm`}
								>
									{art.author.name}
								</span>
							)}
						</div>

						<Divider />

						<div className="grid grid-cols-3 gap-4">
							<div>
								<p className="font-medium text-foreground text-xs">
									{t('arts.stars')}
								</p>
								<p
									className={`font-medium font-mono text-foreground text-sm`}
								>
									{art.stars_count}
								</p>
							</div>

							<div>
								<p className="font-medium text-foreground text-xs">
									{t('arts.views')}
								</p>
								<p
									className={`font-medium font-mono text-foreground text-sm`}
								>
									{art.views}
								</p>
							</div>

							<div>
								<p className="font-medium text-foreground text-xs">
									{t('arts.comments.aside')}
								</p>
								<p
									className={`font-medium font-mono text-foreground text-sm`}
								>
									{art.comments_count ?? 0}
								</p>
							</div>

							<div className="col-span-2">
								<p className="font-medium text-foreground text-xs">
									{t('arts.publishedAt')}
								</p>
								<p
									className={`font-medium font-mono text-foreground text-sm`}
								>
									{formatDate(art.created_at)}
								</p>
							</div>
						</div>

						{art.author.social_links &&
							Object.keys(art.author.social_links).length > 0 && (
								<>
									<Divider />
									<div className="flex flex-wrap gap-2">
										{Object.entries(
											art.author.social_links
										).map(([network, url]) => (
											<a
												className="flex items-center gap-1.5 rounded-md bg-card px-2 py-1 font-medium text-xs transition-colors duration-500 hover:bg-border/50"
												href={url}
												key={network}
												rel="noopener noreferrer"
												target="_blank"
											>
												<Icon
													className="text-sm"
													icon={socialIcon(network)}
												/>
												<span className="capitalize">
													{network}
												</span>
											</a>
										))}
									</div>
								</>
							)}
					</div>

					{art.tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{art.tags.map((tag) => (
								<Link
									className="rounded-md bg-border-secondary px-2 py-0.5 font-medium text-foreground text-xs transition-colors hover:text-primary"
									href={`/arts?search=${encodeURIComponent(tag)}`}
									key={tag}
								>
									{tag}
								</Link>
							))}
						</div>
					)}

					<Button
						className="gap-2"
						onClick={() =>
							document
								.getElementById('art-comments')
								?.scrollIntoView({ behavior: 'smooth' })
						}
						variant="secondary"
					>
						<Icon icon="lucide:message-square" />
						<span>{t('arts.readComments')}</span>
					</Button>
				</aside>
			</div>

			<div
				className="flex scroll-mt-28 flex-col gap-4 border-primary border-t pt-6"
				id="art-comments"
			>
				<ArtComments artId={artId} />
			</div>
		</section>
	)
}
