import type { UnoCalendarDay } from '@/types/uno/uno.type'

export type CalendarMonth = {
	key: string
	year: number
	month: number
	items: UnoCalendarDay[]
	byDate: Map<string, UnoCalendarDay[]>
}
