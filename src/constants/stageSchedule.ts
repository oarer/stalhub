interface StageWindow {
	stage: number
	start: [number, number]
	end: [number, number]
}

export interface StageScheduleEntry {
	days: number[]
	stages: StageWindow[]
}

export const STAGE_SCHEDULE: Record<string, StageScheduleEntry> = {
	TOURNAMENT: {
		days: [4, 5, 6],
		stages: [
			{ stage: 1, start: [20, 0], end: [20, 25] },
			{ stage: 2, start: [20, 25], end: [20, 50] },
			{ stage: 3, start: [20, 50], end: [21, 15] },
		],
	},
	BRAWL: {
		days: [1, 2, 3, 0],
		stages: [
			{ stage: 1, start: [20, 0], end: [20, 25] },
			{ stage: 2, start: [20, 25], end: [20, 50] },
			{ stage: 3, start: [20, 50], end: [21, 15] },
		],
	},
	BASE_CAPTURE: {
		days: [0],
		stages: [
			{ stage: 1, start: [19, 0], end: [19, 25] },
			{ stage: 2, start: [19, 25], end: [19, 50] },
			{ stage: 3, start: [19, 50], end: [20, 15] },
			{ stage: 4, start: [20, 15], end: [20, 40] },
		],
	},
}

const TYPE_PRIORITY = ['TOURNAMENT', 'BRAWL', 'BASE_CAPTURE']

export interface DetectedStage {
	type: string
	stage: number
}

function toMinutes(hour: number, minute: number): number {
	return hour * 60 + minute
}

export function detectStageFromNow(
	date: Date = new Date()
): DetectedStage | null {
	const day = date.getDay()
	const minutes = date.getHours() * 60 + date.getMinutes()
	for (const type of TYPE_PRIORITY) {
		const entry = STAGE_SCHEDULE[type]
		if (!entry || !entry.days.includes(day)) continue
		for (const w of entry.stages) {
			const start = toMinutes(w.start[0], w.start[1])
			const end = toMinutes(w.end[0], w.end[1])
			if (minutes >= start && minutes < end) {
				return { type, stage: w.stage }
			}
		}
	}
	return null
}
