import type {
	AttendanceSummary,
	ClanMember,
	ClanMemberUser,
	ClanSchedule,
	ClanSquad,
	ClanStats,
} from '@/types/clan/clan.type'
import type { Rank } from '@/types/player.type'
import { TOURNAMENT_DAYS } from '@/types/clan/clan.type'

export const ATTENDANCE_THRESHOLD = 0.5
export const ABSENCE_RATE_THRESHOLD = 0.25
export const KD_REF = 3
export const ABSENCE_LOOKBACK_DAYS = 30
export const WEEKS_PER_MONTH = 4

export const METRICS = [
	{ value: 'kd', label: 'clan.metrics.kd', color: '#0092D1' },
	{ value: 'kda', label: 'clan.metrics.kda', color: '#a855f7' },
	{ value: 'kills', label: 'clan.metrics.kills', color: '#f59e0b' },
	{ value: 'grenades', label: 'clan.metrics.grenades', color: '#84cc16' },
] as const

export type Metric = (typeof METRICS)[number]['value']

export type AttendanceFilter = 'ALL' | 'TOURNAMENT' | 'BRAWL'

export const ATTENDANCE_FILTERS = [
	{ value: 'TOURNAMENT', label: 'clan.filters.TOURNAMENT' },
	{ value: 'BRAWL', label: 'clan.filters.BRAWL' },
	{ value: 'ALL', label: 'clan.filters.ALL' },
] as const satisfies readonly { value: AttendanceFilter; label: string }[]

export interface PlayerAgg {
	name: string
	kills: number
	deaths: number
	assists: number
}

export interface SquadAgg {
	id: number
	name: string
	kd: number
	kda: number
	memberCount: number
}

export function playerKd(p: PlayerAgg): number {
	return p.deaths === 0 ? (p.kills > 0 ? p.kills : 0) : p.kills / p.deaths
}

export function playerKda(p: PlayerAgg): number {
	return p.deaths === 0
		? p.kills + p.assists > 0
			? p.kills + p.assists
			: 0
		: (p.kills + p.assists) / p.deaths
}

export interface SessionResult {
	id: number
	label: string
	type: string
	victory: 'win' | 'loss' | 'draw'
}

export interface KickRow {
	name: string
	rank: Rank
	user: ClanMemberUser | null
	attendedRate: number | null
	attended: number
	total: number
	absenceRate: number | null
	absenceDays: number
	mandatoryDays: number
	kd: number
	kills: number
	deaths: number
	chance: number
}

export function buildSessionResults(stats: ClanStats): SessionResult[] {
	return stats.sessions.map((session) => {
		let wins = 0
		let losses = 0
		for (const s of session.screenshots) {
			if (s.victory === true) wins++
			else if (s.victory === false) losses++
		}
		const victory =
			wins + losses > 0
				? wins >= losses
					? ('win' as const)
					: ('loss' as const)
				: ('draw' as const)
		return {
			id: session.id,
			label: new Date(session.startedAt).toLocaleDateString('ru-RU', {
				day: '2-digit',
				month: '2-digit',
			}),
			type: session.type,
			victory,
		}
	})
}

export function buildPlayers(stats: ClanStats): PlayerAgg[] {
	const byPlayer = new Map<string, PlayerAgg>()
	for (const session of stats.sessions) {
		for (const shot of session.screenshots) {
			for (const p of shot.players) {
				const key = p.name.trim().toLowerCase()
				if (!key) continue
				const entry = byPlayer.get(key) ?? {
					name: p.name.trim(),
					kills: 0,
					deaths: 0,
					assists: 0,
				}
				entry.kills += p.kills ?? 0
				entry.deaths += p.deaths ?? 0
				entry.assists += p.assists ?? 0
				byPlayer.set(key, entry)
			}
		}
	}
	return [...byPlayer.values()]
}

