'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { LightBox } from '@/components/ui/LightBox'
import { resolveImageUrl } from '@/lib/imageUrl'
import type { ArtistProfile } from '@/types/commission.type'

type Work = NonNullable<ArtistProfile['portfolio']>[number]

function WorkTile({
	art,
	compact = false,
	aspect = 'aspect-square',
}: {
	art: Work
	compact?: boolean
	aspect?: string
}) {
	const src = resolveImageUrl(art.image_urls[0] || art.image_url) ?? ''
	return (
		<LightBox.Root key={art.external_id}>
			<LightBox.Trigger
				asChild
				className="focus-visible:outline-2 focus-visible:outline-primary"
			>
				<button
					className={`relative ${aspect} w-full cursor-zoom-in overflow-hidden rounded-lg bg-muted`}
					type="button"
				>
					{src && (
						<Image
							alt={art.title ?? ''}
							className={`object-cover ${art.type === 'NSFW' ? 'blur-xl' : ''}`}
							fill
							sizes={
								compact
									? aspect === 'aspect-square'
										? '160px'
										: '(max-width: 768px) 100vw, 320px'
									: '(max-width: 768px) 50vw, 320px'
							}
							src={src}
							unoptimized
						/>
					)}
					{art.type === 'NSFW' && (
						<Badge
							className="absolute inset-x-0 bottom-2 mx-auto w-fit"
							variant="nsfw"
						>
							NSFW
						</Badge>
					)}
				</button>
			</LightBox.Trigger>
			<LightBox.Content alt={art.title ?? ''} src={src} />
		</LightBox.Root>
	)
}

export function ArtistPortfolio({
	artist,
	compact = false,
}: {
	artist: ArtistProfile
	compact?: boolean
}) {
	const arts = artist.portfolio?.slice(0, compact ? 3 : 20) ?? []
	if (!arts.length) return null
	const n = arts.length
	const gridClass = compact
		? `grid gap-1 ${n === 1 ? 'grid-cols-1' : n === 2 ? 'grid-cols-2' : 'grid-cols-3'}`
		: `grid grid-cols-2 gap-3 ${n === 1 || n === 2 ? '' : 'md:grid-cols-3'}`

	const tileClassName = (index: number) => {
		if (compact) return n === 1 ? 'aspect-[3/2]' : 'aspect-square'
		const isLast = index === n - 1
		if (n === 1) {
			return 'col-span-2 aspect-[3/2] md:col-span-3 md:aspect-[2/1]'
		}
		if (!isLast) return 'aspect-square'
		const spans: string[] = []
		const aspects = ['aspect-square']
		if (n % 2 === 1) {
			spans.push('col-span-2')
			aspects[0] = 'aspect-[3/2]'
		}
		if (n % 3 === 2) {
			spans.push('md:col-span-2')
			aspects.push('md:aspect-[3/2]')
		} else if (n % 3 === 1) {
			spans.push('md:col-span-3')
			aspects.push('md:aspect-[2/1]')
		} else if (n % 2 === 1) {
			aspects.push('md:aspect-square')
		}
		return `${aspects.join(' ')} ${spans.join(' ')}`
	}

	return (
		<div className={gridClass}>
			{arts.map((art, index) => (
				<WorkTile
					art={art}
					aspect={tileClassName(index)}
					compact={compact}
					key={art.external_id}
				/>
			))}
		</div>
	)
}
