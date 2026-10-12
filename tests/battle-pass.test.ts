import { expect, test } from 'bun:test'
import {
	type BPSimInput,
	seasonDeadline,
	simulateBP,
	simulateXP,
	toISODate,
} from '@/views/calcs/bp/utils/bp'

const input: BPSimInput = {
	startISO: '2026-01-05',
	deadlineISO: '2026-01-11',
	currentLevel: 0,
	targetLevel: 100,
	tasksPerDay: 15,
	weekdays: [true, true, true, true, true, true, true],
	overloadMode: 'off',
	overloadStock: 0,
	donationPacks: 0,
	boostOn: false,
	boostStartISO: '2026-01-05',
	boostDays: 3,
}

test.each([
	[7, 3500],
	[15, 5500],
	[25, 6250],
	[45, 7750],
	[46, 7775],
])('daily %s tasks follow diminishing XP bands', (tasks, xp) => {
	const result = simulateBP({
		...input,
		deadlineISO: input.startISO,
		tasksPerDay: tasks,
	})
	expect(result.totalXP).toBe(xp)
})

test('seventh gaming day grants weekly thresholds and sums cumulative XP', () => {
	const result = simulateBP(input)
	expect(result.gamingDays).toBe(7)
	expect(result.totalXP).toBe(58500)
	expect(result.projectedLevel).toBe(58)
	expect(result.days.map((d) => d.weeklyBonus)).toEqual([
		0, 0, 0, 0, 0, 0, 20000,
	])
	expect(result.days.at(-1)?.cumXP).toBe(58500)
})

test('weekly reward counts gaming days, not calendar weeks', () => {
	const result = simulateBP({
		...input,
		deadlineISO: '2026-01-13',
		weekdays: [true, true, true, true, true, false, false],
	})
	expect(result.gamingDays).toBe(7)
	expect(result.days[6].xp).toBe(0)
	expect(result.days[8].weeklyBonus).toBe(20000)
})

test('stock overload consumes only gaming days and boost end is exclusive', () => {
	const result = simulateBP({
		...input,
		overloadMode: 'stock',
		overloadStock: 2,
		boostOn: true,
	})
	expect(result.days.map((d) => d.overloaded)).toEqual([
		true,
		true,
		false,
		false,
		false,
		false,
		false,
	])
	expect(result.days.map((d) => d.boosted)).toEqual([
		true,
		true,
		true,
		false,
		false,
		false,
		false,
	])
	expect(result.days.slice(0, 4).map((d) => d.xp)).toEqual([
		13875, 13875, 8250, 5500,
	])
})

test('donations cannot exceed target and reach date leaves spare gaming days', () => {
	const result = simulateBP({ ...input, currentLevel: 90, donationPacks: 2 })
	expect(result.donationLevels).toBe(10)
	expect(result.reachedISO).toBe(input.startISO)
	expect(result.spareGamingDays).toBe(6)
	expect(result.deficitLevels).toBe(0)
})

test('reversed date range becomes a single day and tasks clamp to one', () => {
	const result = simulateBP({
		...input,
		deadlineISO: '2026-01-01',
		tasksPerDay: 0,
	})
	expect(result.days).toHaveLength(1)
	expect(result.totalXP).toBe(500)
})

test('no selected weekdays earns nothing', () => {
	const result = simulateBP({ ...input, weekdays: [] })
	expect(result.gamingDays).toBe(0)
	expect(result.totalXP).toBe(0)
	expect(result.reachedISO).toBeNull()
})

test('legacy XP credits partial-week bonuses, unlike calendar simulation', () => {
	expect(simulateXP(1, 15, false, 0)).toBe(8500)
	expect(simulateBP({ ...input, deadlineISO: input.startISO }).totalXP).toBe(
		5500
	)
})

test.each([
	['2026-01-05', '2026-03-03'],
	['2026-12-15', '2027-03-02'],
])('season deadline across %s is %s', (date, expected) => {
	expect(toISODate(seasonDeadline(new Date(`${date}T12:00:00`)))).toBe(
		expected
	)
})
