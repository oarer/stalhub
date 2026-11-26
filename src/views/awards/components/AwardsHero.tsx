'use client'

import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { mtsExtended } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import GradientText from '@/components/ui/GradientText'
import type { AwardCampaign, AwardCampaignStatus } from '@/types/awards.type'
import { Countdown } from './Countdown'

export function AwardsHero({
	campaign,
	status,
	published,
	totalCandidates,
}: {
	campaign: AwardCampaign
	status: AwardCampaignStatus
	published: boolean
	totalCandidates: number
}) {
	const t = useTranslations()

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="relative flex flex-col items-center gap-5 text-center"
			initial={{ opacity: 0, y: 24 }}
			transition={{ duration: 0.6 }}
		>
			<span className="bg-card/70 text-primary ring-primary/30 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ring-2 backdrop-blur">
				<Icon className="text-lg" icon="lucide:trophy" />
				{campaign.title}
			</span>

			<GradientText
				animationSpeed={4}
				className={`${mtsExtended.className} text-4xl font-bold tracking-tight sm:text-6xl`}
				colors={['var(--primary)', '#ffff']}
				yoyo={false}
			>
				<h1>
					{published
						? t('awards.results.resultsTitle')
						: t('awards.heroTitle')}
				</h1>
			</GradientText>

			{!published && (
				<p className="text-muted-foreground max-w-2xl text-sm font-medium text-balance sm:text-base">
					{t('awards.heroTagline')}
				</p>
			)}
			<div className="flex flex-wrap justify-center gap-2">
				<Badge variant="stalhub">
					<Icon icon="lucide:layers" />
					{t('awards.categoriesCount', {
						count: campaign.categories.length,
					})}
				</Badge>
				<Badge variant="secondary">
					<Icon icon="lucide:users" />
					{t('awards.participants', {
						count: totalCandidates,
					})}
				</Badge>
			</div>

			{status === 'voting' && campaign.ends_at && (
				<Countdown
					endsAt={campaign.ends_at}
					serverTime={campaign.server_time}
				/>
			)}
		</motion.div>
	)
}
