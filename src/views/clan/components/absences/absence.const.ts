import type { AbsenceEventType } from '@/types/clan/clan.type'

export const EVENT_OPTIONS: {
	value: AbsenceEventType
	label: string
	maxStages: number
}[] = [
	{ value: 'TOURNAMENT', label: 'clan.events.TOURNAMENT', maxStages: 3 },
	{ value: 'BRAWL', label: 'clan.events.BRAWL', maxStages: 3 },
	{ value: 'BASE_CAPTURE', label: 'clan.events.BASE_CAPTURE', maxStages: 4 },
	{ value: 'GOLD_DROP', label: 'clan.events.GOLD_DROP', maxStages: 0 },
]

export const DEADLINE_MSK_HOUR = 19
export const DEADLINE_MSK_HOUR_STRING = String(DEADLINE_MSK_HOUR).padStart(
	2,
	'0'
)