export function buildSquadRows(
	squads: ClanSquad[],
	players: PlayerAgg[]
): SquadAgg[] {
	const playersByName = new Map(players.map((p) => [p.name.toLowerCase(), p]))
	return squads
		.map((squad) => {
			const memberStats = squad.members
				.map((sm) =>
					playersByName.get(sm.member.name.trim().toLowerCase())
				)
				.filter((p): p is PlayerAgg => p != null)
			const avg = (fn: (p: PlayerAgg) => number) =>
				memberStats.length === 0
					? 0
					: memberStats.reduce((sum, p) => sum + fn(p), 0) /
						memberStats.length
			return {
				id: squad.id,
				name: squad.name,
				kd: avg(playerKd),
				kda: avg(playerKda),
				memberCount: squad.members.length,
			}
		})
		.sort((a, b) => b.kd - a.kd)
}

export function buildKickRows(params: {
	members: ClanMember[]
	attendance: AttendanceSummary
	statsPlayers: PlayerAgg[]
	absences: { userId: number; date: string; mandatory: boolean }[]
	schedule: ClanSchedule
}): KickRow[] {
	const { members, attendance, statsPlayers, absences, schedule } = params

	const attendanceByName = new Map(
		attendance.members.map((m) => [m.name.toLowerCase(), m])
	)
	const statsByName = new Map(
		statsPlayers.map((p) => [p.name.toLowerCase(), p])
	)
	const absenceCountByUser = new Map<number, number>()
	for (const a of absences) {
		if (!a.mandatory) continue
		absenceCountByUser.set(
			a.userId,
			(absenceCountByUser.get(a.userId) ?? 0) + 1
		)
	}

	const mandatoryDays =
		(TOURNAMENT_DAYS +
			(schedule.brawlsMandatory ? schedule.brawlsPerWeek : 0)) *
		WEEKS_PER_MONTH

	const rows: KickRow[] = []
	for (const member of members) {
		const key = member.name.toLowerCase()
		const att = attendanceByName.get(key)
		const stats = statsByName.get(key)

		const attended = att ? att.present : 0
		const total = att ? att.present + att.absent + att.late : 0
		const attendedRate = total > 0 ? attended / total : null

		const absenceDays =
			member.userId != null
				? (absenceCountByUser.get(member.userId) ?? 0)
				: 0
		const absenceRate =
			mandatoryDays > 0 ? absenceDays / mandatoryDays : 0

		const kd = stats ? playerKd(stats) : 0

		const failsAttendance =
			attendedRate !== null && attendedRate < ATTENDANCE_THRESHOLD
		const failsAbsence = absenceRate >= ABSENCE_RATE_THRESHOLD
		if (!failsAttendance && !failsAbsence) continue

		const attendedDeficit =
			attendedRate === null
				? 0
				: Math.max(
						0,
						(ATTENDANCE_THRESHOLD - attendedRate) /
							ATTENDANCE_THRESHOLD
					)
		const absenceFactor =
			absenceRate >= ABSENCE_RATE_THRESHOLD
				? Math.min(
						1,
						(absenceRate - ABSENCE_RATE_THRESHOLD) /
							ABSENCE_RATE_THRESHOLD
					)
				: 0
		const kdFactor = Math.min(1, Math.max(0, (KD_REF - kd) / KD_REF))
		const chance = Math.round(
			Math.min(
				100,
				Math.max(
					5,
					100 *
						(0.65 * attendedDeficit +
							0.2 * absenceFactor +
							0.15 * kdFactor)
				)
			)
		)

		rows.push({
			name: member.name,
			rank: member.rank as Rank,
			user: member.user,
			attendedRate,
			attended,
			total,
			absenceRate,
			absenceDays,
			mandatoryDays,
			kd,
			kills: stats?.kills ?? 0,
			deaths: stats?.deaths ?? 0,
			chance,
		})
	}

	return rows.sort(
		(a, b) => b.chance - a.chance || a.name.localeCompare(b.name, 'ru')
	)
}
