import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleQueries } from '@/queries/article/article.queries'
import ArticleView from '@/views/articles/ArticleView'

type PageProps = {
	params: Promise<{ id: string }>
}

export default async function PatchNotePage({ params }: PageProps) {
	const { id } = await params
	const queryClient = getQueryClient()

	try {
		await queryClient.fetchQuery(articleQueries.get(id))
	} catch {
		notFound()
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ArticleView articleId={id} />
		</HydrationBoundary>
	)
}
