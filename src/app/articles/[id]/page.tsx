import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleQueries } from '@/queries/article/article.queries'
import { articleService } from '@/services/article/article.service'
import ArticleView from '@/views/articles/ArticleView'

type PageProps = {
	params: Promise<{ id: string }>
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { id } = await params
	const t = await getTranslations()

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
	const ogImageUrl = `${baseUrl}/api/og/${id}`

	try {
		const article = await articleService.get(id)
		const images = article.image_url
			? [{ url: article.image_url, width: 1200, height: 630 }]
			: [
					{
						url: ogImageUrl,
						width: 1200,
						height: 630,
						type: 'image/svg+xml' as const,
					},
				]

		const description = t('articles.byAuthor', {
			author: article.author.username,
		})

		return {
			title: `${article.title} · StalHub`,
			description,
			openGraph: {
				title: `${article.title} · StalHub`,
				description,
				type: 'article',
				publishedTime: article.created_at,
				modifiedTime: article.updated_at,
				authors: [article.author.username],
				tags: article.tags,
				images,
			},
		}
	} catch {
		return {
			title: `${t('articles.notFound')} · StalHub`,
			robots: { index: false, follow: true },
		}
	}
}

export default async function ArticlePage({ params }: PageProps) {
	const { id } = await params

	const queryClient = getQueryClient()

	try {
		await queryClient.prefetchQuery(articleQueries.get(id))
	} catch {
		notFound()
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ArticleView articleId={id} />
		</HydrationBoundary>
	)
}
