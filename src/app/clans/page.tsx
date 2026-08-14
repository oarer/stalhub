import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { clanQueries } from '@/queries/clan/clan.queries'
import ClanCatalogView from '@/views/clans/ClanCatalogView'

export default async function ClansPage() {
	const queryClient = getQueryClient()

	await queryClient.prefetchQuery(clanQueries.getPublicClans())

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ClanCatalogView />
		</HydrationBoundary>
	)
}
