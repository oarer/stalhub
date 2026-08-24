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
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
type AttendanceSource = 'ai' | 'manual'

export type SundayActivity = 'BASE_CAPTURE' | 'BRAWL' | 'NONE'

export interface ClanSchedule {
	brawls_per_week: number
	brawls_mandatory: boolean
	sunday_activity: SundayActivity
}

export interface RecruitmentSettings {
	leader_discord: string
	clan_discord: string | null
	paid_recruitment: boolean
	tier: number
	guilds_per_week: number | null
}

export const TOURNAMENT_DAYS = 3

export interface ClanInfo {
	id: string
	name: string
	tag: string
	level: number
	level_points: number
	alliance: string
	description: string
	leader: string
	member_count: number
	region: string
	status: ClanStatus
	blocked: boolean
	block_reason?: string
	synced_at: string
	created_at: string
	is_public?: boolean
	recruiting?: boolean
	leader_discord?: string
	clan_discord?: string | null
	paid_recruitment?: boolean
	tier?: number
	guilds_per_week?: number | null
	schedule?: ClanSchedule | null
}

export interface ClanMemberUser {
	id: number
	username: string
	name: string
}

export interface ClanMember {
	id: number
	clan_id: string
	name: string
	rank: string
	join_time: string | null
	user_id: number | null
	user: ClanMemberUser | null
	synced_at: string
}

export interface UserClanProfile {
	user_id: number
	clan_id: string | null
	region: string
	is_active: boolean
	clan: ClanInfo | null
	updated_at: string
}

export interface MyClanProfile {
	user_id: number
	clan_id: string
	region: string
	is_active: boolean
	clan: ClanInfo
	updated_at: string
}

export interface ClanInvite {
	id: number
	code: string
	clan_id: string
	user_id: number
	claimed_by: string | null
	claimed_at: string | null
	created_by: string
	created_at: string
	user: ClanMemberUser
}

export interface CreatedGuestInvite {
	code: string
	username: string
	password: string
	clan_id: string
	user_id: number
	nickname: string
}

export interface BulkInviteResult {
	ok: boolean
	nickname: string
	error?: string
	code?: string
	username?: string
	password?: string
	clan_id?: string
	user_id?: number
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
	leader_discord: string
	clan_discord: string | null
	paid_recruitment: boolean
	tier: number
	guilds_per_week: number | null
	schedule: ClanSchedule
	boost_mode: BoostMode
	grenade_mode: BoostMode
	created_at: string
}

export interface ClanSettings extends RecruitmentSettings {
	is_public: boolean
	schedule: ClanSchedule
	boost_mode: BoostMode
	grenade_mode: BoostMode
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
	external_id: string
	region: string
	map_name: string
	type: StageType
	stage_number?: number
	started_at: string
	ended_at: string | null
	creator_id: number
	clan_id: string | null
	_count: {
		screenshots: number
		attendance: number
	}
	victory: boolean
	total_score: number | null
	created_at: string
}

export interface StageScreenshot {
	id: number
	ai_status: 'pending' | 'processing' | 'done' | 'error'
	ai_error: string | null
	victory: boolean | null
	created_at: string
	file_path: string
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
	ai_summary: StageSummary | null
}

interface StageSummaryPlayer {
	name: string
	role: string | null
	kills: number
	deaths: number
	assists: number
	score: number
	appearances: number
	best_kills: number
}

export interface StageSummary {
	screenshots_analyzed: number
	total_score: number | null
	opponent_score: number | null
	teams: Array<{
		name: string
		score: number | null
		is_player_clan: boolean
	}>
	screens: Array<{ screenshot_id: number; score: number | null }>
	players: StageSummaryPlayer[]
	victory: boolean
	generated_at: string
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
	map_name: string
	type: StageType
	started_at: string
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

export interface AttendanceMonth {
	month: string
	days: Array<{
		date: string
		sessions: Array<{
			id: number
			type: StageType
			stage_number: number | null
		}>
	}>
	members: Array<{
		name: string
		days: Record<
			string,
			Array<{
				session_id: number
				status: AttendanceStatus
				note: string | null
			}>
		>
	}>
}

export interface SyncResponse {
	clan_id: string
	member_count: number
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
	squad_id: number
	slot: number
	member_id: number
	member: ClanMember
}

export interface ClanSquadRequest {
	id: number
	squad_id: number
	member_id: number
	member: ClanMember
	created_at: string
}

export interface ClanSquad {
	id: number
	clan_id: string
	name: string
	map: SquadMap
	created_by: number
	members: ClanSquadMember[]
	leader_id: number | null
	leader: ClanSquadMember | null
	requests: ClanSquadRequest[]
	created_at: string
	updated_at: string
}

interface GoldDropAttendee {
	id: number
	drop_id: number
	member_id: number
	member: ClanMember
}

export interface GoldDrop {
	id: number
	clan_id: string
	date: string
	status: GoldDropStatus
	created_at: string
	attendees: GoldDropAttendee[]
}

interface AbsenceEvent {
	event_type: AbsenceEventType
	stages?: number[]
}

export interface Absence {
	id: number
	clan_id: string
	user_id: number
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
	boxes: GrenadeBoxEntry[]
}

export interface GrenadeStagesResponse {
	events: GrenadeStageEvent[]
}

export interface GrenadeAllTimeResponse {
	members: GrenadeStageMember[]
}

export interface ClanMemberNote {
	id: number
	member_id: number
	author_id: number
	content: string
	created_at: Date
	updated_at: Date
	author: ClanMemberUser
}

export interface ClanMemberNoteWithMember extends ClanMemberNote {
	member: { id: number; name: string }
}

export interface GrenadeBoxEntry {
	name: string
	type: string
	count: number
}

export interface GrenadeBoxesResponse {
	boxes: GrenadeBoxEntry[]
}

export type BoostMode = 'ISSUED' | 'SELF'

export interface ListingItem {
	id: string
	name: string
}

export interface ConsumableListingItem extends ListingItem {
	category: string
}

export interface ClanBoostOrder {
	id: number
	clan_id: string
	date: string
	player_id: number
	item_id: string
	item_name: string
	count: number
	player: { id: number; name: string }
	created_at: string
}

export interface ClanBoostOrdersResponse {
	orders: ClanBoostOrder[]
}
