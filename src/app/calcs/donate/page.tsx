import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { donateQueries } from '@/queries/donate/donate.queries'
import DonateCalcView from '@/views/calcs/donate/DonateCalcView'

export default async function Page() {
	const queryClient = getQueryClient()
	await queryClient.fetchQuery(donateQueries.get()).catch(() => null)
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<DonateCalcView />
		</HydrationBoundary>
	)
}
