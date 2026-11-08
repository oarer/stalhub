import type { useTranslations } from 'next-intl'
import type { UnoCalendarDay } from '@/types/uno/uno.type'
import { UNO_MODE_KEYS } from '../../utils/uno.const'
import type { CalendarMonth } from './calendar.types'

export const CALENDAR_DAYS = 7
export const CALENDAR_ANCHOR = new Date(2024, 0, 1)

export function getDateKey(value: string | null): string | null {
	if (!value) return null
	const match = value.match(/^\d{4}-\d{2}-\d{2}/)
	return match?.[0] ?? null
}

export function buildMonths(items: UnoCalendarDay[]): CalendarMonth[] {
	const byMonth = new Map<string, UnoCalendarDay[]>()

	for (const item of items) {
		const dateKey = getDateKey(item.date)
		if (!dateKey) continue
		const monthKey = dateKey.slice(0, 7)
		const monthItems = byMonth.get(monthKey) ?? []
		monthItems.push(item)
		byMonth.set(monthKey, monthItems)
	}

	return [...byMonth.entries()]
		.sort(([left], [right]) => right.localeCompare(left))
		.map(([key, monthItems]) => {
			const [year, month] = key.split('-').map(Number)
			const byDate = new Map<string, UnoCalendarDay[]>()
			for (const item of monthItems) {
				const dateKey = getDateKey(item.date)
				if (!dateKey) continue
				const dateItems = byDate.get(dateKey) ?? []
				dateItems.push(item)
				byDate.set(dateKey, dateItems)
			}
			return { key, year, month: month - 1, items: monthItems, byDate }
		})
}

export function getMonthDays(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate()
}

export function getMondayOffset(year: number, month: number): number {
	return (new Date(year, month, 1).getDay() + 6) % CALENDAR_DAYS
}

export function formatMonth(
	locale: string,
	year: number,
	month: number
): string {
	return new Intl.DateTimeFormat(locale, {
		month: 'long',
		year: 'numeric',
	}).format(new Date(year, month, 1))
}

export function formatWeekday(locale: string, dayOffset: number): string {
	return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
		new Date(
			CALENDAR_ANCHOR.getFullYear(),
			CALENDAR_ANCHOR.getMonth(),
			CALENDAR_ANCHOR.getDate() + dayOffset
		)
	)
}

export function formatMode(
	t: ReturnType<typeof useTranslations<'uno'>>,
	mode: string | null
): string {
	return mode ? t(UNO_MODE_KEYS[mode] ?? 'unknown') : t('unknown')
}
