import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleQueries } from '@/queries/article/article.queries'
import ArticlesView from '@/views/articles/ArticlesView'

export const metadata: Metadata = {
	title: 'Статьи · StalHub',
	description: 'Публичные статьи сообщества StalHub',
}

export default async function ArticlesPage() {
	const queryClient = getQueryClient()

	await queryClient.prefetchQuery(articleQueries.publicList({ take: 20, page: 1 }))

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ArticlesView />
		</HydrationBoundary>
	)
}
