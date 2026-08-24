import { apiClient } from '@/app/api/interceptors/root.interceptor'
import type {
	Absence,
	AttendanceMonth,
	AttendanceSummary,
	BoostMode,
	BotGuild,
	BotLinkToken,
	BulkInviteResult,
	ClanBoostOrdersResponse,
	ClanInfo,
	ClanInvite,
	ClanMember,
	ClanMemberNote,
	ClanMemberNoteWithMember,
	ClanSchedule,
	ClanSettings,
	ClanSquad,
	ClanSquadMember,
	ClanSquadRequest,
	ClanStats,
	ConsumableListingItem,
	CreatedGuestInvite,
	GoldDrop,
	GoldDropStatus,
	GrenadeAllTimeResponse,
	GrenadeBoxEntry,
	GrenadeBoxesResponse,
	GrenadeStagesResponse,
	ListingItem,
	MyClanProfile,
	PublicClan,
	RecruitmentSettings,
	SquadMap,
	StageSession,
	StageSessionDetail,
	SyncResponse,
	UserClanProfile,
} from '@/types/clan/clan.type'

class ClanService {
	async getMe(): Promise<UserClanProfile | null> {
		const { data } = await apiClient.get<UserClanProfile | null>(
			'/api/v1/clan/me'
		)
		return data
	}

	async getMyClans(): Promise<MyClanProfile[]> {
		const { data } = await apiClient.get<MyClanProfile[]>(
			'/api/v1/clan/my-clans'
		)
		return data ?? []
	}

	async switchClan(clanId: string): Promise<void> {
		await apiClient.post('/api/v1/clan/switch', { clan_id: clanId })
	}

	async register(): Promise<ClanInfo> {
		const { data } = await apiClient.post<ClanInfo>('/api/v1/clan/register')
		return data
	}

