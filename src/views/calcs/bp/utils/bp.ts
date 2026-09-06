export const BP_XP_PER_LEVEL = 1000
export const BP_OPTIMAL_TASKS_PER_DAY = 15
export const BP_BOOST_DAYS = 3
export const BP_BOOST_MULT = 1.5
export const BP_DONATION_LEVELS = 50
export const BP_DONATION_PRICE = 1500

const DAY_MS = 86_400_000

const seasonStartMonths = [2, 5, 8, 11]

const firstWednesday = (year: number, month: number) => {
	const first = new Date(year, month, 1)
	const diff = (3 - first.getDay() + 7) % 7
	return new Date(year, month, 1 + diff)
}

export const seasonIndex = (month: number) => {
	if (month >= 2 && month <= 4) return 0
	if (month >= 5 && month <= 7) return 1
	if (month >= 8 && month <= 10) return 2
	return 3
}

export const seasonStartDate = (date: Date) => {
	const i = seasonIndex(date.getMonth())
	let year = date.getFullYear()
	if (i === 3 && date.getMonth() <= 1) year -= 1
	return firstWednesday(year, seasonStartMonths[i])
}

export const nextSeasonStartDate = (date: Date) => {
	const start = seasonStartDate(date)
	const nextMonth = (start.getMonth() + 3) % 12
	const year = start.getFullYear() + (start.getMonth() + 3 >= 12 ? 1 : 0)
	return firstWednesday(year, nextMonth)
}

export const computeDaysUntilSeasonEnd = (date: Date) =>
	Math.floor((nextSeasonStartDate(date).getTime() - date.getTime()) / DAY_MS)

export interface BPInput {
	currentLevel: number
	targetLevel: number
	daysLeft: number
	maxTasksPerDay: number
	donations: number
	overloads: boolean
	boost3d: boolean
}

export interface BPPlan {
	currentLevel: number
	targetLevel: number
	daysLeft: number
	donationLevels: number
	neededXP: number
	daysNeeded: number
	daysWithoutOverload: number
	tasksPerDay: number
	xpPerDay: number
	loadBonus: number
	boostBonus: number
	reachable: boolean
}

const getDailyXP = (tasks: number, overloads: boolean) => {
	let xp = 0

	for (let i = 1; i <= tasks; i++) {
		if (i <= 7) xp += 500
		else if (i <= 15) xp += 250
		else if (i <= 45) xp += 75
		else xp += 25

		if (overloads && i <= 15) {
			xp += 250
		}
	}

	return xp
}

const getWeeklyXP = (tasks: number) => {
	let xp = 0

	if (tasks >= 15) xp += 3000
	if (tasks >= 45) xp += 5000
	if (tasks >= 100) xp += 12000

	return xp
}

export const simulateXP = (
	totalDays: number,
	tasksPerDay: number,
	overloads: boolean,
	boostDays: number
) => {
	let totalXP = 0
	let weeklyTasks = 0

	for (let day = 1; day <= totalDays; day++) {
		let daily = getDailyXP(tasksPerDay, overloads)
		if (day <= boostDays) {
			daily = Math.round(daily * BP_BOOST_MULT)
		}

		totalXP += daily
		weeklyTasks += tasksPerDay

		if (day % 7 === 0) {
			totalXP += getWeeklyXP(weeklyTasks)
			weeklyTasks = 0
		}
	}

	if (weeklyTasks > 0) {
		totalXP += getWeeklyXP(weeklyTasks)
	}

	return totalXP
}

export const buildBPPlan = (input: BPInput): BPPlan => {
	const tasksPerDay = Math.max(1, Math.round(input.maxTasksPerDay))
	const boostDays = input.boost3d ? BP_BOOST_DAYS : 0

	const necessaryDonationLevels = Math.min(
		input.donations * BP_DONATION_LEVELS,
		Math.max(0, input.targetLevel - input.currentLevel)
	)
	const neededXP = Math.max(
		0,
		(input.targetLevel - input.currentLevel - necessaryDonationLevels) *
			BP_XP_PER_LEVEL
	)

	const findDays = (xp: number, overloads: boolean) => {
		let days = 0
		while (simulateXP(days, tasksPerDay, overloads, boostDays) < xp) {
			days++
		}
		return days
	}

	const daysNeeded = findDays(neededXP, input.overloads)
	const daysWithoutOverload = findDays(neededXP, false)

	const totalXP = simulateXP(
		daysNeeded,
		tasksPerDay,
		input.overloads,
		boostDays
	)

	const loadBonus =
		simulateXP(daysNeeded, tasksPerDay, true, boostDays) -
		simulateXP(daysNeeded, tasksPerDay, false, boostDays)
	const boostBonus =
		simulateXP(daysNeeded, tasksPerDay, input.overloads, boostDays) -
		simulateXP(daysNeeded, tasksPerDay, input.overloads, 0)

	return {
		currentLevel: input.currentLevel,
		targetLevel: input.targetLevel,
		daysLeft: input.daysLeft,
		donationLevels: necessaryDonationLevels,
		neededXP,
		daysNeeded,
		tasksPerDay,
		xpPerDay: daysNeeded > 0 ? Math.round(totalXP / daysNeeded) : 0,
		loadBonus,
		boostBonus,
		daysWithoutOverload,
		reachable: neededXP <= 0 || daysNeeded <= input.daysLeft,
	}
}
