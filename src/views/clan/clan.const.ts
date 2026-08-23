export const RANK_ORDER: Record<string, number> = {
	LEADER: 0,
	COLONEL: 1,
	OFFICER: 2,
	SERGEANT: 3,
	SOLDIER: 4,
	COMMONER: 5,
	RECRUIT: 6,
}

export const RANK_COLORS: Record<string, string> = {
	LEADER: 'bg-yellow-500/20 ring-yellow-500/40 text-yellow-600 dark:text-yellow-400',
	COLONEL: 'bg-red-500/20 ring-red-500/40 text-red-600 dark:text-red-400',
	OFFICER: 'bg-blue-500/20 ring-blue-500/40 text-blue-600 dark:text-blue-400',
	SERGEANT:
		'bg-green-500/20 ring-green-500/40 text-green-600 dark:text-green-400',
	SOLDIER:
		'bg-neutral-500/20 ring-neutral-500/40 text-muted-foreground',
	COMMONER: 'bg-neutral-500/10 ring-neutral-500/40 text-muted-foreground',
	RECRUIT: 'bg-neutral-500/10 text-muted-foreground',
}

export const STAGE_TYPE_COLORS: Record<string, string> = {
	TOURNAMENT:
		'bg-yellow-500/20 ring-yellow-400/40 text-yellow-600 dark:text-yellow-400',
	BRAWL: 'bg-red-500/20 ring-red-400/40  text-red-600 dark:text-red-400',
	BASE_CAPTURE:
		'bg-blue-500/20 ring-blue-400/40  text-blue-600 dark:text-blue-400',
}

export const OFFICER_RANKS = new Set(['OFFICER', 'COLONEL', 'LEADER'])