	async sync(body?: {
		region?: string
		clan_id?: string
	}): Promise<SyncResponse> {
		const { data } = await apiClient.post<SyncResponse>(
			'/api/v1/clan/sync',
			body ?? {}
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
		const { data } = await apiClient.get<StageSession[]>(
			'/api/v1/clan/analytics/sessions',
			{ params: { clan_id: clanId } }
		)
		return data ?? []
	}

	async getSession(id: number): Promise<StageSessionDetail> {
		const { data } = await apiClient.get<StageSessionDetail>(
			`/api/v1/clan/analytics/sessions/${id}`
		)
		return data
	}

	async createSession(body: {
		region: string
		map_name: string
		type?: string
		stage_number?: number
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
		const { data } = await apiClient.get<ClanStats>(
			'/api/v1/clan/analytics/stats',
			{ params: { clan_id: clanId } }
		)
		return data
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

	async getAttendanceMonth(month: string): Promise<AttendanceMonth> {
		const { data } = await apiClient.get<AttendanceMonth>(
			'/api/v1/clan/analytics/attendance',
			{ params: { month } }
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
			{ member_id: memberId, slot }
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
			{ member_id: memberId }
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
			{ member_ids: memberIds }
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
		events: { event_type: string; stages?: number[] }[]
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

	async updateRecruitment(body: RecruitmentSettings): Promise<ClanInfo> {
		const { data } = await apiClient.patch<ClanInfo>(
			'/api/v1/clan/recruitment',
			body
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

	async getInvites(): Promise<ClanInvite[]> {
		const { data } = await apiClient.get<ClanInvite[]>(
			'/api/v1/clan/invites'
		)
		return data ?? []
	}

	async createInvite(nickname: string): Promise<CreatedGuestInvite> {
		const { data } = await apiClient.post<CreatedGuestInvite>(
			'/api/v1/clan/invites',
			{ nickname }
		)
		return data
	}

	async createInvitesBulk(nicknames: string[]): Promise<BulkInviteResult[]> {
		const { data } = await apiClient.post<BulkInviteResult[]>(
			'/api/v1/clan/invites/bulk',
			{ nicknames }
		)
		return data ?? []
	}

	async revokeInvite(inviteId: number): Promise<void> {
		await apiClient.delete(`/api/v1/clan/invites/${inviteId}`)
	}

	async kickGuest(userId: number): Promise<void> {
		await apiClient.delete(`/api/v1/clan/invites/guest/${userId}`)
	}

	async getAllNotes(): Promise<ClanMemberNoteWithMember[]> {
		const { data } =
			await apiClient.get<ClanMemberNoteWithMember[]>(
				'/api/v1/clan/notes'
			)
		return data ?? []
	}

	async createMemberNote(
		memberId: number,
		content: string
	): Promise<ClanMemberNote> {
		const { data } = await apiClient.post<ClanMemberNote>(
			'/api/v1/clan/notes',
			{ member_id: memberId, content }
		)
		return data
	}

	async updateMemberNote(
		noteId: number,
		content: string
	): Promise<ClanMemberNote> {
		const { data } = await apiClient.patch<ClanMemberNote>(
			`/api/v1/clan/notes/${noteId}`,
			{ content }
		)
		return data
	}

	async deleteMemberNote(noteId: number): Promise<void> {
		await apiClient.delete(`/api/v1/clan/notes/${noteId}`)
	}

	async getGrenadeBoxes(clanId: string): Promise<GrenadeBoxesResponse> {
		const { data } = await apiClient.get<GrenadeBoxesResponse>(
			`/api/v1/clan/analytics/grenades/clan/${clanId}/boxes`
		)
		return data
	}

	async addGrenadeBox(
		clanId: string,
		entry: GrenadeBoxEntry
	): Promise<GrenadeBoxesResponse> {
		const { data } = await apiClient.post<GrenadeBoxesResponse>(
			`/api/v1/clan/analytics/grenades/clan/${clanId}/boxes`,
			entry
		)
		return data
	}

	async removeGrenadeBox(
		clanId: string,
		index: number
	): Promise<GrenadeBoxesResponse> {
		const { data } = await apiClient.delete<GrenadeBoxesResponse>(
			`/api/v1/clan/analytics/grenades/clan/${clanId}/boxes`,
			{ params: { index } }
		)
		return data
	}

	async updateBoostMode(boost_mode: BoostMode): Promise<ClanInfo> {
		const { data } = await apiClient.patch<ClanInfo>(
			'/api/v1/clan/boost-mode',
			{ boost_mode }
		)
		return data
	}

	async updateGrenadeMode(grenade_mode: BoostMode): Promise<ClanInfo> {
		const { data } = await apiClient.patch<ClanInfo>(
			'/api/v1/clan/grenade-mode',
			{ grenade_mode }
		)
		return data
	}

	async getGrenadeBoxListing(): Promise<ListingItem[]> {
		const { data } = await apiClient.get<ListingItem[]>(
			'/api/v1/clan/listing/grenade-boxes'
		)
		return data
	}

	async getConsumableListing(): Promise<ConsumableListingItem[]> {
		const { data } = await apiClient.get<ConsumableListingItem[]>(
			'/api/v1/clan/listing/consumables'
		)
		return data
	}

	async getBoostOrders(): Promise<ClanBoostOrdersResponse> {
		const { data } =
			await apiClient.get<ClanBoostOrdersResponse>(`/api/v1/clan/boosts`)
		return data
	}

	async addBoostOrder(body: {
		player_id: number
		item_id: string
		item_name: string
		count: number
	}): Promise<ClanBoostOrdersResponse> {
		const { data } = await apiClient.post<ClanBoostOrdersResponse>(
			'/api/v1/clan/boosts',
			body
		)
		return data
	}

	async removeBoostOrder(index: number): Promise<ClanBoostOrdersResponse> {
		const { data } = await apiClient.delete<ClanBoostOrdersResponse>(
			`/api/v1/clan/boosts/${index}`
		)
		return data
	}
}

export const clanService = new ClanService()
