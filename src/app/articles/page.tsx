import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleQueries } from '@/queries/article/article.queries'
import ArticlesView from '@/views/articles/ArticlesView'

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations()

	return {
		title: t('articles.metaTitle'),
		description: t('articles.metaDescription'),
	}
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
