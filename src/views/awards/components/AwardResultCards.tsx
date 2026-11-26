'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { mtsExtended, unbounded } from '@/app/fonts'
import { cn } from '@/lib/cn'
import { resolveImageUrl } from '@/lib/imageUrl'
import { normalizeUnoFaction } from '@/views/uno/utils/uno.utils'

const AVATAR_MASK =
	'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 90%)'

function CardSurface({
	children,
	className,
	hoverClassName,
	onClick,
}: {
	children: ReactNode
	className?: string
	hoverClassName?: string
	onClick?: () => void
}) {
	if (onClick) {
		return (
			<button
				className={cn(className, hoverClassName)}
				onClick={onClick}
				type="button"
			>
				{children}
			</button>
		)
	}

	return <div className={className}>{children}</div>
}

function FactionOrInitial({
	factionIcon,
	initial,
	className,
}: {
	factionIcon: string | null
	initial: string
	className: string
}) {
	if (factionIcon) {
		return (
			<Image
				alt=""
				className={className}
				height={96}
				src={factionIcon}
				width={96}
			/>
		)
	}

	return (
		<span className={`${unbounded.className} text-primary`}>{initial}</span>
	)
}

interface HighlightCardProps {
	avatarUrl?: string | null
	badge: string
	className?: string
	faction?: string | null
	name: string
	onClick?: () => void
	place?: number | null
	showPlace?: boolean
	size?: 'default' | 'compact'
	title: string
	votes?: number
}

export function AwardHighlightCard({
	avatarUrl,
	badge,
	className,
	faction,
	name,
	onClick,
	place,
	showPlace = true,
	size = 'default',
	title,
	votes,
}: HighlightCardProps) {
	const t = useTranslations('awards')
	const compact = size === 'compact'
	const avatar = resolveImageUrl(avatarUrl)
	const normalizedFaction = normalizeUnoFaction(faction)
	const factionIcon = normalizedFaction
		? `/images/alliance/${normalizedFaction}.png`
		: null
	const initial = name.slice(0, 1).toUpperCase()

	return (
		<CardSurface
			className={cn(
				'group from-primary/15 via-card to-card relative flex h-full w-full flex-col overflow-hidden bg-linear-to-b text-left',
				compact
					? 'rounded-2xl p-3 shadow-lg sm:p-4'
					: 'rounded-3xl p-5 shadow-xl sm:p-6',
				className
			)}
			hoverClassName="transition-all hover:bg-primary/5"
			onClick={onClick}
		>
			<div
				className="pointer-events-none absolute inset-0 opacity-70"
				style={{
					background:
						'radial-gradient(120% 72% at 50% -12%, color-mix(in oklab, var(--primary) 36%, transparent) 0%, transparent 60%)',
				}}
			/>

			<div className="relative flex flex-1 flex-col items-center text-center">
				<div
					className={cn(
						'relative flex items-center justify-center',
						compact ? 'size-16 sm:size-20' : 'size-28 sm:size-32'
					)}
				>
					{avatar && (
						<>
							{(compact ? [14, 20] : [24, 32]).map(
								(blur, index) => (
									<div
										className={cn(
											'absolute inset-0',
											compact
												? 'rounded-2xl'
												: 'rounded-[28px]'
										)}
										key={blur}
										style={{
											backgroundImage: `url(${avatar})`,
											backgroundPosition: 'center',
											backgroundSize: 'cover',
											filter: `blur(${blur}px)`,
											transform: `scale(${1 + index * 0.18})`,
										}}
									/>
								)
							)}
						</>
					)}
					<div
						className={cn(
							'relative flex size-full items-center justify-center overflow-hidden ring-2',
							compact ? 'rounded-2xl' : 'rounded-[28px]',
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
								sizes={compact ? '80px' : '128px'}
								src={avatar}
								style={{
									WebkitMaskImage: AVATAR_MASK,
									maskImage: AVATAR_MASK,
									WebkitMaskSize: 'cover',
									maskSize: 'cover',
								}}
							/>
						) : (
							<FactionOrInitial
								className={cn(
									'object-contain',
									compact
										? 'size-2/5 text-2xl'
										: 'size-3/5 text-4xl'
								)}
								factionIcon={factionIcon}
								initial={initial}
							/>
						)}
					</div>
				</div>

				<div className="text-primary/70 z-1 mt-3 flex items-center gap-4">
					<span
						className={cn(
							'h-px bg-current',
							compact ? 'w-4' : 'w-6'
						)}
					/>
					<p
						className={cn(
							'line-clamp-1 font-medium uppercase',
							compact
								? 'text-[9px] tracking-[0.16em]'
								: 'text-[10px] tracking-[0.2em]'
						)}
					>
						{title}
					</p>
					<span
						className={cn(
							'h-px bg-current',
							compact ? 'w-4' : 'w-6'
						)}
					/>
				</div>

				<h3
					className={`${mtsExtended.className} line-clamp-2 font-bold tracking-tight text-balance ${
						compact ? 'mt-1.5 text-base' : 'mt-2 text-2xl'
					}`}
				>
					{name}
				</h3>

				<div
					className={cn(
						'mt-auto flex flex-wrap items-center justify-center',
						compact ? 'gap-1.5 pt-2.5' : 'gap-2 pt-4'
					)}
				>
					<span
						className={cn(
							'border-border/60 bg-background/40 text-muted-foreground border',
							compact
								? 'rounded-lg px-2 py-1 text-[10px]'
								: 'rounded-xl px-3 py-1.5 text-xs'
						)}
					>
						{t('results.votes', { count: votes ?? 0 })}
					</span>
					{place && showPlace ? (
						<span
							className={cn(
								'border-border/60 bg-background/40 text-muted-foreground border',
								compact
									? 'rounded-lg px-2 py-1 text-[10px]'
									: 'rounded-xl px-3 py-1.5 text-xs'
							)}
						>
							{t('results.place', { place })}
						</span>
					) : null}
				</div>
			</div>
		</CardSurface>
	)
}
