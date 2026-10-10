import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import {
	articleJsonLd,
	breadcrumbJsonLd,
	JsonLd,
} from '@/components/seo/JsonLd'
import { SITE_META } from '@/constants/meta'
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

		const description = t('articles.byAuthor', {
			author: article.author.username,
		})
		const imageUrls = images.map((img) => img.url)

		return {
			title: `${article.title} · StalHub`,
			description,
			alternates: dynamicAlternates(`/articles/${id}`),
			openGraph: {
				title: `${article.title} · StalHub`,
				description,
				url: `/articles/${id}`,
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
				images: imageUrls,
			}),
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
		await queryClient.fetchQuery(articleQueries.get(id))
	} catch {
		notFound()
	}

	const article = queryClient.getQueryData<
		Awaited<ReturnType<typeof articleService.get>>
	>(articleQueries.get(id).queryKey)

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			{article ? (
				<>
					<JsonLd
						data={articleJsonLd({
							siteUrl: SITE_META.SITE_URL,
							path: `/articles/${id}`,
							headline: article.title,
							description: article.content?.slice(0, 160),
							datePublished: article.created_at,
							dateModified: article.updated_at,
							authorName: article.author?.username,
							tags: article.tags,
							image: article.image_url
								? articleImageUrl(article.image_url)
								: undefined,
						})}
					/>
					<JsonLd
						data={breadcrumbJsonLd(SITE_META.SITE_URL, [
							{ name: 'Статьи', path: '/articles' },
							{ name: article.title, path: `/articles/${id}` },
						])}
					/>
				</>
			) : null}
			<ArticleView articleId={id} />
		</HydrationBoundary>
	)
}
