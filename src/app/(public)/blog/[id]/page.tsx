import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { extractExcerpt } from '@/lib/blog-cover'
import { dynamicAlternates, dynamicTwitter } from '@/lib/seo'
import { getQueryClient } from '@/providers/QueryProvider'
import { articleQueries } from '@/queries/article/article.queries'
import { articleService } from '@/services/article/article.service'
import { articleImageUrl } from '@/types/article.type'
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
		const description = extractExcerpt(article.content ?? '', 160)
		const images = article.image_url
			? [
					{
						url: articleImageUrl(article.image_url),
						width: 1200,
						height: 630,
					},
				]
			: [
					{
						url: ogImageUrl,
						width: 1200,
						height: 630,
						type: 'image/svg+xml' as const,
					},
				]

		return {
			title: `${article.title} · StalHub`,
			description,
			alternates: dynamicAlternates(`/blog/${id}`),
			openGraph: {
				title: `${article.title} · StalHub`,
				description,
				url: `/blog/${id}`,
				type: 'article',
				publishedTime: article.created_at,
				modifiedTime: article.updated_at,
				authors: [article.author.username],
				tags: article.tags,
				images,
			},
			twitter: dynamicTwitter({
				title: `${article.title} · StalHub`,
				description,
				images: images.map((img) => img.url),
			}),
		}
	} catch {
		return {
			title: `${t('blog.title')} · StalHub`,
			robots: { index: false, follow: true },
		}
	}
}

export default async function BlogPostPage({ params }: PageProps) {
	const { id } = await params
	const queryClient = getQueryClient()

	try {
		await queryClient.fetchQuery(articleQueries.get(id))
	} catch {
		notFound()
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ArticleView
				articleId={id}
				backHref="/blog"
				backLabelKey="blog.back"
			/>
		</HydrationBoundary>
	)
}
