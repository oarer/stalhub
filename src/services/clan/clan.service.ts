import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	Absence,
	AttendanceSummary,
	BotGuild,
	BotLinkToken,
	ClanInfo,
	ClanMember,
	ClanMemberUser,
	ClanSchedule,
	ClanSettings,
	ClanSquad,
	ClanSquadMember,
	ClanSquadRequest,
	ClanStats,
	ClanStatsSession,
	GoldDrop,
	GoldDropStatus,
	GrenadeAllTimeResponse,
	GrenadeStagesResponse,
	PublicClan,
	SquadMap,
	StageAttendance,
	StageSession,
	StageSessionDetail,
	SyncResponse,
	UserClanProfile,
} from '@/types/clan/clan.type'

function normalizeSession(s: Record<string, unknown>): StageSession {
	return {
		id: s.id as number,
		externalId: (s.external_id as string) ?? '',
		region: (s.region as string) ?? '',
		mapName: (s.map_name as string) ?? '',
		type: (s.type as StageSession['type']) ?? 'TOURNAMENT',
		startedAt: s.started_at as string,
		endedAt: (s.ended_at as string | null) ?? null,
		creatorId: s.creatorId as number,
		clanId: (s.clanId as string | null) ?? null,
		_count: s._count as StageSession['_count'],
		victory: (s.victory as StageSession['victory']) ?? {
			wins: 0,
			losses: 0,
			unknown: 0,
		},
		totalScore:
			(s.ai_summary as { totalScore?: number | null } | null | undefined)
				?.totalScore ?? null,
		createdAt: s.created_at as string,
	}
}

function normalizeDetail(d: Record<string, unknown>): StageSessionDetail {
	return {
		...normalizeSession(d),
		screenshots: ((d.screenshots as unknown[]) ?? []).map((ss) => ({
			id: (ss as Record<string, unknown>).id as number,
			aiStatus: (ss as Record<string, unknown>)
				.ai_status as StageSessionDetail['screenshots'][number]['aiStatus'],
			aiError: (ss as Record<string, unknown>).ai_error as string | null,
			victory: (ss as Record<string, unknown>).victory as boolean | null,
			createdAt: (ss as Record<string, unknown>).created_at as string,
			filePath: (ss as Record<string, unknown>).file_path as string,
		})),
		attendance: ((d.attendance as unknown[]) ?? []).map((a) => {
			const raw = a as Record<string, unknown>
			const user = (raw.user as ClanMemberUser | null) ?? null
			return {
				id: raw.id as number,
				name: (raw.name as string) ?? user?.name ?? '',
				status: raw.status as StageAttendance['status'],
				source: raw.source as StageAttendance['source'],
				note: (raw.note as string | null) ?? null,
				user,
			}
		}),
		aiSummary: (d.ai_summary as StageSessionDetail['aiSummary']) ?? null,
	}
}

function normalizeStats(d: unknown): ClanStats {
	const raw = Array.isArray(d)
		? (d as unknown[])
		: (((d as Record<string, unknown> | null)?.sessions as unknown[]) ?? [])
	const sessions = raw.map((s) => {
		const sess = s as Record<string, unknown>
		return {
			id: sess.id as number,
			mapName: (sess.map_name as string) ?? '',
			type: (sess.type as ClanStatsSession['type']) ?? 'TOURNAMENT',
			startedAt: sess.started_at as string,
			screenshots: ((sess.screenshots as unknown[]) ?? []).map((shot) => {
				const sh = shot as Record<string, unknown>
				return {
					id: sh.id as number,
					victory: (sh.victory as boolean | null) ?? null,
					players: ((sh.players as unknown[]) ?? []).map((p) => {
						const pl = p as Record<string, unknown>
						return {
							name: (pl.name as string) ?? '',
							kills: (pl.kills as number | null) ?? 0,
							deaths: (pl.deaths as number | null) ?? 0,
							assists: (pl.assists as number | null) ?? 0,
							score: (pl.score as number | null) ?? 0,
						}
					}),
				}
			}),
		}
	})
	return { sessions }
}

class ClanService {
	async getMe(): Promise<UserClanProfile | null> {
		const { data } = await apiClient.get<UserClanProfile | null>(
			'/api/v1/clan/me'
		)
		return data
	}

	async register(): Promise<ClanInfo> {
		const { data } = await apiClient.post<ClanInfo>('/api/v1/clan/register')
		return data
	}

