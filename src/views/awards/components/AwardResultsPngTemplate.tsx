'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { forwardRef } from 'react'
import { mtsExtended, mtsWide, unbounded } from '@/app/fonts'
import { cn } from '@/lib/cn'
import { resolveImageUrl } from '@/lib/imageUrl'
import type { AwardResultsCategory } from '@/types/awards.type'
import { normalizeUnoFaction } from '@/views/uno/utils/uno.utils'
import {
	getCategoryWinners,
	type RankedNominee,
	rankCategoryNominees,
} from '../utils/award-results'
import { nomineeName } from '../utils/results-presentation'

const AVATAR_MASK =
	'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 90%)'

function Frame({
	campaignTitle,
	children,
	ref,
}: {
	campaignTitle: string
	children: React.ReactNode
	ref: React.Ref<HTMLDivElement>
}) {
	return (
		<div
			className="bg-background relative flex w-270 flex-col gap-4 overflow-hidden p-14 text-white"
			ref={ref}
		>
			<div
				className="pointer-events-none absolute inset-0 opacity-80"
				style={{
					background:
						'radial-gradient(120% 72% at 50% -12%, color-mix(in oklab, var(--primary) 36%, transparent) 0%, transparent 60%)',
				}}
			/>
			<div className="pointer-events-none absolute -right-24 -bottom-24 rotate-12 text-[420px] text-white/3">
				<Icon icon="lucide:trophy" />
			</div>
			<div className="pointer-events-none absolute inset-7 rounded-[44px] border border-white/10" />

			<div className="relative z-10 flex h-full flex-col">
				<header className="flex items-center justify-between gap-6 px-2">
					<span
						className={`${mtsWide.className} text-lg font-medium tracking-[0.28em] text-white/40 uppercase`}
					>
						{campaignTitle}
					</span>
					<span
						className={`${mtsWide.className} text-lg tracking-[0.28em] text-white/40 uppercase`}
					>
						stalhub.dev
					</span>
				</header>
				{children}
			</div>
		</div>
	)
}

