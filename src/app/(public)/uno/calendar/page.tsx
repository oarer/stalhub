import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { unoQueries } from '@/queries/uno/uno.queries'
import type { UnoDateRangeParams } from '@/types/uno/uno.type'
import UnoCalendarView from '@/views/uno/UnoCalendarView'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const queryValue = (value: string | string[] | undefined) =>
	Array.isArray(value) ? (value[0] ?? '') : (value ?? '')

const parseParams = (
	query: Record<string, string | string[] | undefined>
): UnoDateRangeParams => {
	const mode = queryValue(query.mode)
	return {
		from: queryValue(query.from) || undefined,
		to: queryValue(query.to) || undefined,
		date: queryValue(query.date) || undefined,
		mode:
			mode === 'brawl' || mode === 'tournament' || mode === 'base_capture'
				? mode
				: undefined,
		season: queryValue(query.season) || undefined,
		timezone: queryValue(query.timezone) || undefined,
	}
}

export default async function UnoCalendarPage({
	searchParams,
}: {
	searchParams: SearchParams
}) {
	const params = parseParams(await searchParams)
	const queryClient = getQueryClient()
	await queryClient.prefetchQuery(unoQueries.calendar(params))
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<UnoCalendarView params={params} />
		</HydrationBoundary>
	)
}
