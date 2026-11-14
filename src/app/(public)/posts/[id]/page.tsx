import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { dynamicAlternates, dynamicTwitter } from '@/lib/seo'
import { getQueryClient } from '@/providers/QueryProvider'
import { postQueries } from '@/queries/post/post.queries'
import { postService } from '@/services/post/post.service'
import PostDetailView from '@/views/feed/PostDetailView'

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>
}): Promise<Metadata> {
	const { id } = await params
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stalhub.dev'
	try {
		const post = await postService.get(id)
		const title = `${post.title || 'Post'} · StalHub`
		const description = `★ ${post.stars_count} · 💬 ${post.comments_count ?? 0} · от @${post.author?.username ?? post.author_name ?? post.source}`
		const image = `${baseUrl}/api/og/post/${id}`
		return {
			title,
			description,
			alternates: dynamicAlternates(`/posts/${id}`),
			openGraph: {
				title,
				description,
				url: `${baseUrl}/posts/${id}`,
				type: 'article',
				images: [{ url: image, width: 1200, height: 630 }],
			},
			twitter: dynamicTwitter({ title, description, images: [image] }),
		}
	} catch {
		return {
			title: 'Пост не найден · StalHub',
			robots: { index: false, follow: true },
		}
	}
}

export default async function PostDetailPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	const queryClient = getQueryClient()
	try {
		await queryClient.fetchQuery(postQueries.get(id))
	} catch {
		notFound()
	}

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<PostDetailView id={id} />
		</HydrationBoundary>
	)
}
