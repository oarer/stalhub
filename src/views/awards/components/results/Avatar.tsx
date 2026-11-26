'use client'

import Image from 'next/image'
import { unbounded } from '@/app/fonts'
import { cn } from '@/lib/cn'
import { resolveImageUrl } from '@/lib/imageUrl'
import type { AwardResultsCategory } from '@/types/awards.type'
import { normalizeUnoFaction } from '@/views/uno/utils/uno.utils'
import type { RankedNominee } from '../../utils/award-results'
import { nomineeName } from '../../utils/results-presentation'

const BLUR_LAYERS = [18, 26, 34]
const PLACEHOLDER_AVATAR = '/images/avatars/oarer.jpg'
const AVATAR_MASK =
	'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 90%)'

export function Avatar({
	nominee,
	category,
	className,
}: {
	nominee: RankedNominee
	category: AwardResultsCategory
	className?: string
}) {
	const name = nomineeName(nominee)
	const initial = name.slice(0, 1).toUpperCase()
	const faction =
		category.kind === 'clan'
			? normalizeUnoFaction(nominee.clan_faction)
			: category.kind === 'player'
				? normalizeUnoFaction(nominee.player_alliance)
				: null
	const factionIcon = faction ? `/images/alliance/${faction}.png` : null
	const avatar =
		resolveImageUrl(nominee.avatar_url) ??
		(factionIcon ? null : PLACEHOLDER_AVATAR)

	return (
		<div
			className={cn(
				'relative isolate flex size-40 shrink-0 items-center justify-center sm:size-48',
				className
			)}
		>
			{avatar && (
				<>
					{BLUR_LAYERS.map((blur, index) => (
						<div
							className="absolute inset-0 rounded-[40px]"
							key={blur}
							style={{
								backgroundImage: `url(${avatar})`,
								backgroundPosition: 'center',
								backgroundSize: 'cover',
								filter: `blur(${blur}px)`,
								transform: `scale(${1 + index * 0.18})`,
							}}
						/>
					))}
				</>
			)}
			<div
				className={cn(
					'relative flex size-full items-center justify-center overflow-hidden rounded-[40px] ring-2',
					factionIcon
						? 'bg-white/4 ring-white/15'
						: 'bg-primary/15 ring-primary/30'
				)}
			>
				{avatar ? (
					<Image
						alt={name}
						className="size-full object-cover"
						fill
						sizes="192px"
						src={avatar}
						style={{
							WebkitMaskImage: AVATAR_MASK,
							maskImage: AVATAR_MASK,
							WebkitMaskSize: 'cover',
							maskSize: 'cover',
						}}
					/>
				) : factionIcon ? (
					<Image
						alt=""
						className="size-3/5 object-contain"
						height={224}
						src={factionIcon}
						width={224}
					/>
				) : (
					<span
						className={`${unbounded.className} text-primary text-5xl`}
					>
						{initial}
					</span>
				)}
			</div>
		</div>
	)
}
