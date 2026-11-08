import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { unoQueries } from '@/queries/uno/uno.queries'
import UnoGridDetailView from '@/views/uno/UnoGridDetailView'

type PageProps = { params: Promise<{ gridId: string }> }

export default async function UnoGridDetailPage({ params }: PageProps) {
	const { gridId } = await params
	const queryClient = getQueryClient()
	await queryClient.prefetchQuery(unoQueries.grid(gridId))

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<UnoGridDetailView gridId={gridId} />
		</HydrationBoundary>
	)
}
