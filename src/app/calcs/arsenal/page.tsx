import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { arsenalQueries } from '@/queries/calcs/arsenal.queries'
import { ArsenalView } from '@/views/calcs/arsenal/ArsenalView'

export default async function ArsenalPage() {
	const queryClient = getQueryClient()

	queryClient.prefetchQuery(arsenalQueries.get())

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ArsenalView />
		</HydrationBoundary>
	)
}
