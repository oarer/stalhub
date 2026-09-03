'use client'

import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { montserrat, unbounded } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/cn'
import { isVideoUrl, resolveImageUrl } from '@/lib/imageUrl'
import { artQueries } from '@/queries/art/art.queries'
import { ArtType } from '@/types/art.type'

export default function ArtsView() {
	const t = useTranslations()
	const [page, setPage] = useState(1)
	const [search, setSearch] = useState('')
	const [type, setType] = useState<ArtType | ''>('')
	const debouncedSearch = useDebounce(search, 300)
	const take = 24

	const tags = debouncedSearch
		? debouncedSearch
				.split(/[,\s]+/)
				.map((s) => s.trim())
				.filter(Boolean)
		: undefined

	const { data, isPending, isPlaceholderData } = useQuery(
		artQueries.publicList({ take, page, tags, type: type || undefined })
	)

	const arts = data?.data ?? []
	const totalPages = data ? Math.ceil(data.total_count / take) : 1

	return (
		<section className="mx-auto max-w-380 space-y-6 px-4 pt-32 pb-12 sm:px-6">
			<div className="flex items-center justify-between">
				<h1 className={`${unbounded.className} font-bold text-3xl`}>
					{t('arts.title')}
				</h1>
				<span className="font-semibold text-sm text-text-accent">
					{t('arts.total', { count: data?.total_count ?? 0 })}
				</span>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<Input
					className="w-full max-w-lg"
					label="arts.search"
					onChange={(e) => {
						setSearch(e.target.value)
						setPage(1)
					}}
					value={search}
				/>

				<div className="flex gap-1">
					<Button
						className="font-semibold"
						onClick={() => {
							setType('')
							setPage(1)
						}}
						size="sm"
						variant={type === '' ? 'secondary' : 'ghost'}
					>
						{t('arts.all')}
					</Button>
					<Button
						className="font-semibold"
						onClick={() => {
							setType(type === ArtType.NSFW ? '' : ArtType.NSFW)
							setPage(1)
						}}
						size="sm"
						variant={type === ArtType.NSFW ? 'secondary' : 'ghost'}
					>
						NSFW
					</Button>
				</div>
			</div>

			{isPending ? (
				<div className="columns-2 gap-3 sm:columns-4">
					{Array.from({ length: take }).map((_, i) => (
						<div
							className="mb-3 aspect-square animate-pulse rounded-lg bg-card"
							key={i}
						/>
					))}
				</div>
			) : arts.length === 0 ? (
				<div className="flex flex-col items-center gap-3 py-16">
					<Icon
						className="size-10 text-text-accent"
						icon="lucide:image"
					/>
					<p className="font-semibold text-sm text-text-accent">
						{t('arts.empty')}
					</p>
				</div>
			) : (
				<div
					className={cn(
						'columns-2 gap-3 sm:columns-3 lg:columns-4',
						isPlaceholderData && 'opacity-60'
					)}
				>
					{arts.map((art) => (
						<Link
							className="group relative mb-3 block cursor-pointer break-inside-avoid overflow-hidden rounded-lg bg-card ring-2 ring-primary/30 duration-200 hover:ring-primary/70"
							href={`/arts/${art.id}`}
							key={art.id}
						>
							{art.type === ArtType.NSFW && (
								<Badge
									className="absolute top-2 right-2 z-2"
									variant={'nsfw'}
								>
									NSFW
								</Badge>
							)}
							{art.image_url ? (
								isVideoUrl(art.image_url) ? (
									<>
										<video
											className={cn(
												'h-auto w-full transition-all duration-400',
												art.type === ArtType.NSFW &&
													'blur-xl hover:blur-none'
											)}
											muted
											playsInline
											preload="metadata"
											src={
												resolveImageUrl(
													art.image_url
												) ?? ''
											}
										/>
										<Icon
											className="absolute top-1/2 left-1/2 z-2 size-10 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-md"
											icon="lucide:play"
										/>
									</>
								) : (
									<Image
										alt={art.title || 'none'}
										className={cn(
											'h-auto w-full transition-all duration-400',
											art.type === ArtType.NSFW &&
												'blur-xl hover:blur-none'
										)}
										height={1600}
										src={
											resolveImageUrl(art.image_url) ?? ''
										}
										unoptimized
										width={1200}
									/>
								)
							) : (
								<div className="flex aspect-square w-full items-center justify-center">
									<Icon
										className="size-10 text-text-accent"
										icon="lucide:image-off"
									/>
								</div>
							)}
							<div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-linear-to-t from-black/70 to-transparent px-3 pt-8 pb-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
								<span className="truncate font-semibold text-sm text-white">
									{art.title}
								</span>
								{art.stars_count > 0 && (
									<span className="flex shrink-0 items-center gap-1 text-sm text-white">
										<Icon icon="lucide:star" />
										{art.stars_count}
									</span>
								)}
							</div>
						</Link>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						disabled={page <= 1}
						onClick={() => setPage((p) => p - 1)}
						size="sm"
						variant="outline"
					>
						<Icon icon="lucide:chevron-left" />
					</Button>
					<span
						className={`${montserrat.className} text-foreground text-sm`}
					>
						{page} / {totalPages}
					</span>
					<Button
						disabled={page >= totalPages}
						onClick={() => setPage((p) => p + 1)}
						size="sm"
						variant="outline"
					>
						<Icon icon="lucide:chevron-right" />
					</Button>
				</div>
			)}
		</section>
	)
}
