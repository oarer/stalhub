import type { Regions } from './api.type'
import type { ClanHistoryEntry } from './clan/clan.type'
import type { Message } from './item.type'

export interface PlayerRole {
	role: Role
	description: string | null
}

export interface PlayerResponse {
	username: string
	uuid: string
	status: string
	alliance: Alliance
	lastLogin: Date
	displayedAchievements?: Achievements[]
	clan: Clan
	stats: Stat[]
	role?: PlayerRole
	clan_history?: ClanHistoryEntry[]
}
export interface PlayerParams {
	region: Regions
	character: string
}

export type Achievements = string

export type StatType = 'INTEGER' | 'DECIMAL' | 'DATE' | 'DURATION'
export type StatCategory =
	| 'EXPLORATION'
	| 'COMBAT'
	| 'SESSION_MODES'
	| 'ECONOMY'
	| 'NONE'
	| 'HIDEOUT'
type StatValue = number | Date | string

export interface Stat {
	id: string
	type: StatType
	value: StatValue
}

type ClanMemberRank =
	| 'RECRUIT'
	| 'COMMONER'
	| 'SOLDIER'
	| 'SERGEANT'
	| 'OFFICER'
	| 'COLONEL'
	| 'LEADER'

interface ClanMember {
	name: string
	rank: ClanMemberRank
	join_time: Date
}

interface ClanInfo {
	id: string
	name: string
	tag: string
	level: number
	levelPoints: number
	registrationTime: Date
	alliance: string
	description: string
	leader: string
	member_count: number
}

export interface Clan {
	info: ClanInfo
	member: ClanMember
}

export enum Role {
	EXBO = 'EXBO',
	SCAMMER = 'SCAMMER',
	MEDIA = 'MEDIA',
	STALHUB = 'STALHUB',
}


export interface PlayerStatsResponse {
	uuid: string
	username: string
	alliance: string
	region: Regions
	role?: Role
	views?: number
}

// Static json with keys from db
export interface DBStats {
	id: string
	category: StatCategory
	type: StatType
	name: Message
}

export interface DBAchievements {
	id: string
	title: Message
	description?: Message
	points: number
}

// Ranks

export enum Rank {
	LEADER = 'LEADER',
	COLONEL = 'COLONEL',
	OFFICER = 'OFFICER',
	SERGEANT = 'SERGEANT',
	SOLDIER = 'SOLDIER',
	COMMONER = 'COMMONER',
	RECRUIT = 'RECRUIT',
}
export const rankColors: Record<Rank, string> = {
	[Rank.LEADER]: 'yellow-500',
	[Rank.COLONEL]: 'orange-500',
	[Rank.OFFICER]: 'blue-500',
	[Rank.SERGEANT]: 'green-500',
	[Rank.SOLDIER]: 'gray-500',
	[Rank.COMMONER]: 'gray-400',
	[Rank.RECRUIT]: 'gray-300',
}

// Alliance

export enum Alliance {
	MERC = 'merc',
	COVENANT = 'covenant',
	FREEDOM = 'freedom',
	DUTY = 'duty',
	BANDITS = 'bandits',
	STALKERS = 'stalkers',
}

export const allianceColors: Record<Alliance, string> = {
	[Alliance.MERC]:
		'bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent',
	[Alliance.COVENANT]:
		'bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent',
	[Alliance.FREEDOM]:
		'bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent',
	[Alliance.DUTY]:
		'bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent',
	[Alliance.BANDITS]:
		'bg-gradient-to-r from-neutral-400 to-neutral-600 bg-clip-text text-transparent',
	[Alliance.STALKERS]:
		'bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent',
}

// DB formate

type DecimalFormatConfig = {
	divisor: number
	unit?: string
	precision: number
}

export const decimalConfig: Record<string, DecimalFormatConfig> = {
	'foo-eat': {
		divisor: 1,
		unit: 'kg',
		precision: 2,
	},
	'dam-dea-pla': {
		divisor: 1,
		unit: 'unit',
		precision: 0,
	},
	'dam-rec-pla': {
		divisor: 1,
		unit: 'unit',
		precision: 0,
	},
	'dam-dea-all': {
		divisor: 1,
		unit: 'unit',
		precision: 0,
	},
	'dam-rec-all': {
		divisor: 1,
		unit: 'unit',
		precision: 0,
	},
	'dam-exp': {
		divisor: 1,
		unit: 'unit',
		precision: 0,
	},
	'scout-powerful-shot-damage-ops': {
		divisor: 1,
		unit: 'unit',
		precision: 0,
	},
	'scout-powerful-shot-max-damage-ops': {
		divisor: 1,
		unit: 'unit',
		precision: 0,
	},
	'support-healed-ops': {
		divisor: 1,
		unit: 'unit',
		precision: 0,
	},
	'tank-damage-delayed-ops': {
		divisor: 1,
		unit: 'unit',
		precision: 0,
	},
	'tank-ultimate-max-damage-ops': {
		divisor: 1,
		unit: 'unit',
		precision: 0,
	},
}