	async sync(body?: {
		region?: string
		clanId?: string
	}): Promise<SyncResponse> {
		const { data } = await apiClient.post<SyncResponse>(
			'/api/v1/clan/sync',
			body
		)
		return data
	}

	async getClan(clanId: string): Promise<ClanInfo> {
		const { data } = await apiClient.get<ClanInfo>(`/api/v1/clan/${clanId}`)
		return data
	}

	async getMembers(clanId: string): Promise<ClanMember[]> {
		const { data } = await apiClient.get<ClanMember[]>(
			`/api/v1/clan/members/${clanId}`
		)
		return data
	}

	async getSessions(clanId?: string): Promise<StageSession[]> {
		const { data } = await apiClient.get<Record<string, unknown>[]>(
			'/api/v1/clan/analytics/sessions',
			{ params: { clanId } }
		)
		return (data ?? []).map(normalizeSession)
	}

	async getSession(id: number): Promise<StageSessionDetail> {
		const { data } = await apiClient.get<Record<string, unknown>>(
			`/api/v1/clan/analytics/sessions/${id}`
		)
		return normalizeDetail(data)
	}

	async createSession(body: {
		region: string
		map_name: string
		type?: string
		started_at?: string
	}): Promise<StageSession> {
		const { data } = await apiClient.post<StageSession>(
			'/api/v1/clan/analytics/sessions',
			body
		)
		return data
	}

	async retryScreenshot(screenshotId: number): Promise<void> {
		await apiClient.post(
			`/api/v1/clan/analytics/screenshots/${screenshotId}/retry`
		)
	}

	async deleteSession(sessionId: number): Promise<void> {
		await apiClient.delete(`/api/v1/clan/analytics/sessions/${sessionId}`)
	}

	async getStats(clanId: string): Promise<ClanStats> {
		const { data } = await apiClient.get<unknown>(
			'/api/v1/clan/analytics/stats',
			{ params: { clanId } }
		)
		return normalizeStats(data)
	}

	async getAttendanceSummary(
		clanId: string,
		type?: 'ALL' | 'TOURNAMENT' | 'BRAWL',
		from?: string
	): Promise<AttendanceSummary> {
		const { data } = await apiClient.get<AttendanceSummary>(
			`/api/v1/clan/analytics/attendance-summary/${clanId}`,
			{
				params: {
					...(type && type !== 'ALL' ? { type } : {}),
					...(from ? { from } : {}),
				},
			}
		)
		return data
	}

	async getSettings(): Promise<ClanSettings> {
		const { data } = await apiClient.get<ClanSettings>(
			'/api/v1/clan/settings'
		)
		return data
	}

	async updateSchedule(body: Partial<ClanSchedule>): Promise<ClanInfo> {
		const { data } = await apiClient.patch<ClanInfo>(
			'/api/v1/clan/schedule',
			body
		)
		return data
	}

	async getGrenadeStages(clanId: string): Promise<GrenadeStagesResponse> {
		const { data } = await apiClient.get<GrenadeStagesResponse>(
			`/api/v1/clan/analytics/grenades/clan/${clanId}/stages`
		)
		return data
	}

	async getGrenadeAllTime(clanId: string): Promise<GrenadeAllTimeResponse> {
		const { data } = await apiClient.get<GrenadeAllTimeResponse>(
			`/api/v1/clan/analytics/grenades/clan/${clanId}/all-time`
		)
		return data
	}

	async getSquads(clanId: string): Promise<ClanSquad[]> {
		const { data } = await apiClient.get<ClanSquad[]>(
			`/api/v1/clan/squads/${clanId}`
		)
		return data
	}

	async createSquad(name: string, map: SquadMap): Promise<ClanSquad> {
		const { data } = await apiClient.post<ClanSquad>(
			'/api/v1/clan/squads',
			{ name, map }
		)
		return data
	}

	async requestJoinSquad(squadId: number): Promise<ClanSquadRequest> {
		const { data } = await apiClient.post<ClanSquadRequest>(
			`/api/v1/clan/squads/${squadId}/requests`
		)
		return data
	}

	async approveSquadRequest(requestId: number): Promise<ClanSquadMember> {
		const { data } = await apiClient.post<ClanSquadMember>(
			`/api/v1/clan/squads/requests/${requestId}/approve`
		)
		return data
	}

	async rejectSquadRequest(requestId: number): Promise<void> {
		await apiClient.post(`/api/v1/clan/squads/requests/${requestId}/reject`)
	}

