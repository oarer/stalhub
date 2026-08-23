'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { forwardRef } from 'react'
import { montserrat, unbounded } from '@/app/fonts'
import type { ClanSquad, ClanSquadMember } from '@/types/clan/clan.type'

interface SquadPngTemplateProps {
	squads: ClanSquad[]
	absentUserIds: Set<number>
	mapLabel: string
}

export const SquadPngTemplate = forwardRef<
	HTMLDivElement,
	SquadPngTemplateProps
>(function SquadPngTemplate({ squads, absentUserIds, mapLabel }, ref) {
	const t = useTranslations()

	return (
		<div className="w-7xl bg-card p-8 text-white" ref={ref}>
			<h1
				className={`${unbounded.className} font-bold text-2xl text-primary uppercase tracking-[3]`}
			>
				stalhub.dev
			</h1>
			<header className="mb-6 flex items-center justify-between gap-8">
				<h2
					className={`${unbounded.className} max-w-160 text-3xl text-destructive`}
				>
					{t('clan.squads.png.title', { map: mapLabel })}
				</h2>
				<div className="flex gap-4">
					<div
						className={`${montserrat.className} rounded-lg bg-card px-4 py-1 text-right`}
					>
						<p className="font-semibold text-text-accent text-xs">
							{t('clan.squads.png.squadCount')}
						</p>
						<p className="font-bold text-lg text-primary">
							{squads.length}
						</p>
					</div>
					<div
						className={`${montserrat.className} rounded-lg bg-card px-4 py-1 text-right`}
					>
						<p className="font-semibold text-text-accent text-xs">
							{t('clan.squads.png.membersCount')}
						</p>
						<p className="font-bold text-lg text-primary">
							{squads.reduce(
								(sum, s) => sum + s.members.length,
								0
							)}
						</p>
					</div>
				</div>
			</header>
			<div
				className={`${montserrat.className} mb-6 flex w-fit items-center gap-6 rounded-lg bg-card px-4 py-2 font-semibold text-xs`}
			>
				<span className="flex items-center gap-2 text-text-accent">
					<span className="size-3 rounded border border-amber-500/60 bg-amber-500/10" />
					{t('clan.squads.png.leader')}
				</span>
				<span className="flex items-center gap-2 text-text-accent">
					<span className="size-3 rounded border border-destructive/60 bg-destructive/10" />
					{t('clan.squads.png.absent')}
				</span>
			</div>
			<div className="grid grid-cols-3 gap-6">
				{squads.map((squad) => (
					<SquadPngCard
						absentUserIds={absentUserIds}
						key={squad.id}
						squad={squad}
					/>
				))}
			</div>
		</div>
	)
})

function SquadPngCard({
	squad,
	absentUserIds,
}: {
	squad: ClanSquad
	absentUserIds: Set<number>
}) {
	const members = [...squad.members].sort((a, b) => a.slot - b.slot)

	return (
		<div className="flex flex-col gap-3 rounded-lg bg-card/50 p-5 ring-2 ring-primary/50">
			<div className="flex items-center justify-between gap-2">
				<p
					className={`${unbounded.className} truncate font-bold text-md uppercase tracking-widest`}
				>
					{squad.name}
				</p>
				<span
					className={`${montserrat.className} font-bold text-sm text-text-accent`}
				>
					{squad.members.length}/5
				</span>
			</div>
			{squad.leader && (
				<div className="flex items-center gap-1.5 text-amber-500">
					<Icon className="text-sm" icon="lucide:crown" />
					<span
						className={`${montserrat.className} truncate font-semibold text-sm`}
					>
						{squad.leader.member.name}
					</span>
				</div>
			)}
			<div className="flex flex-col gap-2">
				{Array.from({ length: 5 }, (_, slot) => {
					const member = members.find((m) => m.slot === slot)
					return (
						<SquadSlotPng
							absentUserIds={absentUserIds}
							isLeader={squad.leader_id === member?.id}
							key={slot}
							member={member}
							slot={slot}
						/>
					)
				})}
			</div>
		</div>
	)
}

function SquadSlotPng({
	member,
	absentUserIds,
	isLeader,
}: {
	slot: number
	member: ClanSquadMember | undefined
	absentUserIds: Set<number>
	isLeader: boolean
}) {
	const t = useTranslations()
	const isAbsent =
		member?.member.user_id != null &&
		absentUserIds.has(member.member.user_id as number)

	return (
		<div
			className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 ${
				member
					? isAbsent
						? 'border-destructive/60 bg-destructive/10'
						: isLeader
							? 'border-amber-500/60 bg-amber-500/10'
							: 'border-muted bg-card/40'
					: 'border-muted border-dashed'
			}`}
		>
			{member ? (
				<>
					<p
						className={`${montserrat.className} truncate font-semibold text-sm`}
					>
						{member.member.name}
					</p>
					<p
						className={`${montserrat.className} font-semibold text-text-accent text-xs`}
					>
						{t(`player.rank.${member.member.rank}`)}
					</p>
				</>
			) : (
				<p
					className={`${montserrat.className} font-semibold text-sm text-text-accent/70`}
				>
					{t('clan.squads.png.empty')}
				</p>
			)}
		</div>
	)
}
