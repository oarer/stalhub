'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import type {
	ClanMember,
	ClanStats,
	GrenadeAllTimeResponse,
	GrenadeStagesResponse,
} from '@/types/clan/clan.type'
import { formatKd } from '../../clan.utils'
import { StatCard } from '../dashboard/StatCard'
import { type MapStatRow, MapStatsTable } from './MapStatsTable'
import { PlayerList } from './PlayerList'
import { buildPlayers } from './stats.utils'

interface ClanStatsBodyProps {
	stats: ClanStats
	members: ClanMember[]
	grenadeAllTime: GrenadeAllTimeResponse
	grenadeStages: GrenadeStagesResponse
}

export function ClanStatsBody({
	stats,
	members,
	grenadeAllTime,
	grenadeStages,
}: ClanStatsBodyProps) {
	const t = useTranslations()
	const [selected, setSelected] = useState<string | null>(null)

	const players = useMemo(() => buildPlayers(stats), [stats])

	const mapRows: MapStatRow[] = useMemo(() => {
		const memberNames = new Set(
			(members ?? []).map((m) => m.name.trim().toLowerCase())
		)
		const byMap = new Map<
			string,
			{
				sessions: number
				wins: number
				losses: number
				kills: number
				deaths: number
			}
		>()
		for (const s of stats.sessions) {
			const key = s.map_name?.trim() || '—'
			const b = byMap.get(key) ?? {
				sessions: 0,
				wins: 0,
				losses: 0,
				kills: 0,
				deaths: 0,
			}
			b.sessions++
			let w = 0
			let l = 0
			for (const sh of s.screenshots) {
				if (sh.victory === true) w++
				else if (sh.victory === false) l++
				for (const p of sh.players) {
					if (!memberNames.has(p.name.trim().toLowerCase())) continue
					b.kills += p.kills ?? 0
					b.deaths += p.deaths ?? 0
				}
			}
			if (w + l > 0) {
				if (w >= l) b.wins++
				else b.losses++
			}
			byMap.set(key, b)
		}
		return [...byMap.entries()]
			.map(([map, b]) => {
				const decided = b.wins + b.losses
				return {
					map,
					sessions: b.sessions,
					wins: b.wins,
					losses: b.losses,
					winrate: decided > 0 ? b.wins / decided : 0,
					kills: b.kills,
					deaths: b.deaths,
					kd: b.deaths > 0 ? b.kills / b.deaths : b.kills,
				}
			})
			.sort((x, y) => y.sessions - x.sessions || y.kd - x.kd)
	}, [stats, members])

	const grenadeTotals = useMemo(() => {
		const map = new Map<string, number>()
		for (const m of grenadeAllTime?.members ?? []) {
			map.set(m.name.trim().toLowerCase(), m.grenades)
		}
		return map
	}, [grenadeAllTime])

	const totalBattles = stats.sessions.reduce(
		(n, s) => n + s.screenshots.length,
		0
	)
	const totalWins = stats.sessions.reduce(
		(n, s) => n + s.screenshots.filter((sh) => sh.victory === true).length,
		0
	)
	const totalLosses = stats.sessions.reduce(
		(n, s) => n + s.screenshots.filter((sh) => sh.victory === false).length,
		0
	)
	const clanKills = players.reduce((n, p) => n + p.kills, 0)
	const clanDeaths = players.reduce((n, p) => n + p.deaths, 0)

	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
				<StatCard
					icon="lucide:swords"
					label={t('clan.common.games')}
					value={totalBattles}
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
				<StatCard
					icon="lucide:swords"
					label={t('clan.stats.clanKd')}
					value={formatKd(clanKills, clanDeaths)}
				/>
			</div>

			{mapRows.length > 0 && (
				<div className="rounded-xl bg-card px-5 py-4">
					<MapStatsTable rows={mapRows} />
				</div>
			)}

			{players.length === 0 ? (
				<div className="flex flex-col items-center gap-2 rounded-xl bg-card px-5 py-4">
					<Icon className="text-4xl" icon="lucide:bar-chart-3" />
					<h3 className="font-semibold text-lg">
						{t('clan.stats.emptyTitle')}
					</h3>
					<p className="font-semibold text-md">
						{t('clan.stats.emptyDesc')}
					</p>
				</div>
			) : (
				<PlayerList
					grenadeStages={grenadeStages}
					grenades={grenadeTotals}
					onSelect={setSelected}
					players={players}
					selected={selected}
				/>
			)}
		</div>
	)
}
