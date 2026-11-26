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
import { SocialLinks } from '@/components/ui/user/SocialLinks'
import Username from '@/components/ui/user/Username'
import { Gallery } from '@/components/wiki/gallery'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/date'
import { resolveImageUrl } from '@/lib/imageUrl'
import { getQueryClient } from '@/providers/QueryProvider'
import { artQueries } from '@/queries/art/art.queries'
import { artService } from '@/services/art/art.service'
import { useAuthStore } from '@/stores/useAuth.store'
import { ArtType, getArtImages } from '@/types/art.type'
import ArtistOrderLink from '@/views/commissions/components/ArtistOrderLink'
import ArtComments from './ArtComments'

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
	const [pageUrl] = useState(() =>
		typeof window === 'undefined' ? '' : window.location.href
	)

	const artImages = getArtImages(art)

	const downloadArt = async () => {
		const url = resolveImageUrl(artImages[activeIndex] ?? art.image_url)
		if (!url || downloading) return

		setDownloading(true)
		try {
			const res = await fetch(url)
			if (!res.ok) return
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
				<div className="bg-card ring-primary/40 min-w-0 overflow-hidden rounded-xl ring-2">
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
								className="text-foreground size-12"
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
									className={`${mtsExtended.className} text-primary min-w-0 text-2xl font-semibold`}
								>
									{art.title}
								</h1>
							)}
							{art.description && (
								<h2
									className={`min-w-0 font-mono text-sm font-medium`}
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
							text={pageUrl}
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

					{art.author.id !== null && art.author.username && (
						<ArtistOrderLink username={art.author.username} />
					)}
					<div className="bg-card ring-primary/40 flex flex-col gap-2 rounded-xl p-4 ring-2">
						<div className="flex items-center justify-between">
							<span className="text-foreground text-sm font-medium">
								{t('arts.author')}
							</span>
							{art.author.id !== null ? (
								<HoverUserCard id={art.author.id}>
									<Username
										className={`cursor-pointer font-mono text-sm font-medium`}
										user={art.author}
									/>
								</HoverUserCard>
							) : (
								<Username
									className={`font-mono text-sm font-medium`}
									user={art.author}
								/>
							)}
						</div>

						<Divider />

						<div className="grid grid-cols-3 gap-4">
							<div>
								<p className="text-foreground text-xs font-medium">
									{t('arts.stars')}
								</p>
								<p
									className={`text-foreground font-mono text-sm font-medium`}
								>
									{art.stars_count}
								</p>
							</div>

							<div>
								<p className="text-foreground text-xs font-medium">
									{t('arts.views')}
								</p>
								<p
									className={`text-foreground font-mono text-sm font-medium`}
								>
									{art.views}
								</p>
							</div>

							<div>
								<p className="text-foreground text-xs font-medium">
									{t('arts.comments.aside')}
								</p>
								<p
									className={`text-foreground font-mono text-sm font-medium`}
								>
									{art.comments_count ?? 0}
								</p>
							</div>

							<div className="col-span-2">
								<p className="text-foreground text-xs font-medium">
									{t('arts.publishedAt')}
								</p>
								<p
									className={`text-foreground font-mono text-sm font-medium`}
								>
									{formatDate(art.created_at)}
								</p>
							</div>
						</div>

						<SocialLinks
							links={art.author.social_links}
							withDivider
						/>
					</div>

					{art.tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{art.tags.map((tag) => (
								<Link
									className="bg-border-secondary text-foreground hover:text-primary rounded-md px-2 py-0.5 text-xs font-medium transition-colors"
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
				className="border-primary flex scroll-mt-28 flex-col gap-4 border-t pt-6"
				id="art-comments"
			>
				<ArtComments artId={artId} />
			</div>
		</section>
	)
}