	async assignSquadMember(
		squadId: number,
		memberId: number,
		slot: number
	): Promise<ClanSquad> {
		const { data } = await apiClient.post<ClanSquad>(
			`/api/v1/clan/squads/${squadId}/slots`,
			{ memberId, slot }
		)
		return data
	}

	async removeSquadMember(squadId: number, slot: number): Promise<void> {
		await apiClient.delete(`/api/v1/clan/squads/${squadId}/slots/${slot}`)
	}

	async setSquadLeader(
		squadId: number,
		memberId: number | null
	): Promise<ClanSquad> {
		const { data } = await apiClient.put<ClanSquad>(
			`/api/v1/clan/squads/${squadId}/leader`,
			{ memberId }
		)
		return data
	}

	async deleteSquad(squadId: number): Promise<void> {
		await apiClient.delete(`/api/v1/clan/squads/${squadId}`)
	}

	async updateSquadMap(squadId: number, map: SquadMap): Promise<ClanSquad> {
		const { data } = await apiClient.patch<ClanSquad>(
			`/api/v1/clan/squads/${squadId}/map`,
			{ map }
		)
		return data
	}

	async getGoldDrops(clanId: string): Promise<GoldDrop[]> {
		const { data } = await apiClient.get<GoldDrop[]>(
			`/api/v1/clan/gold/${clanId}`
		)
		return data
	}

	async setGoldAttendees(
		dropId: number,
		memberIds: number[]
	): Promise<GoldDrop> {
		const { data } = await apiClient.post<GoldDrop>(
			`/api/v1/clan/gold/${dropId}/attendees`,
			{ memberIds }
		)
		return data
	}

	async setGoldStatus(
		dropId: number,
		status: GoldDropStatus
	): Promise<GoldDrop> {
		const { data } = await apiClient.post<GoldDrop>(
			`/api/v1/clan/gold/${dropId}/status`,
			{ status }
		)
		return data
	}

	async getAbsences(clanId: string, date: string): Promise<Absence[]> {
		const { data } = await apiClient.get<Absence[]>(
			`/api/v1/clan/absences/${clanId}`,
			{ params: { date } }
		)
		return data
	}

	async getAbsencesRange(
		clanId: string,
		from: string,
		to: string
	): Promise<Absence[]> {
		const { data } = await apiClient.get<Absence[]>(
			`/api/v1/clan/absences/${clanId}/range`,
			{ params: { from, to } }
		)
		return data
	}

	async upsertAbsence(body: {
		date: string
		events: { eventType: string; stages?: number[] }[]
		note?: string | null
	}): Promise<Absence> {
		const { data } = await apiClient.put<Absence>(
			'/api/v1/clan/absences',
			body
		)
		return data
	}

	async removeAbsence(date: string): Promise<void> {
		await apiClient.delete(`/api/v1/clan/absences/${date}`)
	}

	async getPublicClans(): Promise<PublicClan[]> {
		const { data } = await apiClient.get<PublicClan[]>('/api/v1/clans')
		return data ?? []
	}

	async getPublicClan(clanId: string): Promise<PublicClan | null> {
		const { data } = await apiClient.get<PublicClan | null>(
			`/api/v1/clans/${clanId}`
		)
		return data
	}

	async updatePublicSettings(body: {
		is_public?: boolean
	}): Promise<ClanInfo> {
		const { data } = await apiClient.patch<ClanInfo>(
			'/api/v1/clan/settings',
			body
		)
		return data
	}

	async updateRecruiting(recruiting: boolean): Promise<ClanInfo> {
		const { data } = await apiClient.patch<ClanInfo>(
			'/api/v1/clan/recruiting',
			{ recruiting }
		)
		return data
	}

	async freeze(): Promise<ClanInfo> {
		const { data } = await apiClient.post<ClanInfo>('/api/v1/clan/freeze')
		return data
	}
	
	async discordLink(): Promise<BotLinkToken> {
		const { data } = await apiClient.post<BotLinkToken>(
			'/api/v1/clan/bot/link-token'
		)
		return data
	}

	async getBotGuilds(): Promise<BotGuild[]> {
		const { data } = await apiClient.get<{ guilds: BotGuild[] }>(
			'/api/v1/clan/bot/guilds'
		)
		return data?.guilds ?? []
	}

	async unlinkBotGuild(guildId: string): Promise<void> {
		await apiClient.delete(
			`/api/v1/clan/bot/guilds/${encodeURIComponent(guildId)}`
		)
	}
}

export const clanService = new ClanService()
