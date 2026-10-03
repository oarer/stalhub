import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleQueries } from '@/queries/article/article.queries'
import PatchNotesView from '@/views/patch-notes/PatchNotesView'

export default async function PatchNotesPage() {
	const queryClient = getQueryClient()

	await queryClient
		.fetchQuery(articleQueries.patchNotes({ take: 20, page: 1 }))
		.catch(() => null)

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<PatchNotesView />
		</HydrationBoundary>
	)
}
