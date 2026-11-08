import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { unoQueries } from '@/queries/uno/uno.queries'
import UnoClanView from '@/views/uno/UnoClanView'

type PageProps = { params: Promise<{ clanId: string }> }

export default async function UnoClanPage({ params }: PageProps) {
	const { clanId } = await params
	const queryClient = getQueryClient()
	await Promise.allSettled([
		queryClient.prefetchQuery(unoQueries.clan(clanId)),
		queryClient.prefetchQuery(unoQueries.analytics(clanId)),
	])

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<UnoClanView clanId={clanId} />
		</HydrationBoundary>
	)
}
