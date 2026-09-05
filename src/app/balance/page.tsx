import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { balanceDiffQueries } from '@/queries/balance/balance.queries'
import BalanceView from '@/views/balance/BalanceView'

export default async function BalancePage() {
	const queryClient = getQueryClient()

	await queryClient.prefetchQuery(balanceDiffQueries.latest())

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<BalanceView />
		</HydrationBoundary>
	)
}
