import { Alliance } from '@/types/player.type'

export const UNO_SKELETON_KEYS = [
	'one',
	'two',
	'three',
	'four',
	'five',
	'six',
] as const

export const FACTION_ALIASES: Record<string, Alliance> = {
	duty: Alliance.DUTY,
	freedom: Alliance.FREEDOM,
	merc: Alliance.MERC,
	mercenary: Alliance.MERC,
	covenant: Alliance.COVENANT,
	bandits: Alliance.BANDITS,
	bandit: Alliance.BANDITS,
	stalkers: Alliance.STALKERS,
	stalker: Alliance.STALKERS,
}

export const UNO_MODE_KEYS: Record<string, string> = {
	brawl: 'modes.brawl',
	tournament: 'modes.tournament',
	base_capture: 'modes.baseCapture',
}

export const UNO_METRIC_KEYS: Record<string, string> = {
	rating: 'compare.metrics.rating',
	position: 'compare.metrics.position',
	influence: 'compare.metrics.influence',
	level_raw: 'compare.metrics.levelRaw',
	member_limit: 'compare.metrics.memberLimit',
	member_count: 'compare.metrics.memberCount',
	fights: 'compare.metrics.fights',
	wins: 'compare.metrics.wins',
	losses: 'compare.metrics.losses',
	win_rate: 'compare.metrics.win_rate',
	grids: 'compare.metrics.grids',
	grids_won: 'compare.metrics.grids_won',
	best_client_place: 'compare.metrics.best_client_place',
	average_client_place: 'compare.metrics.average_client_place',
	monthly_grids: 'compare.metrics.monthly_grids',
}

export const UNO_SUMMARY_METRIC_KEYS = new Set(['fights', 'win_rate'])

export const UNO_RANK_COLORS: Record<string, string> = {
	S: 'text-yellow-500',
	A: 'text-rose-600',
	B: 'text-fuchsia-600',
	C: 'text-blue-500',
	D: 'text-green-400',
	E: 'text-neutral-400',
}

export const MAP_ALIASES: Record<string, string> = {
	hvoiny: 'khvoiny',
	khvoiny: 'khvoiny',
	nizina: 'nizina',
	small_berdovka: 'smallBerdovka',
	small_berdovka2: 'smallBerdovka2',
	kvartaly: 'kvartaly',
	roza_vetrov: 'rozaVetrov',
}
