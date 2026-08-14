'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Alert } from '@/components/ui/Alert'
import { Skeleton } from '@/components/ui/Skeleton'
import { clanQueries } from '@/queries/clan/clan.queries'
import type { UserClanProfile } from '@/types/clan/clan.type'
import { Section } from '../me/components/Section'
import { GrenadeTopList } from './components/dashboard/GrenadeTopList'
import { MemberList } from './components/dashboard/MemberList'
import { SessionCard } from './components/dashboard/SessionCard'
import { StatCard } from './components/dashboard/StatCard'
import { TopPlayersTable } from './components/dashboard/TopPlayersTable'

export default function ClanDashboardView() {
	const { data: profile } = useSuspenseQuery(clanQueries.getMe())
	const clan = profile?.clan
	if (!clan) return null
	return <ClanDashboardContent clan={clan} />
}

function ClanDashboardContent({
	clan,
}: {
	clan: NonNullable<UserClanProfile['clan']>
}) {
	const t = useTranslations()
	const { data: members, isLoading: membersLoading } = useSuspenseQuery(
		clanQueries.getMembers(clan.id)
	)
	const { data: sessions, isLoading: sessionsLoading } = useSuspenseQuery(
		clanQueries.getSessions(clan.id)
	)
	const { data: grenadeStages } = useSuspenseQuery(
		clanQueries.getGrenadeStages(clan.id)
	)
	const { data: stats } = useSuspenseQuery(clanQueries.getStats(clan.id))

	const memberCount = clan.memberCount ?? members?.length ?? 0

	const totalWins = stats.sessions.reduce(
		(n, s) => n + s.screenshots.filter((sh) => sh.victory === true).length,
		0
	)
	const totalLosses = stats.sessions.reduce(
		(n, s) => n + s.screenshots.filter((sh) => sh.victory === false).length,
		0
	)

	const linkedMembers = members?.filter((m) => m.userId != null).length ?? 0

	const latestEvent = grenadeStages?.events?.[0] ?? null
	const grenadeTotal =
		latestEvent?.total.reduce((s, m) => s + m.grenades, 0) ?? 0
	const grenadeTop =
		latestEvent?.total.slice(0, 5).map((m) => ({
			character: m.name,
			total: m.grenades,
		})) ?? []
	const recentSessions = sessions?.slice(0, 5) ?? []

	const playerTotals = new Map<
		string,
		{ name: string; kills: number; deaths: number }
	>()
	for (const s of stats?.sessions ?? []) {
		for (const shot of s.screenshots) {
			for (const p of shot.players) {
				const key = p.name.trim().toLowerCase()
				if (!key) continue
				const e = playerTotals.get(key) ?? {
					name: p.name.trim(),
					kills: 0,
					deaths: 0,
				}
				e.kills += p.kills ?? 0
				e.deaths += p.deaths ?? 0
				playerTotals.set(key, e)
			}
		}
	}
	const topPlayers = [...playerTotals.values()]
		.sort((a, b) => b.kills - a.kills)
		.slice(0, 5)

	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
				<StatCard
					icon="lucide:users"
					label={t('clan.common.members')}
					value={memberCount}
				/>
				<StatCard
					icon="lucide:swords"
					label={t('clan.common.games')}
					value={sessions?.length ?? 0}
				/>
				<StatCard
					icon="lucide:crown"
					label={t('clan.common.wins')}
					value={totalWins}
				/>
				<StatCard
					icon="lucide:swords"
					label={t('clan.common.losses')}
					value={totalLosses}
				/>
			</div>

			{linkedMembers < memberCount && (
				<Alert.Root variant={'destructive'}>
					<Alert.Description>
						{t('clan.dashboard.notAllRegistered')}
					</Alert.Description>
				</Alert.Root>
			)}

			<MemberList isLoading={membersLoading} members={members ?? []} />

			<Section
				icon="lucide:history"
				title={t('clan.dashboard.recentGames')}
			>
				{sessionsLoading ? (
					<div className="flex flex-col gap-2">
						{[...Array(3)].map((_, i) => (
							<Skeleton className="h-16 w-full" key={i} />
						))}
					</div>
				) : recentSessions.length === 0 ? (
					<p className="font-semibold text-sm text-text-accent">
						{t('clan.common.noGames')}
					</p>
				) : (
					<div className="flex flex-col gap-3">
						{recentSessions.map((session) => (
							<SessionCard key={session.id} session={session} />
						))}
					</div>
				)}
			</Section>

			<TopPlayersTable topPlayers={topPlayers} />

			<GrenadeTopList
				grenadeTop={grenadeTop}
				grenadeTotal={grenadeTotal}
				latestEvent={latestEvent}
			/>
		</div>
	)
}
