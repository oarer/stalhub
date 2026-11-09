'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { unoQueries } from '@/queries/uno/uno.queries'
import type { UnoDateRangeParams } from '@/types/uno/uno.type'
import { CalendarYearSection } from './components/calendar/CalendarYearSection'
import {
	buildMonths,
	CALENDAR_DAYS,
	formatWeekday,
} from './components/calendar/calendar.utils'
import { UnoDateRangeForm } from './components/UnoDateRangeForm'
import { UnoEmpty } from './components/UnoEmpty'
import { UnoFeedback } from './components/UnoFeedback'
import { UnoPageHeader } from './components/UnoPageHeader'
import { useUnoLocale } from './hooks/useUnoLocale'

export default function UnoCalendarView({
	params,
}: {
	params: UnoDateRangeParams
}) {
	const t = useTranslations('uno')
	const locale = useUnoLocale()
	const query = useQuery(unoQueries.calendar(params))
	const items = query.data?.items ?? []
	const months = buildMonths(items)
	const years = [...new Set(months.map((month) => month.year))]
	const weekdays = Array.from({ length: CALENDAR_DAYS }, (_, index) =>
		formatWeekday(locale, index)
	)

	return (
		<section className="mx-auto max-w-380 space-y-8 px-4 pt-32 pb-12 sm:px-6">
			<UnoPageHeader
				backHref="/uno"
				description={t('calendar.description')}
				title={t('calendar.title')}
			/>

			<UnoDateRangeForm action="/uno/calendar" params={params} />

			{query.data?.season && (
				<p className="text-muted-foreground text-sm">
					{t('filters.season')}:{' '}
					<span className="font-medium text-foreground">
						{query.data.season}
					</span>
				</p>
			)}

			<UnoFeedback
				isError={query.isError}
				isLoading={query.isPending}
				onRetry={() => void query.refetch()}
			>
				{months.length === 0 ? (
					<UnoEmpty>{t('calendar.empty')}</UnoEmpty>
				) : (
					<div className="space-y-10">
						{years.map((year) => (
							<CalendarYearSection
								key={year}
								months={months.filter(
									(month) => month.year === year
								)}
								weekdays={weekdays}
								year={year}
							/>
						))}
					</div>
				)}
			</UnoFeedback>
		</section>
	)
}
