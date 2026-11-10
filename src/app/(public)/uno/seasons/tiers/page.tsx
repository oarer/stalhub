import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { unoQueries } from '@/queries/uno/uno.queries'
import UnoSeasonTiersView from '@/views/uno/UnoSeasonTiersView'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const queryValue = (value: string | string[] | undefined) =>
	Array.isArray(value) ? (value[0] ?? '') : (value ?? '')

export default async function UnoSeasonTiersPage({
	searchParams,
}: {
	searchParams: SearchParams
}) {
	const query = await searchParams
	const season = queryValue(query.season) || undefined
	const queryClient = getQueryClient()
	if (season) {
		await queryClient.prefetchQuery(unoQueries.seasonTiers(season))
	}
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<UnoSeasonTiersView season={season} />
		</HydrationBoundary>
	)
}
