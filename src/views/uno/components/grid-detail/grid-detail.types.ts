import type { UnoGridClan, UnoGridMatch } from '@/types/uno/uno.type'

export interface MatchRecord {
	wins: number
	losses: number
}

export interface MatchView {
	match: UnoGridMatch
	record: MatchRecord
}

export interface StageView {
	number: number
	matches: MatchView[]
}

export interface ResultGroup extends MatchRecord {
	key: string
	clans: UnoGridClan[]
}
