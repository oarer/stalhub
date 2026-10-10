import type { BPOverloadMode } from '../utils/bp'

export interface BPFormState {
	currentLevel: number
	targetLevel: number
	deadlineISO: string
	tasksPerDay: number
	weekdays: boolean[]
	overloadMode: BPOverloadMode
	overloadStock: number
	donationPacks: number
	boostOn: boolean
	boostStartISO: string
	boostDays: number
}

export const ALL_WEEK = [true, true, true, true, true, true, true]
