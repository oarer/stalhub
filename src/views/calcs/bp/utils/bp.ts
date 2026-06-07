export const getDailyXP = (tasks: number, overloads: number) => {
	let xp = 0
	const effectiveOverloads = Math.min(overloads, 15)

	for (let i = 1; i <= tasks; i++) {
		if (i <= 7) xp += 500
		else if (i <= 15) xp += 250
		else if (i <= 45) xp += 75
		else xp += 25

		if (i <= 15 && i <= effectiveOverloads) {
			xp += 250
		}
	}

	return xp
}

export const getWeeklyXP = (tasks: number) => {
	let xp = 0

	if (tasks >= 15) xp += 3000
	if (tasks >= 45) xp += 5000
	if (tasks >= 100) xp += 12000

	return xp
}

const isPlayDay = (day: number, playDaysPerWeek: number) => {
	if (playDaysPerWeek === 7) return true
	const interval = 7 / playDaysPerWeek
	return Math.floor(((day - 1) % 7) / interval) === 0
}

export const simulateXP = (
	totalDays: number,
	playDaysPerWeek: number,
	tasksPerDay: number,
	overloads: number
) => {
	let totalXP = 0
	let weeklyTasks = 0

	for (let day = 1; day <= totalDays; day++) {
		if (isPlayDay(day, playDaysPerWeek)) {
			const dailyXP = getDailyXP(tasksPerDay, overloads)
			totalXP += dailyXP
			weeklyTasks += tasksPerDay
		}

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
