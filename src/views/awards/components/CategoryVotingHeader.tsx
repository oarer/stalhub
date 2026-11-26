'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { resolveImageUrl } from '@/lib/imageUrl'
import type { AwardCampaignStatus, AwardCategory } from '@/types/awards.type'

export function CategoryVotingHeader({
	category,
	status,
	published,
	hasWinner,
	onNominate,
	onShare,
}: {
	category: AwardCategory
	status: AwardCampaignStatus
	published: boolean
	hasWinner: boolean
	onNominate: () => void
	onShare: () => void
}) {
	const t = useTranslations()
	const selected = category.my_vote_nominee_id
	const selectedCandidate = category.nominees.find((n) => n.id === selected)
	const image = resolveImageUrl(
		category.image_url ?? category.nominees[0]?.avatar_url
	)

	return (
		<div className="border-border/50 flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center">
			<div className="bg-muted ring-primary/40 relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-2">
				{image ? (
					<Image
						alt={category.title}
						className="object-cover"
						fill
						sizes="64px"
						src={image}
					/>
				) : (
					<Icon
						className="text-primary text-3xl"
						icon="lucide:trophy"
					/>
				)}
			</div>
			<div className="flex flex-1 flex-col gap-1">
				<span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">
					{published
						? t('awards.results.resultsTagline')
						: t(`awards.voteForKind.${category.kind}`)}
				</span>
				<h2
					className={`${mtsExtended.className} text-2xl font-semibold tracking-tight`}
				>
					{category.title}
				</h2>
				<p className="text-muted-foreground text-sm">
					{category.description}
				</p>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				{category.kind === 'clan' && status === 'voting' && (
					<Button onClick={onNominate}>
						{t('awards.nominateClan.title')}
					</Button>
				)}
				{(status === 'voting' || status === 'published') && (
					<Button
						className="gap-2"
						onClick={onShare}
						variant="secondary"
					>
						<Icon icon="lucide:image-down" />
						{t('awards.sharePng')}
					</Button>
				)}
				{!published && (
					<Badge
						className="w-fit"
						variant={selected ? 'success' : 'secondary'}
					>
						<Icon
							icon={
								selected
									? 'lucide:circle-check'
									: 'lucide:circle-dashed'
							}
						/>
						{selectedCandidate
							? t('awards.yourVote', {
									name: selectedCandidate.name,
								})
							: t('awards.noVote')}
					</Badge>
				)}
			</div>
		</div>
	)
}
