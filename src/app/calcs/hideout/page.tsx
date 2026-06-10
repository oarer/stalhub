import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { hideoutQueries } from '@/queries/calcs/hideout.queries'
import { HideoutView } from '@/views/calcs/hideout/HideoutView'

export default async function HideoutPage() {
	const queryClient = getQueryClient()

	queryClient.prefetchQuery(hideoutQueries.get())

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<HideoutView />
		</HydrationBoundary>
	)
}
