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
					<h2 className="text-2xl font-semibold">{year}</h2>
				</div>
				<div className="bg-primary/20 h-px flex-1" />
				<span className="text-muted-foreground font-mono text-xs font-semibold">
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
