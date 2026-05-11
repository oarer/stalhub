import type { Regions } from './api.type'
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
	displayedAchievements: Achievements[]
	clan: Clan
	stats: Stat[]
	role?: PlayerRole
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

export type ClanMemberRank =
	| 'RECRUIT'
	| 'COMMONER'
	| 'SOLDIER'
	| 'SERGEANT'
	| 'OFFICER'
	| 'COLONEL'
	| 'LEADER'

export interface ClanMember {
	name: string
	rank: ClanMemberRank
	joinTime: Date
}

export interface ClanInfo {
	id: string
	name: string
	tag: string
	level: number
	levelPoints: number
	registrationTime: Date
	alliance: string
	description: string
	leader: string
	memberCount: number
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

export const PLAYER_ROLE_META = {
	[Role.EXBO]: {
		label: 'команда проекта',
		description: 'Этот игрок связан с командой проекта.',
		gradient: 'from-sky-500 via-indigo-500 to-rose-500',
		accent: 'text-sky-500',
		border: 'border-sky-500/20',
		bg: 'bg-sky-500/10',
	},
	[Role.SCAMMER]: {
		label: 'мошенник',
		description: 'Этот игрок замечен за мошенническими действиями.',
		gradient: 'from-red-500 via-rose-500 to-orange-500',
		accent: 'text-red-500',
		border: 'border-red-500/20',
		bg: 'bg-red-500/10',
	},
	[Role.MEDIA]: {
		label: 'медийка',
		description: 'Этот игрок относится к медийным личностям проекта.',
		gradient: 'from-red-500 via-fuchsia-500 to-violet-500',
		accent: 'text-fuchsia-500',
		border: 'border-fuchsia-500/20',
		bg: 'bg-fuchsia-500/10',
	},
	[Role.STALHUB]: {
		label: 'команда игры',
		description: 'Этот игрок связан с командой игры.',
		gradient: 'from-sky-600 via-cyan-500 to-blue-500',
		accent: 'text-sky-400',
		border: 'border-sky-500/20',
		bg: 'bg-sky-500/10',
	},
} as const

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
