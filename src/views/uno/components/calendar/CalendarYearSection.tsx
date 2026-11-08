'use client'

import { Icon } from '@iconify/react'
import { CalendarMonthCard } from './CalendarMonthCard'
import type { CalendarMonth } from './calendar.types'

export function CalendarYearSection({
	year,
	months,
	weekdays,
}: {
	year: number
	months: CalendarMonth[]
	weekdays: string[]
}) {
	return (
		<section className="space-y-4">
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2">
					<Icon
						className="text-primary"
						icon="lucide:calendar-days"
					/>
					<h2 className="font-semibold text-2xl">{year}</h2>
				</div>
				<div className="h-px flex-1 bg-primary/20" />
				<span className="font-mono font-semibold text-muted-foreground text-xs">
					{months.length} / 12
				</span>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				{months.map((month) => (
					<CalendarMonthCard
						key={month.key}
						month={month}
						weekdays={weekdays}
					/>
				))}
			</div>
		</section>
	)
}
