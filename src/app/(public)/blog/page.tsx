import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleQueries } from '@/queries/article/article.queries'
import BlogView from '@/views/blog/BlogView'

export default async function BlogPage() {
	const queryClient = getQueryClient()

	await queryClient
		.fetchQuery(articleQueries.blogPosts({ take: 20, page: 1 }))
		.catch(() => null)

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<BlogView />
		</HydrationBoundary>
	)
}
