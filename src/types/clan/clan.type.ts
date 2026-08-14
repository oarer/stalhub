import type { Alliance } from '../player.type'

type ClanStatus = 'FROZEN' | 'ACTIVE' | 'CANCELED'
type StageType = 'TOURNAMENT' | 'BRAWL' | 'BASE_CAPTURE'
export type SquadMap = 'SMALL_BERDOVKA' | 'KHVOUINOY' | 'NIZINA'
export type GoldDropStatus = 'PENDING' | 'CLAIMED'
export type AbsenceEventType =
	| 'TOURNAMENT'
	| 'BRAWL'
	| 'BASE_CAPTURE'
	| 'GOLD_DROP'
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
type AttendanceSource = 'ai' | 'manual'

export interface ClanSchedule {
	brawlsPerWeek: number
	brawlsMandatory: boolean
}

export const TOURNAMENT_DAYS = 3


export interface ClanInfo {
	id: string
	name: string
	tag: string
	level: number
	levelPoints: number
	alliance: string
	description: string
	leader: string
	memberCount: number
	region: string
	status: ClanStatus
	syncedAt: string
	createdAt: string
	is_public?: boolean
	recruiting?: boolean
	schedule?: ClanSchedule | null
}

export interface ClanMemberUser {
	id: number
	username: string
	name: string
}

export interface ClanMember {
	id: number
	clanId: string
	name: string
	rank: string
	joinTime: string | null
	userId: number | null
	user: ClanMemberUser | null
	syncedAt: string
}

export interface UserClanProfile {
	userId: number
	clanId: string | null
	region: string
	clan: ClanInfo | null
	updatedAt: string
}

export interface PublicClan {
	id: string
	name: string
	tag: string
	level: number
	level_points: number
	alliance: Alliance
	description: string
	leader: string
	member_count: number
	region: string
	status: ClanStatus
	is_public: boolean
	recruiting: boolean
	schedule: ClanSchedule
	created_at: string
}

export interface ClanSettings {
	is_public: boolean
	schedule: ClanSchedule
}

export interface BotLinkToken {
	token: string
	expires_in: number
	command: string
}

export interface BotGuild {
	guild_id: string
	clan_id: string
	allowed_role_id: string | null
	publish_time: string | null
	publish_channel_id: string | null
	linked_by: string
	created_at: string
}

export interface StageSession {
	id: number
	externalId: string
	region: string
	mapName: string
	type: StageType
	startedAt: string
	endedAt: string | null
	creatorId: number
	clanId: string | null
	_count: {
		screenshots: number
		attendance: number
	}
	victory: boolean
	totalScore: number | null
	createdAt: string
}

export interface StageScreenshot {
	id: number
	aiStatus: 'pending' | 'processing' | 'done' | 'error'
	aiError: string | null
	victory: boolean | null
	createdAt: string
	filePath: string
}

export interface StageAttendance {
	id: number
	name: string
	status: AttendanceStatus
	source: AttendanceSource
	note: string | null
	user: ClanMemberUser | null
}

export interface StageSessionDetail extends StageSession {
	screenshots: StageScreenshot[]
	attendance: StageAttendance[]
	aiSummary: StageSummary | null
}

interface StageSummaryPlayer {
	name: string
	role: string | null
	kills: number
	deaths: number
	assists: number
	score: number
	appearances: number
	bestKills: number
}

export interface StageSummary {
	screenshotsAnalyzed: number
	totalScore: number | null
	opponentScore: number | null
	teams: Array<{
		name: string
		score: number | null
		isPlayerClan: boolean
	}>
	screens: Array<{ screenshotId: number; score: number | null }>
	players: StageSummaryPlayer[]
	victory: boolean
	generatedAt: string
}

interface ClanStatsPlayer {
	name: string
	kills: number
	deaths: number
	assists: number
	score: number
}

interface ClanStatsScreenshot {
	id: number
	victory: boolean | null
	players: ClanStatsPlayer[]
}

export interface ClanStatsSession {
	id: number
	mapName: string
	type: StageType
	startedAt: string
	screenshots: ClanStatsScreenshot[]
}

export interface ClanStats {
	sessions: ClanStatsSession[]
}

export interface AttendanceSummary {
	sessions: number
	members: {
		name: string
		present: number
		absent: number
		late: number
		excused: number
	}[]
}

export interface SyncResponse {
	clanId: string
	memberCount: number
}

export interface ClanHistoryEntry {
	id: number
	player_name: string
	region: string
	clan_id: string
	clan_name: string
	clan_tag: string
	alliance: string
	rank: string
	joined_at: string | null
	seen_at: string
}

export interface ClanSquadMember {
	id: number
	squadId: number
	slot: number
	memberId: number
	member: ClanMember
}

export interface ClanSquadRequest {
	id: number
	squadId: number
	memberId: number
	member: ClanMember
	created_at: string
}

export interface ClanSquad {
	id: number
	clanId: string
	name: string
	map: SquadMap
	createdBy: number
	members: ClanSquadMember[]
	leaderId: number | null
	leader: ClanSquadMember | null
	requests: ClanSquadRequest[]
	created_at: string
	updated_at: string
}

interface GoldDropAttendee {
	id: number
	dropId: number
	memberId: number
	member: ClanMember
}

export interface GoldDrop {
	id: number
	clanId: string
	date: string
	status: GoldDropStatus
	created_at: string
	attendees: GoldDropAttendee[]
}

interface AbsenceEvent {
	eventType: AbsenceEventType
	stages?: number[]
}

export interface Absence {
	id: number
	clanId: string
	userId: number
	date: string
	events: AbsenceEvent[]
	note: string | null
	user: ClanMemberUser
	created_at: string
	updated_at: string
}

interface GrenadeStageMember {
	name: string
	grenades: number
}

interface GrenadeStage {
	stage: number
	checkpoints: [string, string]
	members: GrenadeStageMember[]
}

export interface GrenadeStageEvent {
	event_type: StageType | string
	raid_date: string
	stages: GrenadeStage[]
	total: GrenadeStageMember[]
}

export interface GrenadeStagesResponse {
	events: GrenadeStageEvent[]
}

export interface GrenadeAllTimeResponse {
	members: GrenadeStageMember[]
}
