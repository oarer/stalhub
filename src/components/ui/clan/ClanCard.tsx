'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { montserrat } from '@/app/fonts'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import type { PublicClan } from '@/types/clan/clan.type'
import { TOURNAMENT_DAYS } from '@/types/clan/clan.type'
import { allianceBackground } from '@/types/user.type'

interface ClanCardProps {
	clan: PublicClan
	className?: string
}

export default function ClanCard({ clan, className }: ClanCardProps) {
	const t = useTranslations()

	const infoFields = [
		{
			key: 'alliance',
			label: 'clans.faction',
			icon: 'lucide:flag',
			value: t(`player.alliance.${clan.alliance}`),
		},
		{
			key: 'leader',
			label: 'player.clan.leader',
			icon: 'lucide:crown',
			value: clan.leader,
		},
		{
			key: 'memberCount',
			label: 'clan.common.members',
			icon: 'lucide:users',
			value: clan.member_count.toLocaleString(),
		},
		{
			key: 'boostMode',
			label: 'clan.boosts.shortTitle',
			icon: 'lucide:flask-conical',
			value: clan.boost_mode === 'ISSUED' ? t('clan.boosts.modeIssued') : t('clan.boosts.modeSelf'),
		},
		{
			key: 'grenadeMode',
			label: 'clan.grenades.shortTitle',
			icon: 'lucide:bomb',
			value: clan.grenade_mode === 'ISSUED' ? t('clan.grenades.modeIssued') : t('clan.grenades.modeSelf'),
		},
	]
	const recruitmentFields = clan.recruiting
		? [
				{
					key: 'leaderDiscord',
					label: 'clans.leaderDiscord',
					icon: 'lucide:message-circle',
					value: clan.leader_discord,
				},
				...(clan.clan_discord
					? [
							{
								key: 'clanDiscord',
								label: 'clans.clanDiscord',
								icon: 'lucide:messages-square',
								value: clan.clan_discord,
							},
						]
					: []),
				{
					key: 'paidRecruitment',
					label: 'clans.paidRecruitment',
					icon: 'lucide:badge-dollar-sign',
					value: clan.paid_recruitment
						? t('clans.paidRecruitmentYes')
						: t('clans.paidRecruitmentNo'),
				},
				{
					key: 'tier',
					label: 'clans.tier',
					icon: 'lucide:shield',
					value: clan.tier,
				},
				...(clan.guilds_per_week !== null
					? [
							{
								key: 'guildsPerWeek',
								label: 'clans.guildsPerWeek',
								icon: 'lucide:circle-dollar-sign',
								value: clan.guilds_per_week,
							},
						]
					: []),
			]
		: []

	return (
		<div
			className={cn(
				'flex w-full flex-col gap-3 rounded-xl px-4 py-5',
				allianceBackground[clan.alliance],
				className
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<p
					className={`${montserrat.className} truncate font-semibold text-md`}
				>
					[{clan.tag}] {clan.name}
				</p>
				{clan.recruiting && (
					<Badge className="shrink-0 bg-success/15 font-bold text-success">
						{t('clans.recruiting')}
					</Badge>
				)}
			</div>

			<div className="flex flex-col gap-2 text-sm">
				{infoFields.map((field) => (
					<div className="flex items-center gap-1.5" key={field.key}>
						<Icon
							className="size-4 shrink-0 text-text-accent"
							icon={field.icon}
						/>
						<span className="font-semibold text-text-accent">
							{t(field.label)}:
						</span>
						<span
							className={`${montserrat.className} truncate font-semibold`}
						>
							{field.value}
						</span>
					</div>
				))}
			</div>

			{recruitmentFields.length > 0 && (
				<div className="flex flex-col gap-2 border-border-secondary border-t pt-3 text-sm">
					{recruitmentFields.map((field) => (
						<div className="flex items-center gap-1.5" key={field.key}>
							<Icon
								className="size-4 shrink-0 text-text-accent"
								icon={field.icon}
							/>
							<span className="font-semibold text-text-accent">
								{t(field.label)}:
							</span>
							<span className={`${montserrat.className} truncate font-semibold`}>
								{field.value}
							</span>
						</div>
					))}
				</div>
			)}

			{clan.schedule && (
				<>
					<div className="flex items-center gap-1.5 text-sm">
						<Icon
							className="size-4 shrink-0 text-text-accent"
							icon="lucide:calendar-days"
						/>
						<span className="font-semibold text-text-accent">
							{t('clans.schedule')}
						</span>
						<span
							className={`${montserrat.className} truncate font-semibold`}
						>
							{TOURNAMENT_DAYS + clan.schedule.brawls_per_week} / 7
						</span>
					</div>
					<div className="flex items-center gap-1.5 text-sm">
						<Icon
							className="size-4 shrink-0 text-text-accent"
							icon="lucide:calendar-days"
						/>
						<span className="font-semibold text-text-accent">
							{t('clans.brawls')}
						</span>
						<span
							className={`${montserrat.className} truncate font-semibold`}
						>
							{clan.schedule.brawls_mandatory
								? t('clans.brawls_mandatory')
								: t('clans.brawlsOptional')}
						</span>
					</div>
				</>
			)}
		</div>
	)
}
