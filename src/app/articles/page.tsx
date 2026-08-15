import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleQueries } from '@/queries/article/article.queries'
import ArticlesView from '@/views/articles/ArticlesView'

export default async function ArticlesPage() {
	const queryClient = getQueryClient()

	await queryClient.prefetchQuery(articleQueries.publicList({ take: 20, page: 1 }))

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ArticlesView />
		</HydrationBoundary>
	)
}
