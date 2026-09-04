import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { serverOnlineQueries } from '@/queries/server-online/server-online.queries'
import ServerStatusView from '@/views/server-status/ServerStatusView'

export default async function ServerStatusPage() {
	const queryClient = getQueryClient()

	await Promise.allSettled([
		queryClient.prefetchQuery(serverOnlineQueries.latest()),
		queryClient.prefetchQuery(serverOnlineQueries.history(24)),
	])

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ServerStatusView />
		</HydrationBoundary>
	)
}
