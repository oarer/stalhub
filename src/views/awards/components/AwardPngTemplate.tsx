'use client'

import { Icon } from '@iconify/react'
import { forwardRef } from 'react'
import { mtsExtended, mtsWide, unbounded } from '@/app/fonts'
import { resolveImageUrl } from '@/lib/imageUrl'
import type {
	AwardCampaign,
	AwardCategory,
	AwardNominee,
} from '@/types/awards.type'
import { normalizeUnoFaction } from '@/views/uno/utils/uno.utils'

interface Result {
	votes_count: number
	place: number | null
}

interface Props {
	campaign: AwardCampaign
	category: AwardCategory
	nominee: AwardNominee
	result?: Result
	baseUrl: string
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="min-w-40 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
			<p className="text-[11px] font-medium tracking-[0.2em] text-white/40 uppercase">
				{label}
			</p>
			<p
				className={`${unbounded.className} mt-1.5 truncate text-lg text-white`}
			>
				{value}
			</p>
		</div>
	)
}

export const AwardPngTemplate = forwardRef<HTMLDivElement, Props>(
	function AwardPngTemplate(
		{ campaign, category, nominee, result, baseUrl },
		ref
	) {
		const published = campaign.status === 'published'
		const avatar = resolveImageUrl(nominee.avatar_url)
		const faction =
			category.kind === 'clan'
				? normalizeUnoFaction(nominee.clan_faction)
				: category.kind === 'player'
					? normalizeUnoFaction(nominee.player_alliance)
					: null
		const factionIcon = faction ? `/images/alliance/${faction}.png` : null
		const name = nominee.clan_name ?? nominee.name
		const initial = name.slice(0, 1).toUpperCase()
		const place = result?.place
		const displayUrl = `${baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}/awards`
		const tagline =
			category.description && category.description !== category.title
				? category.description
				: 'Ежегодная премия сообщества StalZone: стримеры, художники и разработчики года.'
		const statusLabel = published
			? place === 1
				? 'Победитель'
				: place
					? `${place} место`
					: 'Участник'
			: 'Идёт голосование'

		return (
			<div
				className="bg-background relative flex h-337.5 w-270 flex-col overflow-hidden p-14 text-white"
				ref={ref}
			>
				<div
					className="pointer-events-none absolute inset-0 opacity-80"
					style={{
						background:
							'radial-gradient(120% 72% at 50% -12%, color-mix(in oklab, var(--primary) 36%, transparent) 0%, transparent 60%)',
					}}
				/>
				<div className="pointer-events-none absolute top-28 -right-32 rotate-12 text-[470px] text-white/3">
					<Icon icon="lucide:trophy" />
				</div>

				<div className="pointer-events-none absolute inset-7 rounded-[44px] border border-white/10" />

				<div className="relative z-10 flex h-full flex-col">
					<header className="flex items-center justify-between gap-6 px-2">
						<span
							className={`${mtsWide.className} text-lg font-medium tracking-[0.28em] text-white/40 uppercase`}
						>
							{campaign.title}
						</span>
						<span
							className={`${mtsWide.className} text-lg tracking-[0.28em] text-white/40 uppercase`}
						>
							stalhub.dev
						</span>
					</header>

					<div className="flex flex-1 flex-col items-center justify-center text-center">
						<div className="relative flex size-90 items-center justify-center">
							{avatar && (
								<>
									{[40, 50, 70].map((blur, i) => (
										<div
											className="absolute inset-0 -z-10 rounded-[64px]"
											key={i}
											style={{
												backgroundImage: `url(${avatar})`,
												backgroundPosition: 'center',
												backgroundSize: 'cover',
												filter: `blur(${blur}px)`,
												transform: `scale(${1 + i * 0.2})`,
											}}
										/>
									))}
								</>
							)}
							<div
								className={`relative flex size-full items-center justify-center overflow-hidden rounded-[64px] ${
									factionIcon
										? 'bg-white/4 ring-white/15'
										: 'bg-primary/15 ring-primary/30'
								} ring-2`}
							>
								{avatar ? (
									<img
										alt=""
										className="size-full object-cover"
										crossOrigin="anonymous"
										src={avatar}
										style={{
											WebkitMaskImage:
												'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 90%)',
											maskImage:
												'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0) 90%)',
											WebkitMaskSize: 'cover',
											maskSize: 'cover',
										}}
									/>
								) : factionIcon ? (
									<img
										alt=""
										className="size-56 object-contain"
										src={factionIcon}
									/>
								) : (
									<span
										className={`${unbounded.className} text-primary text-8xl`}
									>
										{initial}
									</span>
								)}
							</div>
						</div>

						{published ? (
							<div className="mt-10 flex flex-col items-center">
								<span className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold">
									<Icon
										icon={
											place === 1
												? 'lucide:trophy'
												: 'lucide:medal'
										}
									/>
									{statusLabel}
								</span>

								<div className="text-primary/70 mt-6 flex items-center gap-3">
									<span className="h-px w-10 bg-current" />
									<p className="text-xs font-medium tracking-[0.26em] uppercase">
										{category.title}
									</p>
									<span className="h-px w-10 bg-current" />
								</div>

								<h1
									className={`${mtsExtended.className} mt-4 max-w-205 text-[92px] leading-[0.95] font-bold text-balance break-words`}
								>
									{name}
								</h1>

								<p className="mt-6 line-clamp-3 max-w-2xl text-lg leading-relaxed text-white/55">
									{tagline}
								</p>

								<div className="mt-10 flex gap-3">
									<Stat
										label="Голосов"
										value={String(result?.votes_count ?? 0)}
									/>
									{place && (
										<Stat
											label="Место"
											value={String(place)}
										/>
									)}
								</div>
							</div>
						) : (
							<div className="mt-10 flex flex-col items-center">
								<div className="flex items-center gap-3">
									<span className="bg-primary/50 h-px w-9" />
									<span className="text-primary text-base font-semibold tracking-[0.35em] uppercase">
										Голосуй за
									</span>
									<span className="bg-primary/50 h-px w-9" />
								</div>

								<h1
									className={`${mtsExtended.className} mt-4 max-w-[820px] text-[96px] leading-[0.94] font-bold text-balance break-words`}
								>
									{name}
								</h1>

								<div className="mt-7 flex items-center gap-4 text-white/40">
									<span className="h-px w-12 bg-current" />
									<span className="text-sm font-medium tracking-[0.35em] uppercase">
										в номинации
									</span>
									<span className="h-px w-12 bg-current" />
								</div>

								<p
									className={`${unbounded.className} text-primary mt-4 max-w-205 text-5xl text-balance break-words`}
								>
									{category.title}
								</p>

								<div className="mt-12 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-8 py-3.5">
									<Icon
										className="text-primary text-lg"
										icon="lucide:vote"
									/>
									<span
										className={`${unbounded.className} text-lg text-white/80`}
									>
										{displayUrl}
									</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		)
	}
)

export default AwardPngTemplate
