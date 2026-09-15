import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { TTKView } from '@/views/calcs/ttk/TTKView'

export default async function TTKPage() {
	const queryClient = getQueryClient()

	await Promise.all([
		queryClient.fetchQuery(itemsQueries.get({ type: 'weapons' })),
		queryClient.fetchQuery(itemsQueries.get({ type: 'ammo' })),
		queryClient.fetchQuery(itemsQueries.get({ type: 'plates' })),
		queryClient.fetchQuery(itemsQueries.get({ type: 'armor' })),
		queryClient.fetchQuery(itemsQueries.get({ type: 'containers' })),
		queryClient.fetchQuery(itemsQueries.get({ type: 'artefact' })),
		queryClient.fetchQuery(itemsQueries.get({ type: 'consumables' })),
	])

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<TTKView />
		</HydrationBoundary>
	)
}
