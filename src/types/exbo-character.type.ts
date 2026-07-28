import type { Regions } from './api.type'

export interface CharacterInformation {
	id: string
	name: string
	creationTime: string
}

export interface CharacterClanInfo {
	id: string
	name: string
	level: number
	registrationTime: string
	alliance: string
	description: string
	leader: string
}

export interface CharacterClanMember {
	name: string
	rank: string
	joinTime: string
}

export interface CharacterClan {
	info: CharacterClanInfo
	member: CharacterClanMember
}

export interface CharacterEntry {
	information: CharacterInformation
	clan: CharacterClan
}
