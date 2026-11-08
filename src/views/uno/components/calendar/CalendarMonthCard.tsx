'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useUnoLocale } from '../../hooks/useUnoLocale'
import { formatUnoValue } from '../../utils/uno.utils'
import type { CalendarMonth } from './calendar.types'
import {
	formatMode,
	formatMonth,
	getMondayOffset,
	getMonthDays,
} from './calendar.utils'

export function CalendarMonthCard({
	month,
	weekdays,
}: {
	month: CalendarMonth
	weekdays: string[]
}) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()
	const daysInMonth = getMonthDays(month.year, month.month)
	const offset = getMondayOffset(month.year, month.month)
	const cells = Array.from(
		{ length: offset + daysInMonth },
		(_, index) => index - offset + 1
	)
	const totalGrids = month.items.reduce(
		(sum, item) => sum + (item.gridsCount ?? 0),
		0
	)

	return (
		<Card.Root className="gap-0 overflow-hidden p-0">
			<div className="flex items-end justify-between gap-3 border-primary/20 border-b px-4 py-3">
				<div>
					<h3 className="font-semibold text-lg capitalize">
						{formatMonth(locale, month.year, month.month)}
					</h3>
					<p className="font-mono font-semibold text-muted-foreground text-xs">
						{formatUnoValue(totalGrids, locale)}{' '}
						{t('calendar.gridsCount').toLowerCase()}
					</p>
				</div>
				<Badge variant="secondary">
					{month.items.length}{' '}
					{t('calendar.days', { count: month.items.length })}
				</Badge>
			</div>

			<div className="grid grid-cols-7 border-primary/15 border-b bg-primary/5 px-2 py-2 sm:px-3">
				{weekdays.map((weekday) => (
					<span
						className="text-center font-mono font-semibold text-[10px] text-muted-foreground uppercase"
						key={weekday}
					>
						{weekday}
					</span>
				))}
			</div>

			<div className="grid grid-cols-7 bg-primary/10">
				{cells.map((day) => {
					if (day < 1) {
						return <div key={`empty-${day}`} />
					}

					const dateKey = `${month.key}-${String(day).padStart(2, '0')}`
					const dateItems = month.byDate.get(dateKey) ?? []
					return (
						<div
							className={`min-h-24 bg-card/75 p-2 ring-1 ring-accent ${dateItems.length > 0 ? 'ring-1 ring-primary/20 ring-inset' : ''}`}
							key={dateKey}
						>
							<span
								className={`font-mono font-semibold text-xs ${dateItems.length > 0 ? 'text-primary' : 'text-muted-foreground'}`}
							>
								{day}
							</span>
							{dateItems.length > 0 && (
								<div className="mt-2 space-y-1">
									{dateItems.map((item) => (
										<div
											className="truncate rounded bg-primary/10 px-1.5 py-1 font-medium text-[10px]"
											key={item.key}
											title={formatMode(t, item.mode)}
										>
											{formatMode(t, item.mode)}
											{item.gridsCount !== null && (
												<span className="ml-1 font-mono font-semibold text-muted-foreground">
													×
													{formatUnoValue(
														item.gridsCount,
														locale
													)}
												</span>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					)
				})}
			</div>
		</Card.Root>
	)
}
