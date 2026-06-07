import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { TTKView } from '@/views/calcs/ttk/TTKView'

export default async function TTKPage() {
	const queryClient = getQueryClient()

	await Promise.all([
		queryClient.prefetchQuery(itemsQueries.get({ type: 'weapons' })),
		queryClient.prefetchQuery(itemsQueries.get({ type: 'ammo' })),
		queryClient.prefetchQuery(itemsQueries.get({ type: 'plates' })),
		queryClient.prefetchQuery(itemsQueries.get({ type: 'armor' })),
		queryClient.prefetchQuery(itemsQueries.get({ type: 'containers' })),
		queryClient.prefetchQuery(itemsQueries.get({ type: 'artefact' })),
		queryClient.prefetchQuery(itemsQueries.get({ type: 'consumables' })),
	])

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<TTKView />
		</HydrationBoundary>
	)
}
