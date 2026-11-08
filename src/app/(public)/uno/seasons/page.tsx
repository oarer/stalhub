import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { unoQueries } from '@/queries/uno/uno.queries'
import UnoSeasonsView from '@/views/uno/UnoSeasonsView'

export default async function UnoSeasonsPage() {
	const queryClient = getQueryClient()
	await queryClient.prefetchQuery(unoQueries.seasons())

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<UnoSeasonsView />
		</HydrationBoundary>
	)
}
