import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { itemsQueries } from '@/queries/calcs/items.queries'
import { TTKView } from '@/views/calcs/ttk/TTKView'

export default async function TTKPage() {
	const queryClient = getQueryClient()

	await Promise.all([
		queryClient.query(itemsQueries.get({ type: 'weapons' })),
		queryClient.query(itemsQueries.get({ type: 'ammo' })),
		queryClient.query(itemsQueries.get({ type: 'plates' })),
		queryClient.query(itemsQueries.get({ type: 'armor' })),
		queryClient.query(itemsQueries.get({ type: 'containers' })),
		queryClient.query(itemsQueries.get({ type: 'artefact' })),
		queryClient.query(itemsQueries.get({ type: 'consumables' })),
	])

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<TTKView />
		</HydrationBoundary>
	)
}
