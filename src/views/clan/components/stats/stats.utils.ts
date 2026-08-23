import type { ClanStats } from '@/types/clan/clan.type'

export interface StageEntry {
	session_id: number
	map_name: string
	type: string
	started_at: string
	victory: boolean | null
	kills: number
	deaths: number
	assists: number
	score: number
}

export interface PlayerAgg {
	name: string
	kills: number
	deaths: number
	assists: number
	score: number
	appearances: number
	stages: StageEntry[]
}

export function buildPlayers(stats: ClanStats): PlayerAgg[] {
	const byPlayer = new Map<string, PlayerAgg>()

	for (const session of stats.sessions) {
		const sessionVictory = session.screenshots.reduce<{
			wins: number
			losses: number
		}>(
			(acc, s) => {
				if (s.victory === true) acc.wins++
				else if (s.victory === false) acc.losses++
				return acc
			},
			{ wins: 0, losses: 0 }
		)
		const victory =
			sessionVictory.wins + sessionVictory.losses > 0
				? sessionVictory.wins >= sessionVictory.losses
				: null

		for (const shot of session.screenshots) {
			for (const p of shot.players) {
				const key = p.name.trim().toLowerCase()
				if (!key) continue
				const entry = byPlayer.get(key) ?? {
					name: p.name.trim(),
					kills: 0,
					deaths: 0,
					assists: 0,
					score: 0,
					appearances: 0,
					stages: [],
				}
				entry.kills += p.kills ?? 0
				entry.deaths += p.deaths ?? 0
				entry.assists += p.assists ?? 0
				entry.score += p.score ?? 0
				entry.appearances += 1
				byPlayer.set(key, entry)
			}
		}

		const stageTotals = new Map<
			string,
			{ kills: number; deaths: number; assists: number; score: number }
		>()
		for (const shot of session.screenshots) {
			for (const p of shot.players) {
				const key = p.name.trim().toLowerCase()
				if (!key) continue
				const t = stageTotals.get(key) ?? {
					kills: 0,
					deaths: 0,
					assists: 0,
					score: 0,
				}
				t.kills += p.kills ?? 0
				t.deaths += p.deaths ?? 0
				t.assists += p.assists ?? 0
				t.score += p.score ?? 0
				stageTotals.set(key, t)
			}
		}
		for (const [key, t] of stageTotals) {
			const entry = byPlayer.get(key)
			if (!entry) continue
			entry.stages.push({
				session_id: session.id,
				map_name: session.map_name,
				type: session.type,
				started_at: session.started_at,
				victory,
				kills: t.kills,
				deaths: t.deaths,
				assists: t.assists,
				score: t.score,
			})
		}
	}

	return [...byPlayer.values()].sort(
		(a, b) => b.kills - a.kills || b.deaths - a.deaths
	)
}