function ResultAvatar({
	avatar,
	faction,
	name,
	compact,
}: {
	avatar?: string | null
	faction?: string | null
	name: string
	compact?: boolean
}) {
	const image = resolveImageUrl(avatar)
	const normalizedFaction = normalizeUnoFaction(faction)
	const factionIcon = normalizedFaction
		? `/images/alliance/${normalizedFaction}.png`
		: null
	const initial = name.slice(0, 1).toUpperCase()

	return (
		<div
			className={cn(
				'relative flex shrink-0 items-center justify-center',
				compact ? 'size-14' : 'size-28'
			)}
		>
			{image && (
				<>
					{(compact ? [12, 18] : [24, 32]).map((blur, index) => (
						<div
							className={cn(
								'absolute inset-0',
								compact ? 'rounded-2xl' : 'rounded-[28px]'
							)}
							key={blur}
							style={{
								backgroundImage: `url(${image})`,
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
					'relative flex size-full items-center justify-center overflow-hidden ring-2',
					compact ? 'rounded-2xl' : 'rounded-[28px]',
					factionIcon
						? 'bg-white/4 ring-white/15'
						: 'bg-primary/15 ring-primary/30'
				)}
			>
				{image ? (
					<img
						alt=""
						className="size-full object-cover"
						crossOrigin="anonymous"
						src={image}
						style={{
							WebkitMaskImage: AVATAR_MASK,
							maskImage: AVATAR_MASK,
							WebkitMaskSize: 'cover',
							maskSize: 'cover',
						}}
					/>
				) : factionIcon ? (
					<img
						alt=""
						className={cn(
							'object-contain',
							compact ? 'size-2/5' : 'size-3/5'
						)}
						crossOrigin="anonymous"
						src={factionIcon}
					/>
				) : (
					<span
						className={cn(
							unbounded.className,
							'text-primary',
							compact ? 'text-2xl' : 'text-4xl'
						)}
					>
						{initial}
					</span>
				)}
			</div>
		</div>
	)
}

interface ResultCardProps {
	avatarUrl?: string | null
	badge: string
	faction?: string | null
	name: string
	place?: number | null
	size?: 'large' | 'compact'
	title: string
	votes?: number
}

function ResultCard({
	avatarUrl,
	badge,
	faction,
	name,
	place,
	size = 'large',
	title,
	votes,
}: ResultCardProps) {
	const t = useTranslations('awards')
	const compact = size === 'compact'

	return (
		<div
			className={cn(
				'relative flex h-full w-full flex-col overflow-hidden border border-white/10 bg-white/5 text-center',
				compact ? 'rounded-2xl p-3' : 'rounded-3xl p-5'
			)}
		>
			<div
				className="pointer-events-none absolute inset-0 opacity-70"
				style={{
					background:
						'radial-gradient(120% 72% at 50% -12%, color-mix(in oklab, var(--primary) 36%, transparent) 0%, transparent 60%)',
				}}
			/>
			<div className="relative flex flex-1 flex-col items-center">
				<ResultAvatar
					avatar={avatarUrl}
					compact={compact}
					faction={faction}
					name={name}
				/>

				<span
					className={cn(
						'bg-primary text-primary-foreground z-1 inline-flex items-center rounded-full font-semibold',
						compact
							? 'mt-2.5 gap-1 px-2 py-0.5 text-[10px]'
							: 'mt-4 gap-1.5 px-3 py-1 text-xs'
					)}
				>
					<Icon
						icon={place === 1 ? 'lucide:trophy' : 'lucide:medal'}
					/>
					{badge}
				</span>

				<div
					className={cn(
						'text-primary/70 flex items-center',
						compact ? 'mt-2 gap-1.5' : 'mt-3 gap-2'
					)}
				>
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
					className={cn(
						mtsExtended.className,
						'line-clamp-2 font-bold tracking-tight text-balance',
						compact ? 'mt-1.5 text-base' : 'mt-2 text-2xl'
					)}
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
							'border border-white/10 bg-white/5 text-white/55',
							compact
								? 'rounded-lg px-2 py-1 text-[10px]'
								: 'rounded-xl px-3 py-1.5 text-xs'
						)}
					>
						{t('results.votes', { count: votes ?? 0 })}
					</span>
					{place ? (
						<span
							className={cn(
								'border border-white/10 bg-white/5 text-white/55',
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
		</div>
	)
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-xs font-semibold tracking-[0.2em] text-white/40 uppercase">
			{children}
		</p>
	)
}

function Footer({ year, baseUrl }: { year: number; baseUrl: string }) {
	const displayUrl = `${baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}/awards`

	return (
		<footer className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/35">
			<span className={unbounded.className}>{year}</span>
			<span className={unbounded.className}>{displayUrl}</span>
		</footer>
	)
}

export interface AwardCategoryResultsPngProps {
	campaignTitle: string
	year: number
	category: AwardResultsCategory
	baseUrl: string
}

export const AwardCategoryResultsPngTemplate = forwardRef<
	HTMLDivElement,
	AwardCategoryResultsPngProps
>(function AwardCategoryResultsPngTemplate(
	{ campaignTitle, year, category, baseUrl },
	ref
) {
	const t = useTranslations('awards')
	const ranked = rankCategoryNominees(category, category.nominees.length)
	const winnerIds = new Set(
		getCategoryWinners(category).map((nominee) => nominee.id)
	)
	const tie = winnerIds.size > 1
	const top = ranked.slice(0, 3)
	const rest = ranked.slice(3)
	const cardProps = (nominee: RankedNominee) => {
		const winner = winnerIds.has(nominee.id) || nominee.rank === 1

		return {
			avatarUrl: nominee.avatar_url,
			badge: winner
				? tie
					? t('results.tie')
					: t('results.winner')
				: t('results.place', { place: nominee.rank }),
			faction:
				category.kind === 'clan'
					? nominee.clan_faction
					: category.kind === 'player'
						? nominee.player_alliance
						: null,
			name: nomineeName(nominee),
			place: nominee.rank,
			title: category.title,
			votes: nominee.votes_count,
		}
	}

	return (
		<Frame campaignTitle={campaignTitle} ref={ref}>
			<h1
				className={`${mtsExtended.className} mt-4 line-clamp-2 max-w-235 text-[56px] font-bold text-balance`}
			>
				{category.title}
			</h1>

			{ranked.length === 0 ? (
				<p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/50">
					{t('results.noWinner')}
				</p>
			) : (
				<>
					<div className="mt-2 flex flex-wrap gap-4">
						{top.map((nominee) => (
							<div
								className="min-w-0 grow basis-64"
								key={nominee.id}
							>
								<ResultCard {...cardProps(nominee)} />
							</div>
						))}
					</div>

					{rest.length > 0 && (
						<div className="mt-7 mb-4 flex flex-col gap-3">
							<SectionLabel>
								{t('results.otherPlaces')}
							</SectionLabel>
							<div className="flex flex-wrap gap-3">
								{rest.map((nominee) => (
									<div
										className="min-w-0 grow basis-56"
										key={nominee.id}
									>
										<ResultCard
											size="compact"
											{...cardProps(nominee)}
										/>
									</div>
								))}
							</div>
						</div>
					)}
				</>
			)}

			<Footer baseUrl={baseUrl} year={year} />
		</Frame>
	)
})

export interface AwardOverallResultsPngProps {
	campaignTitle: string
	year: number
	categories: AwardResultsCategory[]
	baseUrl: string
}

export const AwardOverallResultsPngTemplate = forwardRef<
	HTMLDivElement,
	AwardOverallResultsPngProps
>(function AwardOverallResultsPngTemplate(
	{ campaignTitle, year, categories, baseUrl },
	ref
) {
	const t = useTranslations('awards')
	const featured = categories.slice(0, 3)
	const rest = categories.slice(3)
	const cardProps = (category: AwardResultsCategory) => {
		const winners = getCategoryWinners(category)
		const winner = winners[0]

		return {
			avatarUrl: winner?.avatar_url ?? category.image_url,
			badge:
				winners.length > 1
					? t('results.tie')
					: winners.length > 0
						? t('results.winner')
						: t('results.title'),
			faction:
				category.kind === 'clan'
					? winner?.clan_faction
					: category.kind === 'player'
						? winner?.player_alliance
						: null,
			name:
				winners.length > 1
					? t('results.tie')
					: winners.length === 1
						? nomineeName(winners[0])
						: t('results.noWinner'),
			place: winner?.rank ?? null,
			title: category.title,
			votes: winners.reduce(
				(sum, nominee) => sum + nominee.votes_count,
				0
			),
		}
	}

	return (
		<Frame campaignTitle={campaignTitle} ref={ref}>
			<h1
				className={`${mtsExtended.className} mt-4 text-[56px] font-bold text-balance`}
			>
				{t('results.overall')}
			</h1>

			<div className="mt-7 flex flex-wrap gap-4">
				{featured.map((category) => (
					<div className="min-w-0 grow basis-64" key={category.id}>
						<ResultCard {...cardProps(category)} />
					</div>
				))}
			</div>

			{rest.length > 0 && (
				<div className="mt-7 mb-4 flex flex-col gap-3">
					<SectionLabel>{t('otherCategories')}</SectionLabel>
					<div className="flex flex-wrap gap-3">
						{rest.map((category) => (
							<div
								className="min-w-0 grow basis-56"
								key={category.id}
							>
								<ResultCard
									size="compact"
									{...cardProps(category)}
								/>
							</div>
						))}
					</div>
				</div>
			)}

			<Footer baseUrl={baseUrl} year={year} />
		</Frame>
	)
})
