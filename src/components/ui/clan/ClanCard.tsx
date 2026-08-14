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
			value: clan.alliance,
		},
		{
			key: 'leader',
			label: 'player.clan.leader',
			icon: 'lucide:crown',
			value: clan.leader,
		},
		{
			key: 'member_count',
			label: 'clan.common.members',
			icon: 'lucide:users',
			value: clan.member_count.toLocaleString(),
		},
	]

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
					<Badge className="shrink-0 bg-green-500/15 font-bold text-green-600 dark:text-green-400">
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
							{TOURNAMENT_DAYS + clan.schedule.brawlsPerWeek} / 7
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
							{clan.schedule.brawlsMandatory
								? t('clans.brawlsMandatory')
								: t('clans.brawlsOptional')}
						</span>
					</div>
				</>
			)}
		</div>
	)
}
